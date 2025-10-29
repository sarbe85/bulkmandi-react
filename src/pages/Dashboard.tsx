import AdminDashboard from "@/features/admin/pages/Dashboard";
import SellerDashboard from "@/features/seller/pages/Dashboard";
import { useAuth } from "@/shared/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!user) {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "SELLER":
      return <SellerDashboard />;
    case "BUYER":
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
          <p className="text-muted-foreground mt-2">Coming soon...</p>
        </div>
      );
    case "3PL":
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold">3PL Dashboard</h1>
          <p className="text-muted-foreground mt-2">Coming soon...</p>
        </div>
      );
    default:
      return <SellerDashboard />;
  }
};

export default Dashboard;
