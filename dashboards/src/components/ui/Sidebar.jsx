import React from "react";

const VENDOR_NAV_ITEMS = [
  {
    key: "overview",
    label: "Overview",
    path: "/dashboard/overview",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: "orders",
    label: "Orders",
    path: "/dashboard/orders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 3h2l2.4 7.59a1 1 0 0 0 .96.72h6.28a1 1 0 0 0 .97-.75L17 6H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7.5" cy="15.5" r="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13.5" cy="15.5" r="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: "inventory",
    label: "Inventory",
    path: "/dashboard/inventory",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 8h14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 2v4M12 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const ADMIN_NAV_ITEMS = [
  {
    key: "admin_users",
    label: "Users",
    path: "/dashboard/admin/users",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 14c.6-2 2.2-3 3.5-3s2.9 1 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 14c.35-1.35 1.4-2.1 2.5-2.1 1.1 0 2.15.75 2.5 2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "admin_stores",
    label: "Stores",
    path: "/dashboard/admin/stores",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 6.5h12V15H3V6.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 6.5 3.5 3h11L16 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 15v-4h4v4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: "admin_products",
    label: "Products",
    path: "/dashboard/admin/products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 6.5 9 3l6 3.5v5L9 15l-6-3.5v-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 6.5 9 10m6-3.5L9 10m0 0v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Sidebar({
  activeKey,
  onNavigate,
  onLogout,
  role = "vendor",
}) {
  const navItems = role === "admin" ? ADMIN_NAV_ITEMS : VENDOR_NAV_ITEMS;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandName}>Vendi Admin</span>
        <span style={styles.brandRole}>
          {role === "admin" ? "PLATFORM ADMIN" : "BOUTIQUE CURATOR"}
        </span>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const active = item.key === activeKey;

          return (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.path)}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : {}),
              }}
            >
              <span style={{ ...styles.navIcon, color: active ? "#9B4D52" : "#b0a9a0" }}>
                {item.icon}
              </span>
              <span style={{ color: active ? "#3a2a2a" : "#7a6f68" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div style={styles.logoutWrap}>
        <button onClick={onLogout} style={styles.logoutBtn}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M5.5 7.5h8M11 5l2.5 2.5L11 10" stroke="#9a8f88" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 2.5H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5" stroke="#9a8f88" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 200,
    minHeight: "100vh",
    backgroundColor: "#f5f0ea",
    display: "flex",
    flexDirection: "column",
    padding: "28px 0",
    flexShrink: 0,
    borderRight: "1px solid #ede8e0",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    padding: "0 24px 28px",
    borderBottom: "1px solid #ede8e0",
    marginBottom: 20,
  },
  brandName: {
    fontFamily: "'Georgia', serif",
    fontSize: 15,
    fontWeight: 700,
    color: "#3a2a2a",
    letterSpacing: "0.01em",
  },
  brandRole: {
    fontSize: 9,
    letterSpacing: "0.12em",
    color: "#9B4D52",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "0 12px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    width: "100%",
    textAlign: "left",
    transition: "background 0.15s",
  },
  navItemActive: {
    backgroundColor: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  navIcon: {
    display: "flex",
    alignItems: "center",
  },
  logoutWrap: {
    padding: "16px 20px 0",
    borderTop: "1px solid #ede8e0",
    marginTop: 8,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    color: "#9a8f88",
    padding: "6px 0",
    fontFamily: "inherit",
  },
};