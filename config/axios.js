import axios from "axios";

const api = axios.create({
  baseURL: "https://emsbackend-1-2lba.onrender.com",

  withCredentials: false, // keep true only if you use cookies
});

export default api;

