import axios, { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  status: number;
  message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

function requestHadBearerToken(config: { headers?: unknown } | undefined): boolean {
  if (!config?.headers) return false;
  const h = config.headers as Record<string, string | undefined> & {
    get?: (name: string) => string | undefined;
  };
  const auth =
    typeof h.get === "function"
      ? h.get("Authorization") ?? h.get("authorization")
      : h.Authorization ?? h.authorization;
  return typeof auth === "string" && auth.startsWith("Bearer ");
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  const token = session?.user?.backendToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (requestHadBearerToken(error.config)) {
        await signOut({ redirect: false });
      }
    }

    if (!error.response) {
      return Promise.reject(new ApiError(0, "Network error. Please check your connection."));
    }

    const responseData = error.response?.data as ApiErrorResponse;
    const message = responseData?.message || responseData?.error || error.message || "An error occurred";

    return Promise.reject(new ApiError(error.response.status, message));
  },
);
