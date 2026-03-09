import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroPattern from "@/assets/hero-pattern.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">EcoPlate</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="hero" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Leaf className="w-4 h-4" />
              Smart Food Waste Tracking
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-extrabold text-foreground leading-tight">
              Reduce Food Waste,{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-eco)" }}>
                Save the Planet
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Track, analyze, and predict food consumption patterns. Make data-driven decisions to minimize waste and maximize efficiency.
            </p>
            <div className="flex gap-4">
              <Link to="/register">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Start Tracking
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="hero-outline" size="lg" className="text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center animate-float">
            <img
              src={heroPattern}
              alt="Eco food illustration"
              className="w-[400px] h-[400px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </main>

      {/* Stats bar */}
      <div className="glass border-t py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "40%", label: "Avg Waste Reduction" },
            { value: "10K+", label: "Meals Tracked" },
            { value: "99%", label: "Prediction Accuracy" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-display font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
