import api from "./api";

export async function getVendorOrders(id = "") {
  const url = id ? `/vendor/orders/${id}` : "/vendor/orders";
  const response = await api.get(url);
  return response.data;
}

export async function updateVendorOrderStatus(orderId, data) {
  const response = await api.post(
    `/vendor/update_order_status/${orderId}`,
    data,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}