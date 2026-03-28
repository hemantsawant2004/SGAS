import { useState } from "react";
import { forgotPasswordApi } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";

export default function ForgotPassword() {
  const {
    isSubmitting,
    login
  } = useLogin()
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await forgotPasswordApi({ username, newPassword });
      setMessage(res.message || "Password updated successfully");

      setTimeout(() => {
        navigate("/");
      }, 15000);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    }


  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a] md:flex-row md:bg-transparent">
      <div className="flex w-full items-center justify-center bg-[#0f172a] px-4 py-10 text-white sm:px-6 md:w-1/2">
        <div className="w-full max-w-md rounded-2xl bg-slate-950/20 p-6 sm:p-8 md:rounded-none md:bg-transparent md:p-0">
          <h1 className="text-3xl font-semibold text-white">Forgot Password</h1>
          <p className="mt-2 text-sm text-slate-400 md:hidden">
            Update your password to get back into your account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mt-6">
              <label className="text-sm font-medium text-slate-200">Username</label>
              <input
                placeholder="Enter Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full border-b border-gray-600 bg-transparent px-1 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-200">New Password</label>
              <input
                placeholder="Enter new Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full border-b border-gray-600 bg-transparent px-1 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || login.isPending}
              className="mt-10 w-full rounded-lg bg-[#7468F0] py-3 text-white transition duration-300 hover:bg-purple-600"
            >
              Update Password
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-300">
            Remember password?{" "}
            <Link to="/" className="text-violet-300">
              Login
            </Link>
          </p>

          {message && (
            <p className="mt-4 text-sm text-violet-300">{message}</p>
          )}
        </div>
      </div>

      <div className="hidden w-1/2 flex-col items-center justify-center bg-white p-8 text-black md:flex lg:p-10">
        <div className="max-w-md space-y-4 font-mono">
          <h2 className="text-3xl font-bold font-mono">
            Update Your Password
          </h2>
          <p className="text-slate-800">
            To access your account
          </p>
        </div>

        {/* Illustration Image */}
        <img
          src="/img2.jpg"
          alt="Student Illustration"
          className="relative mt-5 h-auto w-full max-w-[600px]"
        />
      </div>
    </div>
  );
}
