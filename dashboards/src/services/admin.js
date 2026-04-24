import api from "./api";

export async function getAdminUsers() {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function deleteAdminUser(id) {
  const response = await api.delete(`/admin/delete_user/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
}

export async function getAdminStores() {
  const response = await api.get("/admin/stores");
  return response.data;
}

export async function deleteAdminStore(id) {
  const response = await api.delete(`/admin/delete_product/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
}

export async function getAdminProducts() {
  const response = await api.get("/admin/products");
  return response.data;
}

export async function deleteAdminProduct(id) {
  const response = await api.delete(`/admin/delete_product/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
}