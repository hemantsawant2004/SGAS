import { Link, useLocation } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBackground3D } from "../../../Components/ui/AnimatedBackground3D";

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
    <div className="relative min-h-screen flex text-white overflow-hidden bg-slate-950">
      <AnimatedBackground3D />
      
      {/* LEFT SIDE - LOGIN */}
      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6">
        <motion.form
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-6 rounded-3xl border border-slate-700/50 bg-slate-950/40 p-6 sm:p-8 shadow-premium backdrop-blur-xl md:max-w-[450px]"
        >
          <div>
            <h1 className="text-3xl font-semibold text-white">Login</h1>
            <p className="mt-2 text-sm text-slate-400 md:hidden">
              Sign in to continue to the portal.
            </p>
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
            <Link className="text-white text-xs" to="/forgot-password">Forgot Password?</Link>
            
          </div>

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
        </motion.form>
      </div>

      {/* RIGHT SIDE - WELCOME SECTION */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 hidden w-1/2 md:flex flex-col items-center justify-center p-10 backdrop-blur-sm border-l border-white/5"
      >
        <div className="max-w-md space-y-4">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent"
          >
            Welcome to <br /> Project Guide Allocation
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-slate-400 text-lg"
          >
            Streamlined project management and unified allocation made elegant.
          </motion.p>
        </div> 
 
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          src="/img2.jpg"
          alt="Student Illustration"
          className="relative mt-8 w-auto max-w-[500px] rounded-3xl object-cover shadow-2xl opacity-90 mix-blend-luminosity border border-white/10"
        />
      </motion.div>

    </div>
  );
}

export default Login;
