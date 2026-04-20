import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, LogOut, Plus, Package, Clock, MapPin, CheckCircle2, X, Loader2 } from "lucide-react";
import WastagePrediction from "@/components/WastagePrediction";

interface FoodPost {
  id: string;
  food_item: string;
  quantity: number;
  unit: string;
  location: string;
  pickup_time: string;
  status: string;
  claimed_by_name: string | null;
  created_at: string;
}

const RestaurantDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [foodItem, setFoodItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [location, setLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "restaurant")) navigate("/login");
  }, [user, authLoading, navigate]);

  const fetchPosts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("food_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setPosts(data as FoodPost[]);
  };

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  if (authLoading || !user) return null;

  const totalPosted = posts.length;
  const totalClaimed = posts.filter((d) => d.status === "claimed" || d.status === "picked_up").length;
  const totalAvailable = posts.filter((d) => d.status === "available").length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("food_posts").insert({
      user_id: user.id,
      restaurant_name: user.name,
      food_item: foodItem,
      quantity: Number(quantity),
      unit,
      location,
      pickup_time: pickupTime,
    });
    setFoodItem("");
    setQuantity("");
    setLocation("");
    setPickupTime("");
    setShowForm(false);
    setSubmitting(false);
    fetchPosts();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Available</span>;
      case "claimed":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">Claimed</span>;
      case "picked_up":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">Picked Up</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="hero-gradient px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-primary-foreground">Restaurant Dashboard</h1>
              <p className="text-primary-foreground/70 text-sm">{user.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Package, label: "Total Posted", value: totalPosted, color: "text-primary" },
            { icon: Clock, label: "Available", value: totalAvailable, color: "text-accent" },
            { icon: CheckCircle2, label: "Claimed/Picked Up", value: totalClaimed, color: "text-secondary" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl p-5 shadow-card border border-border animate-scale-in">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-display font-bold text-card-foreground">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="hero" onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Post Surplus Food"}
        </Button>

        {showForm && (
          <div className="bg-card rounded-xl p-6 shadow-card border border-border animate-fade-up">
            <h3 className="font-display font-semibold text-lg text-card-foreground mb-4">Post Surplus Food</h3>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foodItem">Food Item</Label>
                <Input id="foodItem" placeholder="e.g. Cooked Rice" value={foodItem} onChange={(e) => setFoodItem(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex gap-2">
                  <Input id="quantity" type="number" placeholder="10" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="flex-1" />
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="kg">kg</option>
                    <option value="pieces">pieces</option>
                    <option value="liters">liters</option>
                    <option value="plates">plates</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Pickup Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="location" placeholder="MG Road, Bangalore" className="pl-10" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupTime">Available Until</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="pickupTime" type="datetime-local" className="pl-10" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="hero" className="w-full sm:w-auto" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Post Food
                </Button>
              </div>
            </form>
          </div>
        )}

        <WastagePrediction posts={posts} />

        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-display font-semibold text-lg text-card-foreground">My Posted Food & History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Food Item</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Pickup By</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Claimed By</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No food posted yet. Click "Post Surplus Food" to get started.</td>
                  </tr>
                ) : (
                  posts.map((d) => (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-card-foreground font-medium">{d.food_item}</td>
                      <td className="px-6 py-3 text-sm text-card-foreground">{d.quantity} {d.unit}</td>
                      <td className="px-6 py-3 text-sm text-card-foreground">{d.location}</td>
                      <td className="px-6 py-3 text-sm text-card-foreground">{d.pickup_time}</td>
                      <td className="px-6 py-3 text-sm">{statusBadge(d.status)}</td>
                      <td className="px-6 py-3 text-sm text-card-foreground">{d.claimed_by_name || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RestaurantDashboard;
