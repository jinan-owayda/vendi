import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/ui/Sidebar";
import TopBar from "../components/ui/TopBar";
import UserFooter from "../components/ui/UserFooter";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function getActiveKey(pathname) {
    if (pathname.includes("/dashboard/admin/users")) return "admin_users";
    if (pathname.includes("/dashboard/admin/stores")) return "admin_stores";
    if (pathname.includes("/dashboard/admin/products")) return "admin_products";
    if (pathname.includes("/dashboard/orders")) return "orders";
    if (pathname.includes("/dashboard/inventory")) return "inventory";
    return "overview";
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div style={styles.app}>
      <div style={styles.sidebarWrap}>
        <Sidebar
          role={user?.role}
          activeKey={getActiveKey(location.pathname)}
          onNavigate={navigate}
          onLogout={handleLogout}
        />

        <div style={{ paddingBottom: 20 }}>
          <UserFooter
            vendor={{
              name: user?.name,
              role: user?.role,
              avatar: user?.avatar || null,
            }}
          />
        </div>
      </div>

      <div style={styles.main}>
        <TopBar vendorName={user?.name} />
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f0ea",
  },
  sidebarWrap: {
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #ede8e0",
    backgroundColor: "#f5f0ea",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
};