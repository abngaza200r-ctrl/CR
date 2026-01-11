from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'mohamed-arqoub-digital-store-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# Create the main app
app = FastAPI(title="Mohamed Arqoub Digital Store API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    wallet_balance: float = 0.0
    created_at: datetime

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    name: str
    description: str
    short_description: str
    price: float
    category: str
    image_url: str
    delivery_info: str
    features: List[str] = []
    faqs: List[Dict[str, str]] = []
    rating: float = 4.5
    reviews_count: int = 0
    in_stock: bool = True
    created_at: datetime

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image_url: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str
    user_id: str
    items: List[Dict[str, Any]]
    total_amount: float
    status: str = "pending"
    payment_status: str = "pending"
    session_id: Optional[str] = None
    created_at: datetime

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class CheckoutRequest(BaseModel):
    origin_url: str

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> Optional[dict]:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Then check Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    try:
        # First try JWT token
        payload = jwt.decode(session_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if user:
            return user
    except jwt.InvalidTokenError:
        pass
    
    # Then try session token (for Google OAuth)
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at > datetime.now(timezone.utc):
            user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
            return user
    
    return None

async def require_auth(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "picture": None,
        "wallet_balance": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create cart for user
    await db.carts.insert_one({"user_id": user_id, "items": []})
    
    token = create_token(user_id)
    user_doc.pop("password")
    user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return {"token": token, "user": user_doc}

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"])
    user.pop("password", None)
    if isinstance(user["created_at"], str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    
    return {"token": token, "user": user}

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process Emergent OAuth session_id and create local session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Fetch user data from Emergent Auth
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_data = resp.json()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": user_data["name"], "picture": user_data.get("picture")}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "wallet_balance": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        await db.carts.insert_one({"user_id": user_id, "items": []})
    
    # Store session token
    session_token = user_data["session_token"]
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    if isinstance(user["created_at"], str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    
    return {"user": user, "token": session_token}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(require_auth)):
    if isinstance(user["created_at"], str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}

# ============== PRODUCTS ROUTES ==============

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    for p in products:
        if isinstance(p.get("created_at"), str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get("created_at"), str):
        product["created_at"] = datetime.fromisoformat(product["created_at"])
    return product

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct("category")
    return categories

# ============== CART ROUTES ==============

@api_router.get("/cart", response_model=List[CartItemResponse])
async def get_cart(user: dict = Depends(require_auth)):
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not cart:
        return []
    
    items = []
    for item in cart.get("items", []):
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            items.append({
                "product_id": item["product_id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": item["quantity"],
                "image_url": product["image_url"]
            })
    return items

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, user: dict = Depends(require_auth)):
    cart = await db.carts.find_one({"user_id": user["user_id"]})
    if not cart:
        await db.carts.insert_one({"user_id": user["user_id"], "items": [item.model_dump()]})
    else:
        # Check if item exists
        existing = next((i for i in cart["items"] if i["product_id"] == item.product_id), None)
        if existing:
            await db.carts.update_one(
                {"user_id": user["user_id"], "items.product_id": item.product_id},
                {"$inc": {"items.$.quantity": item.quantity}}
            )
        else:
            await db.carts.update_one(
                {"user_id": user["user_id"]},
                {"$push": {"items": item.model_dump()}}
            )
    return {"message": "Item added to cart"}

@api_router.put("/cart/update")
async def update_cart_item(item: CartItem, user: dict = Depends(require_auth)):
    if item.quantity <= 0:
        await db.carts.update_one(
            {"user_id": user["user_id"]},
            {"$pull": {"items": {"product_id": item.product_id}}}
        )
    else:
        await db.carts.update_one(
            {"user_id": user["user_id"], "items.product_id": item.product_id},
            {"$set": {"items.$.quantity": item.quantity}}
        )
    return {"message": "Cart updated"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, user: dict = Depends(require_auth)):
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    return {"message": "Item removed"}

@api_router.delete("/cart/clear")
async def clear_cart(user: dict = Depends(require_auth)):
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"items": []}}
    )
    return {"message": "Cart cleared"}

# ============== CHECKOUT & PAYMENT ROUTES ==============

@api_router.post("/checkout/create-session")
async def create_checkout_session(checkout_req: CheckoutRequest, request: Request, user: dict = Depends(require_auth)):
    # Get cart items
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total from database (prevent price manipulation)
    total = 0.0
    order_items = []
    for item in cart["items"]:
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            item_total = product["price"] * item["quantity"]
            total += item_total
            order_items.append({
                "product_id": item["product_id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": item["quantity"]
            })
    
    if total <= 0:
        raise HTTPException(status_code=400, detail="Invalid cart total")
    
    # Create order
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "user_id": user["user_id"],
        "items": order_items,
        "total_amount": total,
        "status": "pending",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    
    # Create Stripe checkout session
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{checkout_req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/cart"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(total),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": order_id, "user_id": user["user_id"]}
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Update order with session_id
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"session_id": session.session_id}}
    )
    
    # Create payment transaction record
    await db.payment_transactions.insert_one({
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "order_id": order_id,
        "user_id": user["user_id"],
        "session_id": session.session_id,
        "amount": total,
        "currency": "usd",
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id, "order_id": order_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request, user: dict = Depends(require_auth)):
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction and order
    if status.payment_status == "paid":
        # Check if already processed
        txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if txn and txn.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            await db.orders.update_one(
                {"session_id": session_id},
                {"$set": {"status": "completed", "payment_status": "paid"}}
            )
            # Clear cart
            await db.carts.update_one(
                {"user_id": user["user_id"]},
                {"$set": {"items": []}}
            )
    elif status.status == "expired":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "expired"}}
        )
        await db.orders.update_one(
            {"session_id": session_id},
            {"$set": {"status": "cancelled", "payment_status": "expired"}}
        )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
            if txn and txn.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "paid"}}
                )
                await db.orders.update_one(
                    {"session_id": session_id},
                    {"$set": {"status": "completed", "payment_status": "paid"}}
                )
                # Clear user cart
                order = await db.orders.find_one({"session_id": session_id}, {"_id": 0})
                if order:
                    await db.carts.update_one(
                        {"user_id": order["user_id"]},
                        {"$set": {"items": []}}
                    )
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error"}

