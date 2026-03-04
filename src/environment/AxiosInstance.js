import axios from "axios";

//export const url = "https://product.growthh.in/api/"
export const url = process.env.REACT_APP_BACKEND_URL;


export const Axios = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

export const PrivateAxios = axios.create({
  baseURL: url,
});
PrivateAxios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {

      config.headers["authentication"] = `${token}`;
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// PrivateAxios.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

export const PrivateAxiosFile = axios.create({
  baseURL: url,
});

// PrivateAxiosFile.interceptors.request.use(
//     (config) => {
//        // const token = localStorage.getItem('token');
//        const token = sessionStorage.getItem('token');

//         if (token) {
//             config.headers['authentication'] = `${token}`;
//             config.headers['Content-Type'] = 'multipart/form-data';
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );
PrivateAxiosFile.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // Use sessionStorage

    if (token) {
      config.headers["Authentication"] = `${token}`; // Note: Ensure this matches your backend's expected header name
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// PrivateAxiosFile.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
