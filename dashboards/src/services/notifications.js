import api from "./api";

export async function getVendorNotifications() {
  const response = await api.get("/vendor/notifications");
  return response.data;
}

export async function markNotificationAsRead(id) {
  const response = await api.post(`/vendor/mark_notification_as_read/${id}`, null, {
    headers: {
      Accept: "application/json",
    },
  });
  return response.data;
}