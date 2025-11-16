import AdminDashboard from "@/features/admin/pages/Dashboard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { getCurrentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    // Redirect to role-specific dashboards
    if (user?.role === "SELLER") {
      navigate("/seller/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  if (!user) {
    return null;
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "SELLER":
      // Will redirect via useEffect
      return null;
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
      return null;
  }
};

export default Dashboard;
