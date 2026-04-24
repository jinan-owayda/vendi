import api from "./api";

export async function getVendorProducts(id = "") {
  const url = id ? `/vendor/products/${id}` : "/vendor/products";
  const response = await api.get(url);
  return response.data;
}

export async function createOrUpdateProduct(data, id = "") {
  const url = id
    ? `/vendor/add_update_product/${id}`
    : "/vendor/add_update_product";

  const response = await api.post(url, data, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export async function deleteVendorProduct(id) {
  const response = await api.delete(`/vendor/delete_product/${id}`, null, {
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
}