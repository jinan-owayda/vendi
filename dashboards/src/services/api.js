import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v0.1",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("vendi_dashboard_session");

  if (raw) {
    try {
      const session = JSON.parse(raw);

      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch {
      localStorage.removeItem("vendi_dashboard_session");
    }
  }

  return config;
});

export default api;