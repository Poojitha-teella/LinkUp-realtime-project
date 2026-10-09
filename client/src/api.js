const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const token = localStorage.getItem("pulse_token");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  login: (username, password) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  register: (username,email, password) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify({ username,email, password }) }),
  forgotPassword: email =>
    request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    }),

  resetPassword: (token, password) =>
    request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password })
    }),
  rooms: () => request("/api/rooms"),
  createRoom: name =>
    request("/api/rooms", { method: "POST", body: JSON.stringify({ name }) }),
  joinRoom: id =>
    request(`/api/rooms/${id}/join`, { method: "POST" }),
  roomMembers: id =>
    request(`/api/rooms/${id}`),

  renameRoom: (id, name) =>
    request(`/api/rooms/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name })
    }),
  messages: id => request(`/api/rooms/${id}/messages`),
  requestToJoin: roomId =>
    request(`/api/rooms/${roomId}/join-request`, {
      method: "POST"
    }),

  joinRequests: () =>
    request("/api/join-requests"),

  approveJoinRequest: requestId =>
    request(`/api/join-requests/${requestId}/approve`, {
      method: "POST"
    }),

  rejectJoinRequest: requestId =>
    request(`/api/join-requests/${requestId}/reject`, {
      method: "POST"
    })
};

export { API };
