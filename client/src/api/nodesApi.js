import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_MASTER_URL,
});

export const fetchNodes = () =>
  api.get("/api/nodes").then((r) => r.data.nodes);

export const fetchNode = (id) =>
  api.get(`/api/nodes/${id}`).then((r) => r.data.node);