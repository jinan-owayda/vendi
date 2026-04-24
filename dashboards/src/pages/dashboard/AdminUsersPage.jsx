import React, { useEffect, useMemo, useState } from "react";
import { deleteAdminUser, getAdminUsers } from "../../services/admin";

const PAGE_SIZE = 6;

function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4.5 5.25h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 2.75h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 5.25V14a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.75 7.5v4.5M10.25 7.5v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminUsers();
      setUsers(data?.payload ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId) {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      setDeletingId(userId);
      setError("");
      setSuccess("");

      await deleteAdminUser(userId);

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setSuccess("User deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const roles = useMemo(() => {
    const unique = [...new Set(users.map((user) => user.role).filter(Boolean))];
    return ["all", ...unique];
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (activeRole === "all") return users;
    return users.filter((user) => user.role === activeRole);
  }, [users, activeRole]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeRole]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getInitials(name) {
    if (!name) return "NA";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function getRoleStyle(role) {
    if (role === "admin") {
      return {
        backgroundColor: "#f3e8ff",
        color: "#7c3aed",
      };
    }

    if (role === "vendor") {
      return {
        backgroundColor: "#e8f0ff",
        color: "#2563eb",
      };
    }

    return {
      backgroundColor: "#f1ece8",
      color: "#6a625d",
    };
  }

  function getStatusStyle(status) {
    if (status === "active") {
      return {
        backgroundColor: "#e8f7ee",
        color: "#1f8f4e",
      };
    }

    return {
      backgroundColor: "#fff1df",
      color: "#d97706",
    };
  }

  function renderPagination() {
    if (totalPages <= 1) return null;

    return (
      <div style={styles.pagination}>
        <button
          style={styles.pageArrow}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          ‹
        </button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          const active = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                ...styles.pageButton,
                ...(active ? styles.pageButtonActive : {}),
              }}
            >
              {page}
            </button>
          );
        })}

        <button
          style={styles.pageArrow}
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Users Management</h1>
          <p style={styles.subtitle}>
            View and manage all platform users.
          </p>
        </div>

        <div style={styles.totalBadge}>
          Total Users: <span style={styles.totalBadgeNumber}>{users.length}</span>
        </div>
      </div>

      <div style={styles.filterRow}>
        {roles.map((role) => {
          const active = activeRole === role;

          return (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              style={{
                ...styles.filterButton,
                ...(active ? styles.filterButtonActive : {}),
              }}
            >
              {role === "all" ? "All Users" : role}
            </button>
          );
        })}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.th}>USER</div>
          <div style={styles.th}>EMAIL</div>
          <div style={styles.th}>ROLE</div>
          <div style={styles.th}>STATUS</div>
          <div style={styles.th}>JOINED</div>
          <div style={styles.th}>ACTIONS</div>
        </div>

        {loading ? (
          <div style={styles.loadingWrap}>Loading users...</div>
        ) : paginatedUsers.length === 0 ? (
          <div style={styles.loadingWrap}>No users found.</div>
        ) : (
          paginatedUsers.map((user) => (
            <div key={user.id} style={styles.tableRow}>
              <div style={styles.userCell}>
                <div style={styles.avatar}>
                  {getInitials(user.name)}
                </div>

                <div>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userId}>ID {user.id}</div>
                </div>
              </div>

              <div style={styles.emailCell}>{user.email}</div>

              <div>
                <span
                  style={{
                    ...styles.pill,
                    ...getRoleStyle(user.role),
                  }}
                >
                  {user.role}
                </span>
              </div>

              <div>
                <span
                  style={{
                    ...styles.pill,
                    ...getStatusStyle(user.status),
                  }}
                >
                  {user.status}
                </span>
              </div>

              <div style={styles.dateCell}>{formatDate(user.created_at)}</div>

              <div style={styles.actionsCell}>
                <button
                  style={{
                    ...styles.iconBtn,
                    opacity: deletingId === user.id ? 0.6 : 1,
                  }}
                  onClick={() => handleDelete(user.id)}
                  disabled={deletingId === user.id}
                  title="Delete user"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))
        )}

        <div style={styles.tableFooter}>
          <div style={styles.resultsText}>
            Showing {paginatedUsers.length} of {filteredUsers.length} users
          </div>
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}

export default AdminUsersPage;

const styles = {
  page: {
    padding: "0 40px 40px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 26,
  },
  title: {
    fontFamily: "'Georgia', serif",
    fontSize: 34,
    fontWeight: 700,
    color: "#9B4D52",
    margin: 0,
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: 14,
    color: "#6e6660",
    margin: "10px 0 0",
  },
  totalBadge: {
    backgroundColor: "#f5f0ea",
    border: "1px solid #ede8e0",
    borderRadius: 999,
    padding: "10px 16px",
    fontSize: 14,
    color: "#5e5650",
    fontWeight: 600,
  },
  totalBadgeNumber: {
    color: "#9B4D52",
    marginLeft: 4,
  },
  filterRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 26,
  },
  filterButton: {
    border: "none",
    backgroundColor: "#ece7e4",
    color: "#5d5651",
    borderRadius: 999,
    padding: "12px 24px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    textTransform: "capitalize",
  },
  filterButtonActive: {
    backgroundColor: "#9B4D52",
    color: "#fff",
  },
  errorBox: {
    marginBottom: 16,
    backgroundColor: "#fff0f0",
    border: "1px solid #f5c0c0",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13,
    color: "#c0392b",
  },
  successBox: {
    marginBottom: 16,
    backgroundColor: "#edf9f0",
    border: "1px solid #bde5c8",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13,
    color: "#1f8f4e",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    border: "1px solid #eee7e1",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1.8fr 0.9fr 0.9fr 1fr 0.6fr",
    gap: 20,
    padding: "22px 26px",
    backgroundColor: "#f6f2ef",
    borderBottom: "1px solid #eee7e1",
  },
  th: {
    fontSize: 12,
    fontWeight: 700,
    color: "#675e58",
    letterSpacing: "0.12em",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1.8fr 0.9fr 0.9fr 1fr 0.6fr",
    gap: 20,
    padding: "20px 26px",
    borderBottom: "1px solid #f1ece8",
    alignItems: "center",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    backgroundColor: "#9B4D52",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  userName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#3d3430",
  },
  userId: {
    fontSize: 12,
    color: "#8a817b",
    marginTop: 4,
  },
  emailCell: {
    fontSize: 14,
    color: "#5d5651",
    wordBreak: "break-word",
  },
  pill: {
    display: "inline-block",
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  dateCell: {
    fontSize: 14,
    color: "#5d5651",
  },
  actionsCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6a625d",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingWrap: {
    padding: "40px 26px",
    fontSize: 14,
    color: "#6e6660",
  },
  tableFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px 26px",
  },
  resultsText: {
    fontSize: 13,
    color: "#7b726c",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  pageArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: "1px solid #e5ddd7",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 18,
    color: "#746b66",
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: 14,
    color: "#746b66",
    fontFamily: "inherit",
  },
  pageButtonActive: {
    backgroundColor: "#9B4D52",
    color: "#fff",
  },
};