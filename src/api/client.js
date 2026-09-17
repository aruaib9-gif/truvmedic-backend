/**
 * TRUV Medical API client.
 *
 * Replaces the Base44 SDK. The surface (`api.entities.X.list/filter/create/…`,
 * `api.auth.me()`, `api.integrations.Core.UploadFile`, `api.functions.invoke`)
 * deliberately mirrors the old SDK so page components did not have to change.
 */

/**
 * Render's blueprint injects a service's `host` property as a bare hostname
 * ("truvmedic-api.onrender.com"), so add the scheme when it is missing —
 * otherwise every fetch would be treated as a relative path.
 */
function normalizeApiUrl(value) {
  const raw = (value || "http://localhost:4000").trim().replace(/\/$/, "");
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);
const TOKEN_KEY = "truvmedic_token";

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------
export const tokenStore = {
  get() {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable (private mode) — the session simply won't persist */
    }
  },
  clear() {
    this.set(null);
  },
};

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/** Fires when a request comes back 401 so AuthContext can drop the session. */
const unauthorizedHandlers = new Set();
export const onUnauthorized = (handler) => {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
};

async function request(path, { method = "GET", body, isFormData = false, signal } = {}) {
  const token = tokenStore.get();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      tokenStore.clear();
      unauthorizedHandlers.forEach((handler) => handler());
    }
    throw new ApiError(
      response.status,
      payload?.error || `Request failed (${response.status})`,
      payload
    );
  }

  return payload;
}

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------
const ENTITY_NAMES = [
  "Lead",
  "EmergencyRequest",
  "JobPosting",
  "JobApplication",
  "CandidateMessage",
  "InternalMessage",
  "BlogPost",
  "Testimonial",
  "NewsletterSubscriber",
  "SiteConfig",
  "User",
];

function buildQuery({ filter, sort, limit, offset }) {
  const params = new URLSearchParams();
  if (filter && Object.keys(filter).length > 0) params.set("filter", JSON.stringify(filter));
  if (sort) params.set("sort", sort);
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  const query = params.toString();
  return query ? `?${query}` : "";
}

function createEntityApi(name) {
  const base = `/api/entities/${name}`;

  return {
    /** list(sort?, limit?) */
    list: (sort = "-created_date", limit = 100) =>
      request(`${base}${buildQuery({ sort, limit })}`),

    /** filter(query, sort?, limit?) */
    filter: (filter = {}, sort = "-created_date", limit = 100) =>
      request(`${base}${buildQuery({ filter, sort, limit })}`),

    get: (id) => request(`${base}/${id}`),
    create: (data) => request(base, { method: "POST", body: data }),
    update: (id, data) => request(`${base}/${id}`, { method: "PUT", body: data }),
    delete: (id) => request(`${base}/${id}`, { method: "DELETE" }),

    /**
     * Server-sent-events subscription; `callback` runs on every change.
     * Returns an unsubscribe function, matching the old SDK's contract.
     */
    subscribe: (callback) => subscribeToEntity(name, base, callback),
  };
}

/**
 * One EventSource per entity, shared by every subscriber.
 *
 * Several components call `useSiteConfig()` on the same page; without this the
 * client would open a stream each time and exhaust the browser's ~6-connection
 * per-origin limit, stalling ordinary requests.
 */
const streams = new Map(); // entity name -> { source, listeners }

function subscribeToEntity(name, base, callback) {
  if (typeof window === "undefined" || !("EventSource" in window)) return () => {};

  let stream = streams.get(name);
  if (!stream) {
    const source = new EventSource(`${API_URL}${base}/subscribe`);
    stream = { source, listeners: new Set() };

    source.onmessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        payload = { entity: name };
      }
      stream.listeners.forEach((listener) => listener(payload));
    };
    // The browser reconnects on its own; transient errors are not actionable.
    source.onerror = () => {};

    streams.set(name, stream);
  }

  stream.listeners.add(callback);

  return () => {
    stream.listeners.delete(callback);
    if (stream.listeners.size === 0) {
      stream.source.close();
      streams.delete(name);
    }
  };
}

const entities = Object.fromEntries(
  ENTITY_NAMES.map((name) => [name, createEntityApi(name)])
);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
const auth = {
  async login(email, password) {
    const result = await request("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    tokenStore.set(result.token);
    return result.user;
  },

  async register({ email, password, full_name, phone }) {
    const result = await request("/api/auth/register", {
      method: "POST",
      body: { email, password, full_name, phone },
    });
    tokenStore.set(result.token);
    return result.user;
  },

  /** Resolves to the signed-in user, or null when there is no valid session. */
  async me() {
    if (!tokenStore.get()) return null;
    try {
      return await request("/api/auth/me");
    } catch (error) {
      if (error.status === 401) return null;
      throw error;
    }
  },

  updateProfile: (data) => request("/api/auth/me", { method: "PATCH", body: data }),

  changePassword: (current_password, new_password) =>
    request("/api/auth/change-password", {
      method: "POST",
      body: { current_password, new_password },
    }),

  forgotPassword: (email) =>
    request("/api/auth/forgot-password", { method: "POST", body: { email } }),

  async resetPassword(token, password) {
    const result = await request("/api/auth/reset-password", {
      method: "POST",
      body: { token, password },
    });
    tokenStore.set(result.token);
    return result.user;
  },

  getInvite: (token) => request(`/api/auth/invite/${encodeURIComponent(token)}`),

  async acceptInvite({ token, password, full_name }) {
    const result = await request("/api/auth/accept-invite", {
      method: "POST",
      body: { token, password, full_name },
    });
    tokenStore.set(result.token);
    return result.user;
  },

  logout(redirectTo) {
    tokenStore.clear();
    if (typeof window !== "undefined" && redirectTo) window.location.href = redirectTo;
  },

  /** Sends the browser to the login page, remembering where to come back to. */
  redirectToLogin(returnUrl) {
    if (typeof window === "undefined") return;
    const target = returnUrl || window.location.href;
    const next = encodeURIComponent(
      target.startsWith("http") ? new URL(target).pathname + new URL(target).search : target
    );
    window.location.href = `/login?next=${next}`;
  },
};

// ---------------------------------------------------------------------------
// Integrations — same shape as api.integrations.Core.*
// ---------------------------------------------------------------------------
const integrations = {
  Core: {
    async UploadFile({ file, folder }) {
      const form = new FormData();
      form.append("file", file);
      if (folder) form.append("folder", folder);
      return request("/api/integrations/upload", {
        method: "POST",
        body: form,
        isFormData: true,
      });
    },

    SendEmail: (params) =>
      request("/api/integrations/email", { method: "POST", body: params }),

    InvokeLLM: (params) => request("/api/integrations/llm", { method: "POST", body: params }),
  },
};

// ---------------------------------------------------------------------------
// Named server functions
// ---------------------------------------------------------------------------
const functions = {
  invoke: (name, payload = {}) =>
    request(`/api/functions/${name}`, { method: "POST", body: payload }),
};

const users = {
  inviteUser: (email, role = "viewer") =>
    request("/api/users/invite", { method: "POST", body: { email, role } }),
  listInvites: () => request("/api/users/invites"),
  revokeInvite: (id) => request(`/api/users/invites/${id}`, { method: "DELETE" }),
  staff: () => request("/api/users/staff"),
};

export const api = { entities, auth, integrations, functions, users, request, apiUrl: API_URL };

export default api;
