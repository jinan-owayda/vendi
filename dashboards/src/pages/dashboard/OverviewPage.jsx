import React, { useEffect, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import { getVendorDashboardStats } from "../../services/dashboard";

function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 7.5 11 3l8 4.5M3 7.5V15l8 4 8-4V7.5M3 7.5 11 12m8-4.5L11 12m0 0V19" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 5h2l2.2 7.1a1 1 0 0 0 .95.7h6.9a1 1 0 0 0 .96-.74L19 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="17" r="1.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="17" r="1.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function RatingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 3.5l2.3 4.7 5.2.75-3.75 3.65.9 5.15L11 15.3l-4.65 2.45.9-5.15L3.5 8.95l5.2-.75L11 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3v16M15 7.5c0-1.66-1.79-3-4-3S7 5.84 7 7.5 8.79 10.5 11 10.5s4 1.34 4 3-1.79 3-4 3-4-1.34-4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function OverviewPage() {
  const [stats, setStats] = useState({
  total_products: 0,
  total_orders: 0,
  total_revenue: 0,
  store_rating: 0,
});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const data = await getVendorDashboardStats();
        const payload = data?.payload;

        setStats({
  total_products: payload?.total_products ?? 0,
  total_orders: payload?.total_orders ?? 0,
  total_revenue: payload?.total_revenue ?? 0,
  store_rating: payload?.store_rating ?? 0,
});
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div style={styles.page}>
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.cardsGrid}>
        <StatCard
          icon={<BoxIcon />}
          badge="Products"
          badgeType="accent"
          title="Total Products"
          value={loading ? "..." : stats.total_products}
          sub="All listed products"
        />

        <StatCard
          icon={<OrderIcon />}
          badge="Orders"
          badgeType="default"
          title="Total Orders"
          value={loading ? "..." : stats.total_orders}
          sub="All received orders"
        />

        <StatCard
          icon={<RevenueIcon />}
          badge="Revenue"
          badgeType="active"
          title="Total Revenue"
          value={loading ? "..." : `$${stats.total_revenue}`}
          sub="Total earnings"
          dark
        />

        <StatCard
  icon={<RatingIcon />}
  badge="Rating"
  badgeType="accent"
  title="Store Rating"
  value={loading ? "..." : `${stats.store_rating} / 5`}
  sub="Average store rating"
/>
      </div>
    </div>
  );
}

export default OverviewPage;

const styles = {
  page: {
    padding: "0 40px 40px",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 20,
  },
  errorBox: {
    marginBottom: 20,
    backgroundColor: "#fff0f0",
    border: "1px solid #f5c0c0",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13,
    color: "#c0392b",
  },
};