/**
 * Axios Helper for API Requests
 *
 * It automatically attaches the Authorization header with the access token from localStorage
 * to each request, and handles token expiration by intercepting 401 responses.
 *
 * - Response Interceptor:
 *   - Catches 401 Unauthorized responses (except for the refresh endpoint) and triggers a token refresh.
 *   - Uses an in-memory flag to ensure only one token refresh is in progress at any time.
 *   - Queues requests that arrive while a token refresh is ongoing and retries them once the new token is obtained.
 *   - Limits token refresh attempts to MAX_RETRY_COUNT.
 *   - On successful token refresh, updates localStorage with the new access token and retries failed requests.
 *   - On failure to refresh (or if maximum attempts are reached), clears tokens from localStorage and rejects the request.
 *
 * - Token Refresh:
 *   - The attemptTokenRefresh() function calls '/api/refresh' using the refresh token stored in localStorage.
 *   - If a new access token is successfully returned, it is saved to localStorage.
 *
 * @module axiosHelper
 */


import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: "/api",
});

// Maximum number of token refresh attempts
const MAX_RETRY_COUNT = 5;
// In-memory variable to track refresh attempts for the current failing request
let refreshAttemptCount = 0;
// A flag to indicate a currently running refresh request to prevent parallel refresh attempts
let isRefreshing = false;
// A queue for requests that arrive while a refresh request is in progress
let failedRequestsQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: string) => void;
}[] = [];

// Function to attempt a token refresh
export async function attemptTokenRefresh() {
    console.log("Refreshing token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    const response = await axios.post("/api/refresh", null, {
        headers: {
            Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
        },
    });

    const { access_token } = response.data;

    if (!access_token) {
        throw new Error("No access token returned by refresh endpoint");
    }

    // Update local storage with new token
    localStorage.setItem("access_token", access_token);
    return access_token;
}

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("access_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: Error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // Reset retry count on every successful response
        refreshAttemptCount = 0;
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config!;

        // If the error is not a 401 or the original request URL is the refresh endpoint, just reject
        if (
            error.response?.status !== 401 ||
            originalRequest.url === "/api/refresh"
        ) {
            return Promise.reject(error);
        }

        // If we are already refreshing the token, queue the request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedRequestsQueue.push({ resolve, reject });
            })
                .then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return axiosInstance(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        }

        // If not currently refreshing and we haven't hit the max retry count, attempt refresh
        if (refreshAttemptCount < MAX_RETRY_COUNT) {
            refreshAttemptCount++;
            isRefreshing = true;

            try {
                const newToken = await attemptTokenRefresh();
                isRefreshing = false;

                // Process any requests that came in during refresh
                failedRequestsQueue.forEach((req) => req.resolve(newToken));
                failedRequestsQueue = [];

                // Retry the original request with the new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                // Refresh failed. Clear queued requests
                const error = refreshError as string;
                failedRequestsQueue.forEach((req) => req.reject(error));
                failedRequestsQueue = [];

                // Remove tokens if present
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");

                return Promise.reject(refreshError);
            }
        } else {
            // Max attempts reached. Clear tokens and reject
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            return Promise.reject(error);
        }
    }
);

export default axiosInstance;
