import React, { useEffect, useMemo, useState } from "react";
import { deleteAdminStore, getAdminStores } from "../../services/admin";

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

function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminStores();
      setStores(data?.payload ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load stores."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(storeId) {
    const confirmed = window.confirm("Are you sure you want to delete this store?");
    if (!confirmed) return;

    try {
      setDeletingId(storeId);
      setError("");
      setSuccess("");

      await deleteAdminStore(storeId);

      setStores((prev) => prev.filter((store) => store.id !== storeId));
      setSuccess("Store deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to delete store."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const statuses = useMemo(() => {
    const unique = [...new Set(stores.map((store) => store.status).filter(Boolean))];
    return ["all", ...unique];
  }, [stores]);

  const filteredStores = useMemo(() => {
    if (activeStatus === "all") return stores;
    return stores.filter((store) => store.status === activeStatus);
  }, [stores, activeStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));

  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStores.slice(start, start + PAGE_SIZE);
  }, [filteredStores, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  }

  function getInitials(name) {
    if (!name) return "ST";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
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
          <h1 style={styles.title}>Stores Management</h1>
          <p style={styles.subtitle}>
            View and manage all stores across the platform.
          </p>
        </div>

        <div style={styles.totalBadge}>
          Total Stores: <span style={styles.totalBadgeNumber}>{stores.length}</span>
        </div>
      </div>

      <div style={styles.filterRow}>
        {statuses.map((status) => {
          const active = activeStatus === status;

          return (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              style={{
                ...styles.filterButton,
                ...(active ? styles.filterButtonActive : {}),
              }}
            >
              {status === "all" ? "All Stores" : status}
            </button>
          );
        })}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.th}>STORE</div>
          <div style={styles.th}>OWNER</div>
          <div style={styles.th}>PHONE</div>
          <div style={styles.th}>RATING</div>
          <div style={styles.th}>STATUS</div>
          <div style={styles.th}>CREATED</div>
          <div style={styles.th}>ACTIONS</div>
        </div>

        {loading ? (
          <div style={styles.loadingWrap}>Loading stores...</div>
        ) : paginatedStores.length === 0 ? (
          <div style={styles.loadingWrap}>No stores found.</div>
        ) : (
          paginatedStores.map((store) => {
            const logoUrl = getImageUrl(store.logo);

            return (
              <div key={store.id} style={styles.tableRow}>
                <div style={styles.storeCell}>
                  <div style={styles.logoWrap}>
                    {logoUrl ? (
                      <img src={logoUrl} alt={store.name} style={styles.logoImage} />
                    ) : (
                      <div style={styles.logoFallback}>{getInitials(store.name)}</div>
                    )}
                  </div>

                  <div>
                    <div style={styles.storeName}>{store.name}</div>
                    <div style={styles.storeDescription}>
                      {store.description || "No description"}
                    </div>
                  </div>
                </div>

                <div style={styles.ownerCell}>
                  <div style={styles.ownerName}>{store.user?.name || "Unknown"}</div>
                  <div style={styles.ownerEmail}>{store.user?.email || "No email"}</div>
                </div>

                <div style={styles.phoneCell}>{store.phone || "—"}</div>

                <div style={styles.ratingCell}>
                  {Number(store.rating || 0).toFixed(2)}
                </div>

                <div>
                  <span
                    style={{
                      ...styles.pill,
                      ...getStatusStyle(store.status),
                    }}
                  >
                    {store.status}
                  </span>
                </div>

                <div style={styles.dateCell}>{formatDate(store.created_at)}</div>

                <div style={styles.actionsCell}>
                  <button
                    style={{
                      ...styles.iconBtn,
                      opacity: deletingId === store.id ? 0.6 : 1,
                    }}
                    onClick={() => handleDelete(store.id)}
                    disabled={deletingId === store.id}
                    title="Delete store"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div style={styles.tableFooter}>
          <div style={styles.resultsText}>
            Showing {paginatedStores.length} of {filteredStores.length} stores
          </div>
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}

export default AdminStoresPage;

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
    gridTemplateColumns: "2fr 1.4fr 1fr 0.8fr 0.8fr 1fr 0.6fr",
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
    gridTemplateColumns: "2fr 1.4fr 1fr 0.8fr 0.8fr 1fr 0.6fr",
    gap: 20,
    padding: "20px 26px",
    borderBottom: "1px solid #f1ece8",
    alignItems: "center",
  },
  storeCell: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f6f2ef",
    flexShrink: 0,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  logoFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#9B4D52",
  },
  storeName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#3d3430",
  },
  storeDescription: {
    fontSize: 12,
    color: "#8a817b",
    marginTop: 4,
    lineHeight: 1.4,
  },
  ownerCell: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#5d5651",
  },
  ownerEmail: {
    fontSize: 12,
    color: "#8a817b",
    wordBreak: "break-word",
  },
  phoneCell: {
    fontSize: 14,
    color: "#5d5651",
  },
  ratingCell: {
    fontSize: 15,
    fontWeight: 700,
    color: "#b0645a",
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