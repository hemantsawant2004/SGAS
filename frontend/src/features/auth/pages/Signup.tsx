import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSignup } from "../hooks/useSignup";

function Signup() {
  const {
    onSubmit,
    handleSubmit,
    errors,
    isSubmitting,
    register,
    signup,
    serverMsg,
  } = useSignup();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "guide">("student");
  const roleField = register("role");

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE - SIGNUP FORM */}
      <div className="w-full md:w-1/2 bg-[#0f172a] flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[500px] space-y-6"
        >
          <div>
            <h1 className="text-3xl font-semibold text-white">Sign Up</h1>

          </div>

      <div className="gap-6">
          {/* Username */}
          <div>
            <label className="text-sm text-gray-300">Username</label>
            <input
              {...register("username")}
              placeholder="Enter username"
              className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* role */}
          <div>
            <label className="text-sm text-gray-300">Role</label>
            <select
              name={roleField.name}
              ref={roleField.ref}
              onBlur={roleField.onBlur}
              onChange={(e) => {
                roleField.onChange(e);
                setSelectedRole(e.target.value as "student" | "guide");
              }}
              className="mt-2 w-full bg-[#0f172a] text-white  border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
              defaultValue="student"
            >
              <option value="student" className="text-white">Student</option>
              <option value="guide" className="text-white">Guide</option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>
      </div>

          {selectedRole === "student" && (
            <>
              <div className="flex gap-6">
                {/* class */}
                <div>
                  <label className="text-sm text-gray-300">Class</label>
                  <input
                    {...register("class")}
                    placeholder="Enter your class"
                    className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
                  />
                  {errors.class && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.class.message}
                    </p>
                  )}
                </div>

                {/* division */}
                <div>
                  <label className="text-sm text-gray-300">Division</label>
                  <input
                    {...register("division")}
                    placeholder="Enter your division"
                    className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
                  />
                  {errors.division && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.division.message}
                    </p>
                  )}
                </div>

              </div>

              {/* roll number */}
              <div>
                <label className="text-sm text-gray-300">Roll Number</label>
                <input
                  {...register("rollNumber")}
                  placeholder="Enter your Roll Number"
                  className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
                />
                {errors.rollNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.rollNumber.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Password */}
          <div className="relative">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter password"
              className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500 bg-slate-800"
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
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="text-sm text-gray-300">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm password"
              className="mt-2 w-full bg-transparent border-b border-gray-600
                         text-white px-1 py-2 focus:outline-none focus:border-purple-500"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-9 cursor-pointer text-gray-400"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>


          <button
            type="submit"
            disabled={isSubmitting || signup.isPending}
            className="w-full py-3 rounded-lg 
                       bg-[#7468F0] hover:bg-purple-600
                       text-white transition duration-300"
          >
            {signup.isPending ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/" className="text-white hover:underline">
              Login
            </Link>
          </p>

          {(signup.isError || serverMsg) && (
            <p className="text-red-500 text-sm">
              {serverMsg || "Signup failed"}
            </p>
          )}
        </form>
      </div>

      {/* RIGHT SIDE - WELCOME SECTION */}
      <div className="hidden md:flex relative w-1/2 overflow-hidden
                      flex-col items-center justify-center text-white p-10">

        {/* Floating Shapes */}
        <div className="absolute w-72 h-72 bg-white/10 rounded-full 
                        top-10 left-10 blur-2xl animate-floatSlow" />

        <div className="absolute w-96 h-96 bg-white/10 rounded-full 
                        bottom-10 right-10 blur-3xl animate-floatReverse" />

        <div className="absolute w-40 h-40 bg-white/10 rounded-full 
                        top-1/2 right-20 blur-xl animate-floatSlow" />

        {/* Content */}
        <div className="relative z-10 max-w-md text-black  space-y-4 font-mono">
          <h2 className="text-3xl font-bold">
            Join the <br /> Project Guide Allocation Portal
          </h2>
          <p className="text-slate-800">
            Create your account to get started
          </p>
        </div>

        <img
          src="/img2.jpg"
          alt="Student Illustration"
          className="relative z-10 mt-10 w-[600px] h-[400px]"
        />
      </div>
    </div>
  );
}

export default Signup;
