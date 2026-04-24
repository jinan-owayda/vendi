import React, { useEffect, useMemo, useState } from "react";
import { deleteAdminProduct, getAdminProducts } from "../../services/admin";

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

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminProducts();
      setProducts(data?.payload ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(productId) {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      setDeletingId(productId);
      setError("");
      setSuccess("");

      await deleteAdminProduct(productId);

      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setSuccess("Product deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const statuses = useMemo(() => {
    const unique = [...new Set(products.map((product) => product.status).filter(Boolean))];
    return ["all", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeStatus === "all") return products;
    return products.filter((product) => product.status === activeStatus);
  }, [products, activeStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus]);

  function getImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  }

  function formatPrice(price) {
    return `$${Number(price || 0).toFixed(2)}`;
  }

  function getInitials(name) {
    if (!name) return "PR";

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

  function getReviewStyle(status) {
    if (status === "approved") {
      return {
        backgroundColor: "#e8f7ee",
        color: "#1f8f4e",
      };
    }

    if (status === "rejected") {
      return {
        backgroundColor: "#fff0f0",
        color: "#c0392b",
      };
    }

    if (status === "flagged") {
      return {
        backgroundColor: "#fff1df",
        color: "#d97706",
      };
    }

    return {
      backgroundColor: "#f3e8ff",
      color: "#7c3aed",
    };
  }

  function formatExpiry(dateString) {
    if (!dateString) return null;

    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
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
          <h1 style={styles.title}>Products Management</h1>
          <p style={styles.subtitle}>
            View and manage all products across the platform.
          </p>
        </div>

        <div style={styles.totalBadge}>
          Total Products: <span style={styles.totalBadgeNumber}>{products.length}</span>
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
              {status === "all" ? "All Products" : status}
            </button>
          );
        })}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.th}>PRODUCT</div>
          <div style={styles.th}>VENDOR</div>
          <div style={styles.th}>CATEGORY</div>
          <div style={styles.th}>PRICE</div>
          <div style={styles.th}>STOCK</div>
          <div style={styles.th}>STATUS</div>
          <div style={styles.th}>REVIEW</div>
          <div style={styles.th}>ACTIONS</div>
        </div>

        {loading ? (
          <div style={styles.loadingWrap}>Loading products...</div>
        ) : paginatedProducts.length === 0 ? (
          <div style={styles.loadingWrap}>No products found.</div>
        ) : (
          paginatedProducts.map((product) => {
            const imageUrl = getImageUrl(product.image);

            return (
              <div
                key={product.id}
                style={{
                  ...styles.tableRow,
                  ...(product.moderation_status === "rejected"
                    ? styles.tableRowRejected
                    : {}),
                }}
              >
                <div style={styles.productCell}>
                  <div style={styles.imageWrap}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} style={styles.productImage} />
                    ) : (
                      <div style={styles.imageFallback}>{getInitials(product.name)}</div>
                    )}
                  </div>

                  <div>
                    <div style={styles.productName}>{product.name}</div>
                    <div style={styles.productSku}>SKU {product.sku}</div>
                  </div>
                </div>

                <div style={styles.vendorCell}>
                  <div style={styles.vendorName}>{product.vendor?.name || "Unknown"}</div>
                  <div style={styles.vendorEmail}>{product.vendor?.email || "No email"}</div>
                </div>

                <div>
                  <span style={styles.categoryPill}>
                    {product.category || "Uncategorized"}
                  </span>
                </div>

                <div style={styles.priceCell}>{formatPrice(product.price)}</div>

                <div style={styles.stockCell}>{product.stock_quantity}</div>

                <div>
                  <span
                    style={{
                      ...styles.pill,
                      ...getStatusStyle(product.status),
                    }}
                  >
                    {product.status}
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      ...styles.pill,
                      ...getReviewStyle(product.moderation_status),
                    }}
                  >
                    {product.moderation_status || "pending"}
                  </span>

                  {product.moderation_status === "rejected" && product.moderation_reason && (
                    <div style={styles.reviewReason}>
                      {product.moderation_reason}
                    </div>
                  )}

                  {product.moderation_status === "rejected" && product.expires_at && (
                    <div style={styles.expiryText}>
                      Deletes at {formatExpiry(product.expires_at)}
                    </div>
                  )}
                </div>

                <div style={styles.actionsCell}>
                  <button
                    style={{
                      ...styles.iconBtn,
                      opacity: deletingId === product.id ? 0.6 : 1,
                    }}
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    title="Delete product"
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
            Showing {paginatedProducts.length} of {filteredProducts.length} products
          </div>
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}

export default AdminProductsPage;

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
    gridTemplateColumns: "2fr 1.4fr 1fr 0.8fr 0.7fr 0.8fr 1fr 0.6fr",
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
    gridTemplateColumns: "2fr 1.4fr 1fr 0.8fr 0.7fr 0.8fr 1fr 0.6fr",
    gap: 20,
    padding: "20px 26px",
    borderBottom: "1px solid #f1ece8",
    alignItems: "center",
  },
  tableRowRejected: {
    backgroundColor: "#fffafa",
  },
  productCell: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f6f2ef",
    flexShrink: 0,
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imageFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#9B4D52",
  },
  productName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#3d3430",
  },
  productSku: {
    fontSize: 12,
    color: "#8a817b",
    marginTop: 4,
  },
  vendorCell: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#5d5651",
  },
  vendorEmail: {
    fontSize: 12,
    color: "#8a817b",
    wordBreak: "break-word",
  },
  categoryPill: {
    display: "inline-block",
    backgroundColor: "#f1ece8",
    color: "#6a625d",
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 13,
  },
  priceCell: {
    fontSize: 15,
    fontWeight: 700,
    color: "#b0645a",
  },
  stockCell: {
    fontSize: 14,
    color: "#5d5651",
    fontWeight: 600,
  },
  pill: {
    display: "inline-block",
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  reviewReason: {
    fontSize: 11,
    color: "#c0392b",
    marginTop: 6,
    lineHeight: 1.4,
  },
  expiryText: {
    fontSize: 11,
    color: "#8a817b",
    marginTop: 4,
    lineHeight: 1.4,
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