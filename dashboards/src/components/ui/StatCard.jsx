import React from "react";

export default function StatCard({
  icon,
  badge,
  badgeType = "default",
  title,
  value,
  sub,
  dark = false,
}) {
  const cardStyle = dark
    ? { ...styles.card, backgroundColor: "#9B4D52", color: "#fff" }
    : styles.card;

  const titleStyle = dark ? { ...styles.title, color: "rgba(255,255,255,0.75)" } : styles.title;
  const valueStyle = dark ? { ...styles.value, color: "#fff" } : styles.value;
  const subStyle = dark ? { ...styles.sub, color: "rgba(255,255,255,0.65)" } : styles.sub;

  const badgeColors = {
    default: { bg: "#f0ebe4", color: "#4a7c4a" },
    active: { bg: "#e8f5e8", color: "#3a6a3a" },
    accent: { bg: "#f5ede8", color: "#9B4D52" },
  };

  const badgeStyle = {
    ...styles.badge,
    backgroundColor: badgeColors[badgeType]?.bg ?? badgeColors.default.bg,
    color: badgeColors[badgeType]?.color ?? badgeColors.default.color,
  };

  return (
    <div style={cardStyle}>
      <div style={styles.topRow}>
        <div style={{ ...styles.iconWrap, color: dark ? "#fff" : "#9B4D52" }}>{icon}</div>
        {badge && <span style={badgeStyle}>{badge}</span>}
      </div>

      <div style={titleStyle}>{title}</div>
      <div style={valueStyle}>{value}</div>
      {sub && <div style={subStyle}>{sub}</div>}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 0,
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 9px",
    borderRadius: 20,
    letterSpacing: "0.01em",
  },
  title: {
    fontSize: 13,
    color: "#7a6f68",
    fontWeight: 400,
  },
  value: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1a1310",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  sub: {
    fontSize: 12,
    color: "#9a8f88",
  },
};