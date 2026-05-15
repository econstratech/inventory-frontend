import axios from "axios";

//export const url = "https://product.growthh.in/api/"
export const url = process.env.REACT_APP_BACKEND_URL;

// Rewrite Axios's generic "Request failed with status code N" so err.message
// surfaces the backend's JSON message/error field instead. Keeps the original
// AxiosError shape (err.response, err.config, ...) intact.
const surfaceBackendMessage = (error) => {
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (typeof error?.response?.data === "string" ? error.response.data : null);
  if (backendMessage) {
    error.message = backendMessage;
  }
  return Promise.reject(error);
};

// withCredentials:true makes the browser send the HttpOnly `token` cookie on
// every request and accept Set-Cookie on every response. Auth lives in the
// cookie now — no JS-readable token, no manual Authorization header.
export const Axios = axios.create({
  baseURL: url,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
Axios.interceptors.response.use((response) => response, surfaceBackendMessage);

export const PrivateAxios = axios.create({
  baseURL: url,
  withCredentials: true,
});
PrivateAxios.interceptors.response.use(
  (response) => response,
  surfaceBackendMessage
);

export const PrivateAxiosFile = axios.create({
  baseURL: url,
  withCredentials: true,
});
PrivateAxiosFile.interceptors.response.use(
  (response) => response,
  surfaceBackendMessage
);
PrivateAxiosFile.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "multipart/form-data";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