# ============== ORDERS ROUTES ==============

@api_router.get("/orders", response_model=List[Order])
async def get_orders(user: dict = Depends(require_auth)):
    orders = await db.orders.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for o in orders:
        if isinstance(o.get("created_at"), str):
            o["created_at"] = datetime.fromisoformat(o["created_at"])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, user: dict = Depends(require_auth)):
    order = await db.orders.find_one(
        {"order_id": order_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order.get("created_at"), str):
        order["created_at"] = datetime.fromisoformat(order["created_at"])
    return order

# ============== CONTACT ROUTES ==============

@api_router.post("/contact")
async def submit_contact(message: ContactMessage):
    doc = {
        "message_id": f"msg_{uuid.uuid4().hex[:12]}",
        **message.model_dump(),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(doc)
    return {"message": "Message sent successfully"}

# ============== USER PROFILE ROUTES ==============

@api_router.put("/user/profile")
async def update_profile(request: Request, user: dict = Depends(require_auth)):
    body = await request.json()
    allowed_fields = ["name", "picture"]
    updates = {k: v for k, v in body.items() if k in allowed_fields}
    
    if updates:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": updates}
        )
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password": 0})
    return updated_user

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_data():
    """Seed initial product data"""
    existing = await db.products.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    products = [
        # Social Media Services
        {
            "product_id": "prod_instagram_followers",
            "name": "Instagram Followers Package",
            "description": "Boost your Instagram presence with high-quality followers. Our service delivers real, active followers to your account within 24-48 hours. Perfect for influencers, businesses, and personal brands looking to expand their reach.",
            "short_description": "Get 1000+ real Instagram followers",
            "price": 29.99,
            "category": "social_media",
            "image_url": "https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Delivery within 24-48 hours after order confirmation",
            "features": ["100% Real Followers", "No Password Required", "24/7 Support", "Refill Guarantee"],
            "faqs": [
                {"question": "How long does delivery take?", "answer": "Orders are typically delivered within 24-48 hours."},
                {"question": "Is this safe for my account?", "answer": "Yes, we use safe and organic methods."},
                {"question": "Do I need to share my password?", "answer": "No, we only need your username."}
            ],
            "rating": 4.8,
            "reviews_count": 1250,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": "prod_tiktok_views",
            "name": "TikTok Views Booster",
            "description": "Supercharge your TikTok videos with thousands of views. Our premium service helps your content reach more audiences and potentially go viral. Ideal for content creators and marketers.",
            "short_description": "10K+ views for your TikTok videos",
            "price": 19.99,
            "category": "social_media",
            "image_url": "https://images.unsplash.com/photo-1596558450268-9c27524ba856?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Instant to 12 hours delivery",
            "features": ["High Retention Views", "Real Traffic", "Fast Delivery", "Split Available"],
            "faqs": [
                {"question": "Will views drop?", "answer": "We guarantee stable views with minimal drop."},
                {"question": "Can I split views across videos?", "answer": "Yes, contact support after purchase."}
            ],
            "rating": 4.7,
            "reviews_count": 890,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": "prod_youtube_subscribers",
            "name": "YouTube Subscribers Pack",
            "description": "Grow your YouTube channel with genuine subscribers. Our service helps you reach monetization requirements faster and build a loyal audience base.",
            "short_description": "500+ YouTube subscribers",
            "price": 49.99,
            "category": "social_media",
            "image_url": "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Gradual delivery over 3-7 days",
            "features": ["Real Subscribers", "Monetization Safe", "Lifetime Guarantee", "Gradual Delivery"],
            "faqs": [
                {"question": "Will this affect monetization?", "answer": "Our subscribers are real and safe for monetization."},
                {"question": "How fast is delivery?", "answer": "We deliver gradually over 3-7 days for safety."}
            ],
            "rating": 4.6,
            "reviews_count": 654,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Digital Accounts
        {
            "product_id": "prod_spotify_premium",
            "name": "Spotify Premium Account",
            "description": "Enjoy ad-free music streaming with Spotify Premium. Access millions of songs, create playlists, and download music for offline listening. Perfect for music lovers.",
            "short_description": "12 months Spotify Premium access",
            "price": 39.99,
            "category": "digital_accounts",
            "image_url": "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Instant delivery via email",
            "features": ["Ad-Free Music", "Offline Downloads", "High Quality Audio", "12 Months Access"],
            "faqs": [
                {"question": "How do I receive my account?", "answer": "Login credentials sent via email instantly."},
                {"question": "Is this a shared account?", "answer": "No, you get your own private account."}
            ],
            "rating": 4.9,
            "reviews_count": 2100,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": "prod_netflix_premium",
            "name": "Netflix Premium Subscription",
            "description": "Stream unlimited movies and TV shows with Netflix Premium. Watch on multiple devices, enjoy 4K Ultra HD quality, and access the entire Netflix library.",
            "short_description": "6 months Netflix Premium 4K",
            "price": 54.99,
            "category": "digital_accounts",
            "image_url": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Instant delivery via email",
            "features": ["4K Ultra HD", "Multiple Screens", "All Content Access", "6 Months Duration"],
            "faqs": [
                {"question": "Can I use on my TV?", "answer": "Yes, works on all Netflix-supported devices."},
                {"question": "Is this renewable?", "answer": "Contact us before expiry for renewal offers."}
            ],
            "rating": 4.8,
            "reviews_count": 1876,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": "prod_canva_pro",
            "name": "Canva Pro Lifetime",
            "description": "Unlock all premium features of Canva with a lifetime subscription. Access millions of templates, photos, videos, and design tools for your creative projects.",
            "short_description": "Lifetime Canva Pro access",
            "price": 34.99,
            "category": "digital_accounts",
            "image_url": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Account access within 1-2 hours",
            "features": ["Lifetime Access", "Premium Templates", "Brand Kit", "Background Remover"],
            "faqs": [
                {"question": "Is this really lifetime?", "answer": "Yes, one-time purchase for permanent access."},
                {"question": "Can I use for commercial projects?", "answer": "Yes, full commercial license included."}
            ],
            "rating": 4.9,
            "reviews_count": 3200,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Gaming Credits
        {
            "product_id": "prod_valorant_points",
            "name": "Valorant Points Bundle",
            "description": "Get Valorant Points to unlock premium skins, agents, and battle passes. Level up your gaming experience with exclusive in-game content.",
            "short_description": "2150 VP Valorant Points",
            "price": 24.99,
            "category": "gaming",
            "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Code delivered within 30 minutes",
            "features": ["2150 VP", "All Regions", "Instant Code", "Secure Transaction"],
            "faqs": [
                {"question": "Which regions are supported?", "answer": "We support all regions worldwide."},
                {"question": "How do I redeem?", "answer": "Redeem code in the Valorant store."}
            ],
            "rating": 4.7,
            "reviews_count": 980,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": "prod_roblox_robux",
            "name": "Roblox Robux Package",
            "description": "Purchase Robux for Roblox to buy avatar items, accessories, and game passes. Perfect for gamers who want to customize their experience.",
            "short_description": "4500 Robux gift card",
            "price": 49.99,
            "category": "gaming",
            "image_url": "https://images.unsplash.com/photo-1493711662062-fa541f7f5d06?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Gift card code via email instantly",
            "features": ["4500 Robux", "Digital Gift Card", "Global Valid", "No Expiry"],
            "faqs": [
                {"question": "Does the code expire?", "answer": "No, Roblox gift cards don't expire."},
                {"question": "Can I gift this to someone?", "answer": "Yes, just share the code."}
            ],
            "rating": 4.8,
            "reviews_count": 1540,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": "prod_steam_wallet",
            "name": "Steam Wallet Card",
            "description": "Add funds to your Steam Wallet and buy any game, DLC, or in-game items from the Steam store. The perfect gift for PC gamers.",
            "short_description": "$50 Steam Wallet code",
            "price": 52.99,
            "category": "gaming",
            "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Instant code delivery",
            "features": ["$50 Value", "Works Globally", "Buy Any Game", "Never Expires"],
            "faqs": [
                {"question": "Is this region locked?", "answer": "Works in most regions, check Steam support for specifics."},
                {"question": "Can I use for Steam Market?", "answer": "Yes, use for any Steam purchase."}
            ],
            "rating": 4.9,
            "reviews_count": 2890,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Digital Currency
        {
            "product_id": "prod_paypal_funds",
            "name": "PayPal Balance Top-Up",
            "description": "Instant PayPal balance addition service. Perfect for online purchases, freelancers, and international transactions.",
            "short_description": "$100 PayPal balance",
            "price": 109.99,
            "category": "digital_currency",
            "image_url": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Transfer within 1-4 hours",
            "features": ["$100 Balance", "Verified Transfer", "All Countries", "Safe & Secure"],
            "faqs": [
                {"question": "How is the transfer made?", "answer": "Direct PayPal transfer to your account."},
                {"question": "Is this reversible?", "answer": "No, once transferred it's permanent."}
            ],
            "rating": 4.6,
            "reviews_count": 456,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": "prod_amazon_giftcard",
            "name": "Amazon Gift Card",
            "description": "Shop for anything on Amazon with this digital gift card. Perfect for gifts or personal shopping on the world's largest online marketplace.",
            "short_description": "$100 Amazon eGift card",
            "price": 104.99,
            "category": "digital_currency",
            "image_url": "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Instant email delivery",
            "features": ["$100 Value", "No Expiry", "Email Delivery", "Works on Amazon.com"],
            "faqs": [
                {"question": "Which Amazon site does this work on?", "answer": "Amazon.com (US). Contact for other regions."},
                {"question": "Can I use partial amounts?", "answer": "Yes, remaining balance stays in your account."}
            ],
            "rating": 4.9,
            "reviews_count": 3450,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": "prod_google_play",
            "name": "Google Play Credit",
            "description": "Purchase apps, games, movies, books, and more from the Google Play Store. Universal digital currency for Android users.",
            "short_description": "$50 Google Play gift code",
            "price": 52.99,
            "category": "digital_currency",
            "image_url": "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?auto=format&fit=crop&q=80&w=800",
            "delivery_info": "Code delivered instantly",
            "features": ["$50 Credit", "All Content Types", "No Expiry", "Instant Delivery"],
            "faqs": [
                {"question": "Can I use for in-app purchases?", "answer": "Yes, works for all Google Play purchases."},
                {"question": "Region restrictions?", "answer": "US Google Play accounts only."}
            ],
            "rating": 4.8,
            "reviews_count": 1780,
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    return {"message": f"Seeded {len(products)} products"}

# ============== HEALTH CHECK ==============

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
