import axios from "axios";

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
|
| Base API for the complete Fleet Management System
|
*/

const api = axios.create({
    baseURL: "http://localhost:5001/api",

    timeout: 60000,

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

        // Future:
        // const token = localStorage.getItem("token");
        //
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }

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
*/

api.interceptors.response.use(

    (response) => {
        return response;
    },

    (error) => {

        console.error("API Error :", error);

        if (error.response) {

            console.error("Status :", error.response.status);

            console.error("Response :", error.response.data);

        }

        return Promise.reject(error);
    }

);

export default api;