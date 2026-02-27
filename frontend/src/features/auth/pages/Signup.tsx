import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const [step, setStep] = useState(1);

  const roleField = register("role");

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  useEffect(() => {
    if (selectedRole === "guide" && step === 2) {
      setStep(3);
    }
  }, [selectedRole, step]);

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 bg-[#0f172a] flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[500px] space-y-6"
        >
          <h1 className="text-3xl font-semibold text-white">Sign Up</h1>

          {/* STEP INDICATOR */}
          <div className="flex gap-2">
            {(selectedRole === "student" ? [1,2,3]:[1,3]).map((s,index)=>(
              <div
              key={s}
              className={`h-2 flex-1 rounded ${
                step >=s ? "bg-purple-500" : "bg-gray-600"
              }`}
              />
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <>
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
                  className="mt-2 w-full bg-[#0f172a] border-b border-gray-600
                             text-white px-1 py-2 focus:outline-none focus:border-purple-500"
                  defaultValue="student"
                >
                  <option value="student">Student</option>
                  <option value="guide">Guide</option>
                </select>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-3 rounded-lg bg-[#7468F0] hover:bg-purple-600 text-white"
              >
                Next
              </button>
            </>
          )}

          {/* STEP 2 - STUDENT ONLY */}
          {step === 2 && selectedRole === "student" && (
            <>
              <div className="flex gap-6">
                <div className="w-1/2">
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

                <div className="w-1/2">
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

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 py-3 rounded-lg bg-gray-600 text-white"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-1/2 py-3 rounded-lg bg-[#7468F0] text-white"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* STEP 3 - PASSWORD */}
          {step === 3 && (
            <>
              <div className="relative">
                <label className="text-sm text-gray-300">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter password"
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
              </div>

              <div className="relative">
                <label className="text-sm text-gray-300">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm password"
                  className="mt-2 w-full bg-transparent border-b border-gray-600
                             text-white px-1 py-2 focus:outline-none focus:border-purple-500"
                />
                <span
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-2 top-9 cursor-pointer text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </span>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 py-3 rounded-lg bg-gray-600 text-white"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || signup.isPending}
                  className="w-1/2 py-3 rounded-lg bg-[#7468F0] hover:bg-purple-600 text-white"
                >
                  {signup.isPending
                    ? "Creating account..."
                    : "Sign Up"}
                </button>
              </div>
            </>
          )}

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

      {/* RIGHT SIDE */}
      <div className="hidden md:flex relative w-1/2 overflow-hidden
                      flex-col items-center justify-center text-white p-10">

        <div className="absolute w-72 h-72 bg-white/10 rounded-full 
                        top-10 left-10 blur-2xl animate-floatSlow" />

        <div className="absolute w-96 h-96 bg-white/10 rounded-full 
                        bottom-10 right-10 blur-3xl animate-floatReverse" />

        <div className="relative z-10 max-w-md text-black space-y-4 font-mono">
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