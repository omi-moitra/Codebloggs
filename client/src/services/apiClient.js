const DEFAULT_API_BASE_URL = "http://localhost:5050";
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return configuredApiBaseUrl;
  }

  const pageHostname = window.location.hostname;
  const isLocalPageHost = pageHostname === "localhost" || pageHostname === "127.0.0.1";

  try {
    const apiUrl = new URL(configuredApiBaseUrl);
    const isLocalApiHost =
      apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1";

    if (isLocalPageHost && isLocalApiHost && apiUrl.hostname !== pageHostname) {
      apiUrl.hostname = pageHostname;
      return apiUrl.toString().replace(/\/$/, "");
    }
  } catch {
    return configuredApiBaseUrl;
  }

  return configuredApiBaseUrl;
};

export const buildUrl = (path) => `${getApiBaseUrl()}${path}`;

export const parseJson = async (response) => {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const request = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(buildUrl(path), {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error(
      "Unable to reach the API. Check that the backend is running and that this origin is allowed by CORS.",
      { cause: error }
    );
  }

  const payload = await parseJson(response);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("codebloggs:session-expired"));
    }
    throw new Error(payload?.message || "Request failed. Please try again.");
  }

  return payload;
};

export const uploadRequest = async (path, formData, options = {}) => {
  const response = await fetch(buildUrl(path), {
    credentials: "include",
    method: "POST",
    ...options,
    body: formData,
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Upload failed. Please try again.");
  }

  return payload;
};
