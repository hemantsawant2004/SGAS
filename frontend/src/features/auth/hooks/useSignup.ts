import { useState } from "react";
import { useForm, Watch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { SignupRequest, type SignupRequestType } from "../dto/auth.dto";
import { signupApi } from "../services/authService";

export const useSignup = () => {
  const [serverMsg, setServerMsg] = useState<string>("");
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupRequestType>({
    resolver: zodResolver(SignupRequest),
  });

  const signup = useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      nav("/", {
        replace: true,
        state: { signedUp: true },
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Signup failed. Please try again.";
      setServerMsg(msg);
      console.error("Signup error:", err);
    },
  });

  const onSubmit = (values: SignupRequestType) => {
    setServerMsg("");
    signup.mutate(values);
  };

  return {
    onSubmit,
    handleSubmit,
    errors,
    isSubmitting,
    register,
    signup,
    serverMsg,
    Watch
  };
};

