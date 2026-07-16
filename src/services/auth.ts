import { LoginSchemaType, RegisterSchemaType } from "@/lib/schemas/auth";
import apiClient from "./apiClient";

export const loginService = async (params: LoginSchemaType) => {
  const { data } = await apiClient().post("/auth/login", {
    email: params.email,
    password: params.password,
  });

  return data;
};

export const registrationService = async (params: RegisterSchemaType) => {
  const { data } = await apiClient().post("/auth/register", {
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    phone: params.phone,
    location: params.location,
  });

  return data;
};
