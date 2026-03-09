import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { donations, claimDonation, markPickedUp } from "@/data/donationStore";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut, HandHeart, Package, MapPin, Clock, CheckCircle2, Truck } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [, setRefresh] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "volunteer") navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const availableDonations = donations.filter((d) => d.status === "available");
  const myClaimedDonations = donations.filter((d) => (d.status === "claimed" || d.status === "picked_up") && d.claimedBy === user.email);

  const handleClaim = (id: string) => {
    if (claimDonation(id, user.email, user.name)) {
      toast.success("Food claimed! Please pick it up from the restaurant.");
      setRefresh((r) => r + 1);
    }
  };

  const handlePickedUp = (id: string) => {
    if (markPickedUp(id)) {
      toast.success("Marked as picked up! Thank you for helping deliver food to those in need.");
      setRefresh((r) => r + 1);
    }
  };

  const handleLogout = () => {
    logout();
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
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Package, label: "Available Food", value: availableDonations.length, color: "text-primary" },
            { icon: HandHeart, label: "My Claims", value: myClaimedDonations.filter((d) => d.status === "claimed").length, color: "text-accent" },
            { icon: CheckCircle2, label: "Delivered", value: myClaimedDonations.filter((d) => d.status === "picked_up").length, color: "text-secondary" },
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

        {/* Available Food Cards */}
        <div>
          <h2 className="font-display font-bold text-xl text-foreground mb-4">🍲 Available Food for Pickup</h2>
          {availableDonations.length === 0 ? (
            <div className="bg-card rounded-xl p-8 shadow-card border border-border text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No food available right now. Check back later!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDonations.map((d) => (
                <div key={d.id} className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display font-semibold text-card-foreground text-lg">{d.foodItem}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{d.quantity} {d.unit}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Leaf className="w-4 h-4 text-primary" />
                      {d.restaurantName}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-destructive" />
                      {d.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-accent" />
                      Pickup by {d.pickupTime}
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

        {/* My Claims */}
        {myClaimedDonations.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-foreground mb-4">📦 My Claimed Pickups</h2>
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
                    {myClaimedDonations.map((d) => (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-card-foreground font-medium">{d.foodItem}</td>
                        <td className="px-6 py-3 text-sm text-card-foreground">{d.restaurantName}</td>
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
