import requests
import sys
import json
from datetime import datetime

class ECommerceAPITester:
    def __init__(self, base_url="https://futuristic-market-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            details = ""
            
            if not success:
                details = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'No error details')}"
                except:
                    details += f" - Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_seed_data(self):
        """Test seeding initial data"""
        return self.run_test("Seed Data", "POST", "seed", 200)

    def test_get_categories(self):
        """Test getting product categories"""
        return self.run_test("Get Categories", "GET", "categories", 200)

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test("Get All Products", "GET", "products", 200)
        if success and isinstance(response, list) and len(response) > 0:
            # Store first product ID for later tests
            self.product_id = response[0].get('product_id')
            print(f"   Found {len(response)} products")
            return True, response
        elif success and isinstance(response, list):
            print(f"   No products found")
            return True, response
        return success, response

    def test_get_single_product(self):
        """Test getting a single product"""
        if hasattr(self, 'product_id') and self.product_id:
            return self.run_test("Get Single Product", "GET", f"products/{self.product_id}", 200)
        else:
            self.log_test("Get Single Product", False, "No product ID available")
            return False, {}

    def test_register_user(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, user_data)
        
        if success and 'token' in response and 'user' in response:
            self.token = response['token']
            self.user_id = response['user']['user_id']
            print(f"   Registered user: {response['user']['email']}")
            return True, response
        
        return success, response

    def test_login_user(self):
        """Test user login with existing credentials"""
        # Use the same credentials from registration
        timestamp = datetime.now().strftime('%H%M%S')
        login_data = {
            "email": f"test{timestamp}@example.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if success and 'token' in response:
            # Don't overwrite token if we already have one from registration
            if not self.token:
                self.token = response['token']
                self.user_id = response['user']['user_id']
            return True, response
        
        return success, response

    def test_get_user_profile(self):
        """Test getting current user profile"""
        if not self.token:
            self.log_test("Get User Profile", False, "No authentication token")
            return False, {}
        
        return self.run_test("Get User Profile", "GET", "auth/me", 200)

    def test_get_cart(self):
        """Test getting user cart"""
        if not self.token:
            self.log_test("Get Cart", False, "No authentication token")
            return False, {}
        
        return self.run_test("Get Cart", "GET", "cart", 200)

    def test_add_to_cart(self):
        """Test adding item to cart"""
        if not self.token:
            self.log_test("Add to Cart", False, "No authentication token")
            return False, {}
        
        if not hasattr(self, 'product_id') or not self.product_id:
            self.log_test("Add to Cart", False, "No product ID available")
            return False, {}
        
        cart_item = {
            "product_id": self.product_id,
            "quantity": 2
        }
        
        return self.run_test("Add to Cart", "POST", "cart/add", 200, cart_item)

    def test_update_cart(self):
        """Test updating cart item quantity"""
        if not self.token:
            self.log_test("Update Cart", False, "No authentication token")
            return False, {}
        
        if not hasattr(self, 'product_id') or not self.product_id:
            self.log_test("Update Cart", False, "No product ID available")
            return False, {}
        
        cart_update = {
            "product_id": self.product_id,
            "quantity": 3
        }
        
        return self.run_test("Update Cart", "PUT", "cart/update", 200, cart_update)

    def test_remove_from_cart(self):
        """Test removing item from cart"""
        if not self.token:
            self.log_test("Remove from Cart", False, "No authentication token")
            return False, {}
        
        if not hasattr(self, 'product_id') or not self.product_id:
            self.log_test("Remove from Cart", False, "No product ID available")
            return False, {}
        
        return self.run_test("Remove from Cart", "DELETE", f"cart/remove/{self.product_id}", 200)

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Message",
            "message": "This is a test message from automated testing."
        }
        
        return self.run_test("Contact Form", "POST", "contact", 200, contact_data)

    def test_get_orders(self):
        """Test getting user orders"""
        if not self.token:
            self.log_test("Get Orders", False, "No authentication token")
            return False, {}
        
        return self.run_test("Get Orders", "GET", "orders", 200)

    def test_checkout_session_creation(self):
        """Test creating checkout session (will fail without items in cart)"""
        if not self.token:
            self.log_test("Create Checkout Session", False, "No authentication token")
            return False, {}
        
        # First add item to cart
        if hasattr(self, 'product_id') and self.product_id:
            cart_item = {
                "product_id": self.product_id,
                "quantity": 1
            }
            self.run_test("Add Item for Checkout", "POST", "cart/add", 200, cart_item)
        
        checkout_data = {
            "origin_url": self.base_url
        }
        
        success, response = self.run_test("Create Checkout Session", "POST", "checkout/create-session", 200, checkout_data)
        
        if success and 'url' in response:
            print(f"   Checkout URL created: {response['url'][:50]}...")
        
        return success, response

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting E-Commerce API Testing")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

        # Basic API tests (no auth required)
        self.test_health_check()
        self.test_seed_data()
        self.test_get_categories()
        self.test_get_products()
        self.test_get_single_product()
        self.test_contact_form()

        # Authentication tests
        self.test_register_user()
        self.test_get_user_profile()

        # Cart tests (require auth)
        self.test_get_cart()
        self.test_add_to_cart()
        self.test_update_cart()
        self.test_get_cart()  # Check cart after updates
        
        # Order tests
        self.test_get_orders()
        
        # Checkout test (requires items in cart)
        self.test_checkout_session_creation()
        
        # Clean up - remove items from cart
        self.test_remove_from_cart()

        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 FINAL RESULTS")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Return success if more than 80% tests pass
        return self.tests_passed / self.tests_run >= 0.8

def main():
    tester = ECommerceAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'failed_tests': tester.tests_run - tester.tests_passed,
                'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
            },
            'test_results': tester.test_results,
            'timestamp': datetime.now().isoformat()
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())