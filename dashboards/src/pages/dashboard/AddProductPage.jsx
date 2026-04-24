import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createOrUpdateProduct, getVendorProducts } from "../../services/products";

function AddProductPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const editingProduct = location.state?.product || null;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(editingProduct?.image || "");
  const [form, setForm] = useState({
    vendor_id: user?.id || "",
    store_id: "",
    name: "",
    description: "",
    category: "",
    sku: "",
    price: "",
    stock_quantity: "",
    status: "active",
    base64: "",
    file_name: "",
  });

  useEffect(() => {
    async function setupPage() {
      try {
        setPageLoading(true);
        setError("");

        const data = await getVendorProducts();
        const products = data?.payload || [];

        let storeId = "";
        if (products.length > 0) {
          storeId = products[0]?.store_id || "";
        }

        if (id) {
          const product =
            editingProduct ||
            products.find((item) => String(item.id) === String(id));

          if (!product) {
            setError("Product not found.");
            setPageLoading(false);
            return;
          }

          setForm({
            vendor_id: user?.id || "",
            store_id: product.store_id || storeId,
            name: product.name || "",
            description: product.description || "",
            category: product.category || "",
            sku: product.sku || "",
            price: product.price || "",
            stock_quantity: product.stock_quantity || "",
            status: product.status || "active",
            base64: "",
            file_name: "",
          });

          setPreview(
            product.image
              ? product.image.startsWith("http")
                ? product.image
                : `http://127.0.0.1:8000/storage/${product.image}`
              : ""
          );
        } else {
          setForm((prev) => ({
            ...prev,
            vendor_id: user?.id || "",
            store_id: storeId,
          }));
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load page data."
        );
      } finally {
        setPageLoading(false);
      }
    }

    setupPage();
  }, [id, editingProduct, user?.id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        base64: reader.result,
        file_name: file.name,
      }));
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.store_id) {
      setError("Store ID could not be detected for this vendor.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        vendor_id: form.vendor_id,
        store_id: form.store_id,
        name: form.name,
        description: form.description,
        category: form.category,
        sku: form.sku,
        price: form.price,
        stock_quantity: form.stock_quantity,
        status: form.status,
      };

      if (form.base64 && form.file_name) {
        payload.base64 = form.base64;
        payload.file_name = form.file_name;
      }

      await createOrUpdateProduct(payload, id);
      navigate("/dashboard/inventory");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to save product."
      );
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return <div style={{ padding: "0 40px 40px" }}>Loading product...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>{id ? "Edit Product" : "Add Product"}</h1>
          <p style={styles.subtitle}>
            {id ? "Update your product details." : "Create a new product for your store."}
          </p>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>SKU</label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Stock Quantity</label>
            <input
              name="stock_quantity"
              type="number"
              value={form.stock_quantity}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={styles.input} />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            required
            style={styles.textarea}
          />
        </div>

        {preview && (
          <div style={styles.previewWrap}>
            <img src={preview} alt="Preview" style={styles.previewImage} />
          </div>
        )}

        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => navigate("/dashboard/inventory")}
            style={styles.cancelBtn}
          >
            Cancel
          </button>

          <button type="submit" style={styles.saveBtn} disabled={loading}>
            {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProductPage;

const styles = {
  page: {
    padding: "0 40px 40px",
  },
  headerRow: {
    marginBottom: 24,
  },
  title: {
    fontFamily: "'Georgia', serif",
    fontSize: 34,
    fontWeight: 700,
    color: "#9B4D52",
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: "#6e6660",
    marginTop: 10,
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
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    border: "1px solid #eee7e1",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#4d4641",
  },
  input: {
    border: "1px solid #ddd6cf",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  },
  textarea: {
    border: "1px solid #ddd6cf",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
  },
  previewWrap: {
    marginTop: 8,
    marginBottom: 20,
  },
  previewImage: {
    width: 140,
    height: 140,
    objectFit: "cover",
    borderRadius: 16,
    border: "1px solid #eee7e1",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    border: "1px solid #ddd6cf",
    backgroundColor: "#fff",
    color: "#5a514b",
    borderRadius: 12,
    padding: "10px 16px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  saveBtn: {
    border: "none",
    backgroundColor: "#9B4D52",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 16px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};