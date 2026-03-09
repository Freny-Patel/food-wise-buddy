import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "restaurant") {
      navigate("/restaurant-dashboard");
    } else if (user.role === "volunteer") {
      navigate("/volunteer-dashboard");
    }
  }, [user, navigate]);

  return null;
};

export default Dashboard;
