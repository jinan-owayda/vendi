import React, { useEffect, useRef, useState } from "react";
import {
  getVendorNotifications,
  markNotificationAsRead,
} from "../../services/notifications";

function BellIcon({ hasUnread = false }) {
  return (
    <div style={{ position: "relative", display: "flex" }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z"
          stroke="#7a6f68"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 16.5a1.5 1.5 0 0 0 3 0"
          stroke="#7a6f68"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {hasUnread && <span style={styles.redDot} />}
    </div>
  );
}

export default function TopBar({ vendorName }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const firstName = vendorName?.split(" ")[0] ?? "there";

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await getVendorNotifications();
      setNotifications(data?.payload ?? []);
    } catch (err) {
      console.log("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleNotificationClick(notification) {
    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );
      }
    } catch (err) {
      console.log("Failed to mark notification as read:", err);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <h1 style={styles.greeting}>
          {greeting}, {firstName}
        </h1>
        <p style={styles.subtitle}>Here is what&apos;s happening with Vendi today.</p>
      </div>

      <div style={styles.right}>
        <div style={styles.searchWrap}>
          <svg
            style={styles.searchIcon}
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="#aaa" strokeWidth="1.5" />
            <path d="M10.5 10.5l3 3" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            style={styles.searchInput}
          />
        </div>

        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button style={styles.bell} onClick={() => setOpen((prev) => !prev)}>
            <BellIcon hasUnread={unreadCount > 0} />
          </button>

          {open && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={styles.unreadBadge}>{unreadCount} new</span>
                )}
              </div>

              {loading ? (
                <div style={styles.emptyState}>Loading...</div>
              ) : notifications.length === 0 ? (
                <div style={styles.emptyState}>No notifications</div>
              ) : (
                <div style={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        ...styles.notificationItem,
                        ...(notification.is_read
                          ? styles.notificationRead
                          : styles.notificationUnread),
                      }}
                    >
                      <div style={styles.notificationTop}>
                        <span style={styles.notificationTitle}>
                          {notification.title}
                        </span>
                        {!notification.is_read && <span style={styles.notificationDot} />}
                      </div>

                      <div style={styles.notificationMessage}>
                        {notification.message}
                      </div>

                      <div style={styles.notificationTime}>
                        {formatDate(notification.created_at)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "32px 40px 20px",
    backgroundColor: "#f5f0ea",
  },
  left: {},
  greeting: {
    fontFamily: "'Georgia', serif",
    fontSize: 30,
    fontWeight: 700,
    color: "#9B4D52",
    margin: 0,
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#7a6f68",
    margin: "5px 0 0",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    paddingTop: 4,
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    pointerEvents: "none",
  },
  searchInput: {
    padding: "9px 16px 9px 34px",
    borderRadius: 24,
    border: "1.5px solid #ddd6cc",
    backgroundColor: "#fff",
    fontSize: 13,
    color: "#3a2a2a",
    outline: "none",
    width: 200,
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  bell: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  redDot: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#d64545",
  },
  dropdown: {
    position: "absolute",
    top: 42,
    right: 0,
    width: 340,
    backgroundColor: "#fff",
    border: "1px solid #eadfd7",
    borderRadius: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    overflow: "hidden",
    zIndex: 999,
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid #f1ece8",
    backgroundColor: "#fcfaf8",
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#453d39",
  },
  unreadBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: "#9B4D52",
    backgroundColor: "#f7e7e8",
    padding: "4px 8px",
    borderRadius: 999,
  },
  notificationsList: {
    maxHeight: 360,
    overflowY: "auto",
  },
  notificationItem: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "none",
    padding: "14px 16px",
    borderBottom: "1px solid #f4efea",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  notificationUnread: {
    backgroundColor: "#f3cec6ff",
  },
  notificationRead: {
    backgroundColor: "#fff",
    opacity: 0.85,
  },
  notificationTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#4a413d",
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#d64545",
    flexShrink: 0,
  },
  notificationMessage: {
    fontSize: 12,
    color: "#6b635d",
    lineHeight: 1.5,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 11,
    color: "#9a918b",
  },
  emptyState: {
    padding: "18px 16px",
    fontSize: 13,
    color: "#7a6f68",
  },
};