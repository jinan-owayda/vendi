import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteVendorProduct, getVendorProducts } from "../../services/products";

const PAGE_SIZE = 4;

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M3 12.75V15h2.25L13.8 6.45l-2.25-2.25L3 12.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10.95 4.2 13.2 6.45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function InventoryPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getVendorProducts();
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

      await deleteVendorProduct(productId);

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

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((product) => product.category).filter(Boolean))];
    return ["all", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  function formatPrice(price) {
    return `$${Number(price || 0).toFixed(2)}`;
  }

  function getImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  }

  function getStockMeta(quantity) {
    if (quantity <= 0) {
      return {
        label: "Out of Stock",
        color: "#e35d5b",
        width: "0%",
      };
    }

    if (quantity <= 3) {
      return {
        label: "Low Stock",
        color: "#ef8b34",
        width: "22%",
      };
    }

    return {
      label: "In Stock",
      color: "#6f6a68",
      width: "75%",
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
          <h1 style={styles.title}>Inventory Management</h1>
          <p style={styles.subtitle}>
            Manage and monitor your boutique&apos;s premium collection.
          </p>
        </div>

        <div style={styles.rightHeader}>
          <div style={styles.totalBadge}>
            Total Products: <span style={styles.totalBadgeNumber}>{products.length}</span>
          </div>

          <button
            style={styles.addButton}
            onClick={() => navigate("/dashboard/inventory/add")}
          >
            + Add Product
          </button>
        </div>
      </div>

      <div style={styles.categoryRow}>
        {categories.map((category) => {
          const active = activeCategory === category;

          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                ...styles.categoryButton,
                ...(active ? styles.categoryButtonActive : {}),
              }}
            >
              {category === "all" ? "All Products" : category}
            </button>
          );
        })}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.th}>PRODUCT</div>
          <div style={styles.th}>CATEGORY</div>
          <div style={styles.th}>STOCK LEVEL</div>
          <div style={styles.th}>PRICE</div>
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
            const stockMeta = getStockMeta(product.stock_quantity);
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
                      <div style={styles.imageFallback}>No Image</div>
                    )}
                  </div>

                  <div>
                    <div style={styles.productName}>{product.name}</div>
                    <div style={styles.productSku}>SKU {product.sku}</div>
                  </div>
                </div>

                <div>
                  <span style={styles.categoryPill}>{product.category || "Uncategorized"}</span>
                </div>

                <div style={styles.stockCell}>
                  <div style={styles.stockBarTrack}>
                    <div
                      style={{
                        ...styles.stockBarFill,
                        width: stockMeta.width,
                        backgroundColor: stockMeta.color,
                      }}
                    />
                  </div>

                  <div style={styles.stockTopRow}>
                    <span style={{ ...styles.stockCount, color: stockMeta.color }}>
                      {product.stock_quantity} Left
                    </span>
                  </div>

                  <div style={{ ...styles.stockLabel, color: stockMeta.color }}>
                    • {stockMeta.label}
                  </div>
                </div>

                <div style={styles.priceCell}>{formatPrice(product.price)}</div>

                <div>
                  <span
                    style={{
                      ...styles.statusPill,
                      ...(product.status === "active"
                        ? styles.statusActive
                        : styles.statusInactive),
                    }}
                  >
                    {product.status}
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      ...styles.statusPill,
                      ...getReviewStyle(product.moderation_status),
                      textTransform: "capitalize",
                    }}
                  >
                    {product.moderation_status || "pending"}
                  </span>

                  {/* {product.moderation_status === "rejected" && product.moderation_reason && (
                    <div style={styles.reviewReason}>
                      {product.moderation_reason}
                    </div>
                  )} */}

                  {product.moderation_status === "rejected" && product.expires_at && (
                    <div style={styles.expiryText}>
                      Deletes at {formatExpiry(product.expires_at)}
                    </div>
                  )}
                </div>

                <div style={styles.actionsCell}>
                  <button
                    style={styles.iconBtn}
                    onClick={() =>
                      navigate(`/dashboard/inventory/edit/${product.id}`, {
                        state: { product },
                      })
                    }
                    title="Edit product"
                  >
                    <EditIcon />
                  </button>

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

export default InventoryPage;

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
  rightHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
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
  addButton: {
    border: "none",
    backgroundColor: "#9B4D52",
    color: "#fff",
    borderRadius: 999,
    padding: "11px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  categoryRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 26,
  },
  categoryButton: {
    border: "none",
    backgroundColor: "#ece7e4",
    color: "#5d5651",
    borderRadius: 999,
    padding: "12px 24px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  categoryButtonActive: {
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
    gridTemplateColumns: "2.2fr 1fr 1.4fr 1fr 0.8fr 1fr 0.7fr",
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
    gridTemplateColumns: "2.2fr 1fr 1.4fr 1fr 0.8fr 1fr 0.7fr",
    gap: 20,
    padding: "20px 26px",
    borderBottom: "1px solid #f1ece8",
    alignItems: "center",
  },
  tableRowRejected: {
    backgroundColor: "#f5a6a6ff",
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
    fontSize: 10,
    color: "#8a817b",
    textAlign: "center",
    padding: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#9B4D52",
    lineHeight: 1.35,
  },
  productSku: {
    fontSize: 12,
    color: "#8a817b",
    marginTop: 6,
  },
  categoryPill: {
    display: "inline-block",
    backgroundColor: "#f1ece8",
    color: "#6a625d",
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 13,
  },
  stockCell: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  stockBarTrack: {
    width: 90,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#ebe5e1",
    overflow: "hidden",
  },
  stockBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  stockTopRow: {
    fontSize: 14,
    fontWeight: 600,
  },
  stockCount: {
    fontSize: 14,
    fontWeight: 600,
  },
  stockLabel: {
    fontSize: 12,
  },
  priceCell: {
    fontSize: 16,
    fontWeight: 700,
    color: "#b0645a",
  },
  statusPill: {
    display: "inline-block",
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  statusActive: {
    backgroundColor: "#e8f7ee",
    color: "#1f8f4e",
  },
  statusInactive: {
    backgroundColor: "#fff1df",
    color: "#d97706",
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