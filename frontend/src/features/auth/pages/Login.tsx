import { Link, useLocation } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const {
    onSubmit,
    handleSubmit,
    errors,
    isSubmitting,
    register,
    login,
    serverMsg,
  } = useLogin();

  const location = useLocation() as { state?: { signedUp?: boolean } };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      
      {/* LEFT SIDE - LOGIN */}
      <div className="w-1/2 bg-[#0f172a] flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[350px] space-y-6"
        >
          <div>
            <h1 className="text-3xl font-semibold text-white">Login</h1>
          </div>

          {location.state?.signedUp && (
            <p className="text-green-400 text-sm">
              Signup successful. Please log in.
            </p>
          )}

          {/* Username */}
          <div>
            <label className="text-sm text-gray-300">Username</label>
            <input
              {...register("username")}
              placeholder="Username"
              className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password"
              className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-9 cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>

            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div><br/>

          <button
            type="submit"
            disabled={isSubmitting || login.isPending}
            className="w-full py-3 rounded-lg 
                       bg-[#7468F0] hover:bg-purple-600
                       text-white transition duration-300"
          >
            {login.isPending ? "Signing in..." : "Login"}
          </button>

          <p className="text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-white hover:underline">
              Sign up
            </Link>
          </p>

          {(login.isError || serverMsg) && (
            <p className="text-red-500 text-sm">
              {serverMsg || "Invalid credentials"}
            </p>
          )}
        </form>
      </div>

      {/* RIGHT SIDE - WELCOME SECTION */}
      <div className="w-1/2 bg-white 
                      flex flex-col items-center justify-center text-black p-10">
        <div className="max-w-md space-y-4 font-mono">
          <h2 className="text-3xl font-bold font-mono">
            Welcome to, <br /> Project Guide Allocation Portal
          </h2>
          <p className="text-slate-800">
            Login to access your account
          </p>
        </div>

        {/* Illustration Image */}
        <img
          src="/img2.jpg"
          alt="Student Illustration"
          className="relative  mt-5 w-[600px] h-[400px]  mix-blend-multiply dark:brightness-200"
        />
      </div>

    </div>
  );
}

export default Login;
