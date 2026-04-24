import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function GuestRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/dashboard/admin/users" replace />;
    }

    return <Navigate to="/dashboard/overview" replace />;
  }

  return children;
}

export default GuestRoute;