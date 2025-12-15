import axios from "axios";

const api = axios.create({
  baseURL: "https://emsbackend-mgsf.onrender.com/api",
  withCredentials: true, // keep true only if you use cookies
});

export default api;

