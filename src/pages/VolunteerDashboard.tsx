import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut, HandHeart, Package, MapPin, Clock, CheckCircle2, Truck } from "lucide-react";
import { toast } from "sonner";

interface FoodPost {
  id: string;
  restaurant_name: string;
  food_item: string;
  quantity: number;
  unit: string;
  location: string;
  pickup_time: string;
  status: string;
  claimed_by: string | null;
  claimed_by_name: string | null;
  created_at: string;
}

const VolunteerDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [available, setAvailable] = useState<FoodPost[]>([]);
  const [myClaims, setMyClaims] = useState<FoodPost[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "volunteer")) navigate("/login");
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;
    const [availRes, claimsRes] = await Promise.all([
      supabase.from("food_posts").select("*").eq("status", "available").order("created_at", { ascending: false }),
      supabase.from("food_posts").select("*").eq("claimed_by", user.id).in("status", ["claimed", "picked_up"]).order("created_at", { ascending: false }),
    ]);
    if (availRes.data) setAvailable(availRes.data as FoodPost[]);
    if (claimsRes.data) setMyClaims(claimsRes.data as FoodPost[]);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  if (authLoading || !user) return null;

  const handleClaim = async (id: string) => {
    const { error } = await supabase
      .from("food_posts")
      .update({ status: "claimed", claimed_by: user.id, claimed_by_name: user.name })
      .eq("id", id)
      .eq("status", "available");
    if (!error) {
      toast.success("Food claimed! Please pick it up from the restaurant.");
      fetchData();
    }
  };

  const handlePickedUp = async (id: string) => {
    const { error } = await supabase
      .from("food_posts")
      .update({ status: "picked_up" })
      .eq("id", id)
      .eq("status", "claimed");
    if (!error) {
      toast.success("Marked as picked up! Thank you for delivering food.");
      fetchData();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="warm-gradient px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <HandHeart className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-accent-foreground">Volunteer Dashboard</h1>
              <p className="text-accent-foreground/70 text-sm">Welcome, {user.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-accent-foreground hover:bg-accent-foreground/10">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Package, label: "Available Food", value: available.length, color: "text-primary" },
            { icon: HandHeart, label: "My Claims", value: myClaims.filter((d) => d.status === "claimed").length, color: "text-accent" },
            { icon: CheckCircle2, label: "Delivered", value: myClaims.filter((d) => d.status === "picked_up").length, color: "text-secondary" },
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

        <div>
          <h2 className="font-display font-bold text-xl text-foreground mb-4">🍲 Available Food for Pickup</h2>
          {available.length === 0 ? (
            <div className="bg-card rounded-xl p-8 shadow-card border border-border text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No food available right now. Check back later!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {available.map((d) => (
                <div key={d.id} className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display font-semibold text-card-foreground text-lg">{d.food_item}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{d.quantity} {d.unit}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Leaf className="w-4 h-4 text-primary" />
                      {d.restaurant_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-destructive" />
                      {d.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-accent" />
                      Pickup by {d.pickup_time}
                    </div>
                  </div>
                  <Button variant="hero" className="w-full" onClick={() => handleClaim(d.id)}>
                    <HandHeart className="w-4 h-4 mr-2" /> Claim & Deliver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {myClaims.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-foreground mb-4">📦 My Claims & Delivery History</h2>
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Food Item</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Restaurant</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Location</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myClaims.map((d) => (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-card-foreground font-medium">{d.food_item}</td>
                        <td className="px-6 py-3 text-sm text-card-foreground">{d.restaurant_name}</td>
                        <td className="px-6 py-3 text-sm text-card-foreground">{d.location}</td>
                        <td className="px-6 py-3 text-sm">
                          {d.status === "claimed" ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">Claimed</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">Delivered ✓</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {d.status === "claimed" && (
                            <Button size="sm" variant="outline" onClick={() => handlePickedUp(d.id)} className="gap-1">
                              <Truck className="w-3 h-3" /> Mark Delivered
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VolunteerDashboard;
