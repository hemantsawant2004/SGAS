import { useState } from "react";
import { forgotPasswordApi } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";

export default function ForgotPassword() {
  const {
    isSubmitting,
    errors,
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
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT SIDE (Same Dark Panel) */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: 350 }}>
          <h1>Forgot Password</h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginTop: 20 }}>
              <label>Username</label>
              <input
                placeholder="Enter Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <label>New Password</label>
              <input
                placeholder="Enter new Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || login.isPending}
              className="w-full py-3 rounded-lg mt-10
                       bg-[#7468F0] hover:bg-purple-600
                       text-white transition duration-300"
            >
              Update Password
            </button>
          </form>

          <p style={{ marginTop: 15 }}>
            Remember password?{" "}
            <Link to="/" style={{ color: "#a78bfa" }}>
              Login
            </Link>
          </p>

          {message && (
            <p style={{ marginTop: 15, color: "#bf8ddb", fontSize: 15 }}>{message}</p>
          )}
        </div>
      </div>

      <div className="w-1/2 bg-white 
                      flex flex-col items-center justify-center text-black p-10">
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
          className="relative  mt-5 w-[600px] h-[400px]"
        />
      </div>
    </div> 
  );
}