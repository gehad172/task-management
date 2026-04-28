import type { LoginResponseDto } from "@/types/api";
import { apiClient } from "@/lib/api/client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function loginRequest(payload: LoginPayload): Promise<LoginResponseDto> {
  const { data } = await apiClient.post<LoginResponseDto>("/api/auth/login", payload);
  return data;
}

export async function registerRequest(payload: RegisterPayload): Promise<LoginResponseDto> {
  const { data } = await apiClient.post<LoginResponseDto>("/api/auth/register", payload);
  return data;
}