import axios from "axios";

/*
|--------------------------------------------------------------------------
| Global fetch() Auth Patch
|--------------------------------------------------------------------------
|
| Most pages in this app call the backend with the native `fetch()` API
| using hardcoded absolute URLs, rather than the shared axios `api`
| instance (src/services/api.js). Now that API routes require a Bearer
| token, every one of those call sites would otherwise fail with 401.
|
| Rather than editing every fetch() call across the app, this patches
| window.fetch once at startup so any request to the backend origin
| automatically carries the current access token, and transparently
| refreshes it once on a 401 before failing (same behavior as the axios
| interceptor, kept independent to avoid coupling the two paths).
|
*/

const BACKEND_ORIGIN = "http://localhost:5001";
const REFRESH_URL = `${BACKEND_ORIGIN}/api/auth/refresh-token`;

const originalFetch = window.fetch.bind(window);

let isRefreshing = false;
let refreshPromise = null;

function requestUrl(input) {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.toString();
    if (input && typeof input.url === "string") return input.url;
    return "";
}

function isBackendRequest(url) {
    return url.startsWith(BACKEND_ORIGIN);
}

function isAuthEndpoint(url) {
    return url.includes("/api/auth/login") || url.includes("/api/auth/refresh-token");
}

async function refreshAccessToken() {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = axios
            .post(REFRESH_URL, {}, { withCredentials: true })
            .then(({ data }) => {
                localStorage.setItem("accessToken", data.data.accessToken);
                localStorage.setItem("user", JSON.stringify(data.data.user));
                return data.data.accessToken;
            })
            .finally(() => {
                isRefreshing = false;
            });
    }
    return refreshPromise;
}

function withAuthHeader(init, token) {
    const headers = new Headers(init.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return { ...init, headers, credentials: "include" };
}

window.fetch = async function patchedFetch(input, init = {}) {
    const url = requestUrl(input);

    if (!isBackendRequest(url)) {
        return originalFetch(input, init);
    }

    const token = localStorage.getItem("accessToken");
    let response = await originalFetch(input, withAuthHeader(init, token));

    if (response.status === 401 && !isAuthEndpoint(url)) {
        try {
            const newToken = await refreshAccessToken();
            response = await originalFetch(input, withAuthHeader(init, newToken));
        } catch (refreshError) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
    }

    return response;
};
