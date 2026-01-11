import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API, useAuth } from "../App";
import {
  User,
  Package,
  Wallet,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const DashboardPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Loader2 className="w-5 h-5 text-white/40 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "cancelled":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-white/40 bg-white/5";
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
            MY <span className="gradient-text">DASHBOARD</span>
          </h1>
          <p className="text-white/50">
            Welcome back, {user?.name || "User"}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00f3ff]/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#00f3ff]" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Total Orders</p>
                <p className="font-orbitron text-2xl font-bold text-white">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#bc13fe]/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#bc13fe]" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Wallet Balance</p>
                <p className="font-orbitron text-2xl font-bold text-white">
                  ${user?.wallet_balance?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Completed</p>
                <p className="font-orbitron text-2xl font-bold text-white">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
              <TabsTrigger
                value="orders"
                className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white px-6 py-2"
                data-testid="tab-orders"
              >
                <Package className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white px-6 py-2"
                data-testid="tab-settings"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="spinner w-12 h-12"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-2xl">
                  <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="font-orbitron text-xl font-bold text-white mb-2">
                    No Orders Yet
                  </h3>
                  <p className="text-white/50 mb-6">
                    Start shopping to see your orders here
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/services")}
                    className="gradient-btn rounded-full px-8 text-black font-bold"
                  >
                    Browse Services
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.order_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-2xl p-6"
                      data-testid={`order-${order.order_id}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-orbitron text-white font-bold">
                              #{order.order_id.slice(-8).toUpperCase()}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-white/50 text-sm">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-white/50 text-sm">Items</p>
                            <p className="text-white font-medium">{order.items.length}</p>
                          </div>
                          <div>
                            <p className="text-white/50 text-sm">Total</p>
                            <p className="font-orbitron text-[#00f3ff] font-bold">
                              ${order.total_amount.toFixed(2)}
                            </p>
                          </div>
                          {getStatusIcon(order.status)}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-sm"
                            >
                              {item.name} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="glass-card rounded-2xl p-8">
                <h3 className="font-orbitron text-xl font-bold text-white mb-6">
                  ACCOUNT SETTINGS
                </h3>

                <div className="space-y-6">
                  {/* Profile Info */}
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00f3ff] to-[#bc13fe] flex items-center justify-center">
                      {user?.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user?.name}</p>
                      <p className="text-white/50">{user?.email}</p>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-white/60">Member Since</span>
                      <span className="text-white">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-white/60">Account Status</span>
                      <span className="text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-white/60">Wallet Balance</span>
                      <span className="font-orbitron text-[#00f3ff] font-bold">
                        ${user?.wallet_balance?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
