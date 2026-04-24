import React from "react";

export default function UserFooter({ vendor }) {
  const initials = vendor?.name
    ? vendor.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AC";

  return (
    <div style={styles.footer}>
      <div style={styles.avatarWrap}>
        {vendor?.avatar ? (
          <img src={vendor.avatar} alt="avatar" style={styles.avatar} />
        ) : (
          <div style={styles.avatarFallback}>{initials}</div>
        )}
      </div>
      <div>
        <div style={styles.name}>{vendor?.name ?? "Alex Curator"}</div>
        <div style={styles.role}>{vendor?.role ?? "Store Admin"}</div>
      </div>
    </div>
  );
}

const styles = {
  footer: {
    marginTop: "auto",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    flexShrink: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#9B4D52",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
  },
  name: {
    fontSize: 13,
    fontWeight: 600,
    color: "#3a2a2a",
  },
  role: {
    fontSize: 11,
    color: "#9a8f88",
    textTransform: "capitalize",
  },
};