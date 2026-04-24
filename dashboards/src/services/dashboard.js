import api from "./api";

export async function getVendorDashboardStats() {
  const response = await api.get("/vendor/dashboard");
  return response.data;
}