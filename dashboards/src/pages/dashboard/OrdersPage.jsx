import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getVendorOrders,
  updateVendorOrderStatus,
} from "../../services/orders";

const PAGE_SIZE = 5;

const TABS = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [openEditorId, setOpenEditorId] = useState(null);
  const [editorValues, setEditorValues] = useState({
    order_status: "",
    payment_status: "",
  });

  const editorRef = useRef(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (editorRef.current && !editorRef.current.contains(event.target)) {
        setOpenEditorId(null);
      }
    }

    if (openEditorId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openEditorId]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await getVendorOrders();
      setOrders(data?.payload ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  function openEditor(order) {
    setSuccess("");
    setError("");
    setOpenEditorId(order.id);
    setEditorValues({
      order_status: order.order_status || "pending",
      payment_status: order.payment_status || "pending",
    });
  }

  function closeEditor() {
    setOpenEditorId(null);
    setEditorValues({
      order_status: "",
      payment_status: "",
    });
  }

  async function handleSaveStatus(orderId) {
  try {
    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    const requestBody = {
      order_status: editorValues.order_status,
      payment_status: editorValues.payment_status,
    };

    console.log("Sending update for order:", orderId, requestBody);

    const response = await updateVendorOrderStatus(orderId, requestBody);
    const updatedOrder = response.payload;

    console.log("Update response:", response);

    

    if (!updatedOrder) {
      throw new Error("Updated order was not returned from the API.");
    }

    await loadOrders();

    setSuccess("Order updated successfully.");
    closeEditor();
  } catch (err) {
    console.log("Update order error:", err);
    console.log("Update order error response:", err?.response?.data);

    setError(
      err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update order status."
    );
  } finally {
    setUpdatingId(null);
  }
}

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((order) => order.order_status === activeTab);
  }, [orders, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatAmount(amount) {
    const number = Number(amount || 0);
    return `$${number.toFixed(2)}`;
  }

  function getCustomerInitials(name) {
    if (!name) return "NA";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function getItemsText(items = []) {
    if (!items.length) return "No items";

    return items
      .map((item) =>
        item.quantity > 1
          ? `${item.product_name} (${item.quantity})`
          : item.product_name
      )
      .join(", ");
  }

  function getStatusLabel(status) {
    if (status === "confirmed") return "Confirmed";
    if (status === "cancelled") return "Cancelled";
    if (status === "delivered") return "Delivered";
    if (status === "pending") return "Pending";
    return status;
  }

  function getStatusStyle(status) {
    if (status === "delivered") {
      return {
        backgroundColor: "#e7f6ec",
        color: "#1f8f4e",
      };
    }

    if (status === "confirmed") {
        return {
            backgroundColor: "#e8f0ff",
            color: "#2563eb",
        };
    }

    if (status === "cancelled") {
        return {
            backgroundColor: "#fff1df",
            color: "#d97706",
        };
    }

    if (status === "pending") {
      return {
        backgroundColor: "#f3e8ff",
        color: "#7c3aed",
      };
    }

    return {
      backgroundColor: "#f0ebe4",
      color: "#7a6f68",
    };
  }

  function getPaymentTextStyle(paymentStatus) {
    if (paymentStatus === "paid") {
      return { color: "#1f8f4e" };
    }

    return { color: "#a16207" };
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
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
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
          <h1 style={styles.title}>Order Management</h1>
          <p style={styles.subtitle}>
            Curate and oversee your boutique&apos;s latest transactions.
          </p>
        </div>

        <div style={styles.tabsWrap}>
          {TABS.map((tab) => {
            const active = tab.key === activeTab;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tabButton,
                  ...(active ? styles.tabButtonActive : {}),
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.th}>ORDER ID</div>
          <div style={styles.th}>CUSTOMER NAME</div>
          <div style={styles.th}>ITEMS</div>
          <div style={styles.th}>TOTAL (USD)</div>
          <div style={styles.th}>DATE</div>
          <div style={styles.th}>STATUS</div>
        </div>

        {loading ? (
          <div style={styles.loadingWrap}>Loading orders...</div>
        ) : paginatedOrders.length === 0 ? (
          <div style={styles.loadingWrap}>No orders found.</div>
        ) : (
          paginatedOrders.map((order) => (
            <div key={order.id} style={styles.tableRow}>
              <div style={styles.cellOrderId}>
                <div style={styles.orderIdText}>#{order.order_number}</div>
              </div>

              <div style={styles.cellCustomer}>
                <div style={styles.customerAvatar}>
                  {getCustomerInitials(order.user?.name)}
                </div>
                <div style={styles.customerName}>{order.user?.name || "Unknown"}</div>
              </div>

              <div style={styles.cellItems}>{getItemsText(order.items)}</div>

              <div style={styles.cellTotal}>
                <div style={styles.totalMain}>{formatAmount(order.total_amount)}</div>
                <div
                  style={{
                    ...styles.totalSub,
                    ...getPaymentTextStyle(order.payment_status),
                  }}
                >
                  {order.payment_method} · {order.payment_status}
                </div>
              </div>

              <div style={styles.cellDate}>{formatDate(order.created_at)}</div>

              <div style={{ ...styles.cellStatus, position: "relative" }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditorId === order.id ? closeEditor() : openEditor(order);
                  }}
                  style={{
                    ...styles.statusBadge,
                    ...getStatusStyle(order.order_status),
                  }}
                >
                  {getStatusLabel(order.order_status)}
                </button>

                {openEditorId === order.id && (
                  <div
                    ref={editorRef}
                    style={styles.editorCard}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={styles.editorGroup}>
                      <label style={styles.editorLabel}>Order status</label>
                      <select
                        value={editorValues.order_status}
                        onChange={(e) =>
                          setEditorValues((prev) => ({
                            ...prev,
                            order_status: e.target.value,
                          }))
                        }
                        style={styles.editorSelect}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.editorGroup}>
                      <label style={styles.editorLabel}>Payment status</label>
                      <select
                        value={editorValues.payment_status}
                        onChange={(e) =>
                          setEditorValues((prev) => ({
                            ...prev,
                            payment_status: e.target.value,
                          }))
                        }
                        style={styles.editorSelect}
                      >
                        {PAYMENT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.editorActions}>
                      <button
                        type="button"
                        onClick={closeEditor}
                        style={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveStatus(order.id)}
                        style={styles.saveBtn}
                        disabled={updatingId === order.id}
                      >
                        {updatingId === order.id ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div style={styles.tableFooter}>
          <div style={styles.resultsText}>
            Showing {paginatedOrders.length} of {filteredOrders.length} results
          </div>
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;

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
    color: "#241d1a",
    margin: 0,
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: 14,
    color: "#6e6660",
    margin: "10px 0 0",
  },
  tabsWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f0ebe7",
    borderRadius: 999,
    padding: 6,
    minWidth: 480,
    justifyContent: "space-between",
  },
  tabButton: {
    border: "none",
    background: "transparent",
    padding: "10px 18px",
    borderRadius: 999,
    fontSize: 14,
    color: "#6b635d",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  tabButtonActive: {
    backgroundColor: "#706967",
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
  overflow: "visible",
  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  border: "1px solid #eee7e1",
  position: "relative",
},
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.5fr 1.8fr 1.2fr 1fr 1.4fr",
    gap: 20,
    padding: "22px 32px",
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
    gridTemplateColumns: "1.2fr 1.5fr 1.8fr 1.2fr 1fr 1.4fr",
    gap: 20,
    padding: "24px 32px",
    borderBottom: "1px solid #f1ece8",
    alignItems: "start",
  },
  cellOrderId: {
    fontSize: 15,
    fontWeight: 700,
    color: "#5a534f",
    lineHeight: 1.35,
    wordBreak: "break-word",
  },
  orderIdText: {
    maxWidth: 120,
  },
  cellCustomer: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  customerAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    backgroundColor: "#e8e1de",
    color: "#7d7570",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  customerName: {
    fontSize: 14,
    color: "#342c29",
    lineHeight: 1.45,
  },
  cellItems: {
    fontSize: 14,
    color: "#5d5651",
    lineHeight: 1.55,
  },
  cellTotal: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  totalMain: {
    fontSize: 15,
    fontWeight: 700,
    color: "#241d1a",
  },
  totalSub: {
    fontSize: 11,
    textTransform: "capitalize",
  },
  cellDate: {
    fontSize: 14,
    color: "#5d5651",
    lineHeight: 1.55,
  },
  cellStatus: {
    display: "flex",
    alignItems: "flex-start",
  },
  statusBadge: {
    border: "none",
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  editorCard: {
  position: "absolute",
  top: 42,
  right: 0,
  width: 230,
  backgroundColor: "#fff",
  border: "1px solid #eadfd7",
  borderRadius: 14,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  padding: 14,
  zIndex: 999,
  display: "flex",
  flexDirection: "column",
  gap: 12,
},
  editorGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  editorLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#5a514b",
  },
  editorSelect: {
    border: "1px solid #ddd6cf",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: "inherit",
    backgroundColor: "#fff",
    color: "#312926",
    outline: "none",
  },
  editorActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    border: "1px solid #ddd6cf",
    backgroundColor: "#fff",
    color: "#5a514b",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  saveBtn: {
    border: "none",
    backgroundColor: "#9B4D52",
    color: "#fff",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  loadingWrap: {
    padding: "40px 32px",
    fontSize: 14,
    color: "#6e6660",
  },
  tableFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px 32px",
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
    backgroundColor: "#706967",
    color: "#fff",
  },
};