import axios from "axios";

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
|
| Base API for the complete Fleet Management System
|
*/

const BASE_URL = "http://localhost:5001/api";

const api = axios.create({
    baseURL: BASE_URL,

    timeout: 60000,

    withCredentials: true, // send the httpOnly refresh-token cookie

    headers: {
        "Content-Type": "application/json",
    },
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;

    },
    (error) => {
        return Promise.reject(error);
    }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
|
| On a 401 (expired/invalid access token), silently refresh once using the
| httpOnly refresh cookie and retry the original request. Concurrent 401s
| are queued behind a single in-flight refresh call.
|
*/

let isRefreshing = false;
let refreshQueue = [];

function onRefreshed(newToken) {
    refreshQueue.forEach((cb) => cb(newToken));
    refreshQueue = [];
}

api.interceptors.response.use(

    (response) => {
        return response;
    },

    async (error) => {

        const original = error.config;

        const isAuthCall = original?.url?.includes("/auth/login")
            || original?.url?.includes("/auth/refresh-token");

        if (error.response?.status === 401 && !original._retry && !isAuthCall) {

            original._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const { data } = await axios.post(
                        `${BASE_URL}/auth/refresh-token`,
                        {},
                        { withCredentials: true }
                    );

                    const newToken = data.data.accessToken;
                    localStorage.setItem("accessToken", newToken);
                    localStorage.setItem("user", JSON.stringify(data.data.user));
                    isRefreshing = false;
                    onRefreshed(newToken);
                } catch (refreshError) {
                    isRefreshing = false;
                    refreshQueue = [];
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    if (window.location.pathname !== "/login") {
                        window.location.href = "/login";
                    }
                    return Promise.reject(error);
                }
            }

            return new Promise((resolve, reject) => {
                refreshQueue.push((newToken) => {
                    original.headers.Authorization = `Bearer ${newToken}`;
                    resolve(api(original));
                });
            });
        }

        console.error("API Error :", error);

        if (error.response) {

            console.error("Status :", error.response.status);

            console.error("Response :", error.response.data);

        }

        return Promise.reject(error);
    }

);

export default api;
