import { api } from "../../../app/config/axios.config";
import {
  SessionUser,
  type LoginRequestType,
  type SignupRequestType,
} from "../dto/auth.dto";

export async function fetchMe() {
  console.log("inside fetch me...")
  const { data } = await api.get("/auth/me");
  return data;
}
export async function loginApi(payload: LoginRequestType) {
  console.log("inside login request",payload)
  const { data } = await api.post('/auth/login', payload);
 
  return { user: SessionUser.parse(data) };

}
export async function signupApi(payload: SignupRequestType) {
  const { confirmPassword, ...requestBody } = payload;
  void confirmPassword;
  const { data } = await api.post("/auth/signup", requestBody);
  return data as { message: string };
}

export async function logoutApi() { await api.post('/auth/logout'); }

export const forgotPasswordApi = async (data: {
  username: string;
  newPassword: string;
}) => {
  const res = await api.post("/auth/forgot-password", data);
  return res.data;
};