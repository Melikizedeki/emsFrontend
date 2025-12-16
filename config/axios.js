import axios from "axios";

const api = axios.create({
  baseURL: "https://emsbackendtwo.onrender.com",

  withCredentials: true, // keep true only if you use cookies
});

export default api;

