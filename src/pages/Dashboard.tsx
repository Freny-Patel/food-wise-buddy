import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { foodData } from "@/data/foodData";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut, TrendingDown, ChefHat, AlertTriangle, Target } from "lucide-react";
import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const totalPrepared = foodData.reduce((s, r) => s + r.prepared, 0);
  const totalWasted = foodData.reduce((s, r) => s + r.wasted, 0);
  const wastePercent = ((totalWasted / totalPrepared) * 100).toFixed(1);
  const prediction = (totalPrepared / foodData.length).toFixed(1);

  // Chart data - aggregated by date
  const dateMap = new Map<string, { prepared: number; wasted: number }>();
  foodData.forEach((r) => {
    const existing = dateMap.get(r.date) || { prepared: 0, wasted: 0 };
    existing.prepared += r.prepared;
    existing.wasted += r.wasted;
    dateMap.set(r.date, existing);
  });
  const chartData = Array.from(dateMap.entries()).map(([date, vals]) => ({
    date: date.slice(5),
    ...vals,
  }));

  // Pie data
  const pieData = [
    { name: "Consumed", value: totalPrepared - totalWasted },
    { name: "Wasted", value: totalWasted },
  ];
  const PIE_COLORS = ["hsl(160, 60%, 40%)", "hsl(35, 90%, 55%)"];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = [
    { icon: ChefHat, label: "Total Prepared", value: `${totalPrepared} kg`, color: "text-primary" },
    { icon: AlertTriangle, label: "Total Wasted", value: `${totalWasted} kg`, color: "text-accent" },
    { icon: TrendingDown, label: "Waste %", value: `${wastePercent}%`, color: "text-destructive" },
    { icon: Target, label: "Predicted Daily", value: `${prediction} kg`, color: "text-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="hero-gradient px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-primary-foreground">EcoPlate Dashboard</h1>
              <p className="text-primary-foreground/70 text-sm">Welcome, {user.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
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

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border">
            <h3 className="font-display font-semibold text-lg text-card-foreground mb-4">Daily Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 88%)" />
                <XAxis dataKey="date" stroke="hsl(160, 10%, 45%)" fontSize={12} />
                <YAxis stroke="hsl(160, 10%, 45%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(150, 15%, 88%)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="prepared" fill="hsl(160, 60%, 40%)" radius={[4, 4, 0, 0]} name="Prepared" />
                <Bar dataKey="wasted" fill="hsl(35, 90%, 55%)" radius={[4, 4, 0, 0]} name="Wasted" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <h3 className="font-display font-semibold text-lg text-card-foreground mb-4">Waste Ratio</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-display font-semibold text-lg text-card-foreground">Food Data Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Food Item</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Prepared (kg)</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Wasted (kg)</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Waste %</th>
                </tr>
              </thead>
              <tbody>
                {foodData.map((row, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-card-foreground">{row.date}</td>
                    <td className="px-6 py-3 text-sm text-card-foreground font-medium">{row.food_item}</td>
                    <td className="px-6 py-3 text-sm text-card-foreground">{row.prepared}</td>
                    <td className="px-6 py-3 text-sm text-card-foreground">{row.wasted}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (row.wasted / row.prepared) * 100 > 30
                            ? "bg-destructive/10 text-destructive"
                            : (row.wasted / row.prepared) * 100 > 15
                            ? "bg-accent/10 text-accent"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {((row.wasted / row.prepared) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
