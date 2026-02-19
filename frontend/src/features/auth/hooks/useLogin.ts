import { useState } from "react";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequest as LoginSchema, type LoginRequestType } from '../dto/auth.dto';
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "../../../app/hooks";
// import { loginApi } from "../services/authService";
import { loginApi } from "../services/authService";
import { setAuthenticated } from "../authSlice";
// import { setAuthenticated } from "../authSlice";
import { useLocation, useNavigate } from "react-router-dom";


export const useLogin = () => {
  const [serverMsg, setServerMsg] = useState<string>("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginRequestType>({ resolver: zodResolver(LoginSchema) });

  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const login = useMutation({
    mutationFn: loginApi,
    onSuccess: ({ user }) => {
      //console.log("insuccess",accessToken)
      console.log("userrr", user)
      //dispatch(setUser(user));
      dispatch(setAuthenticated(user))
      nav(loc.state?.from?.pathname ?? '/dashboard', { replace: true });
    },
    onError: (err: any) => {
      // Surface meaningful error
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Check credentials and network.";
      setServerMsg(msg);
      console.error("Login error:", err);
    },
  });

  const onSubmit = (values: LoginRequestType) => {
    console.log("Submitting login with:", values);
    setServerMsg("");
    login.mutate(values);
  };

  return {
    onSubmit,
    handleSubmit,
    errors,
    isSubmitting,
    register,
    login,
    serverMsg,
  }
}
