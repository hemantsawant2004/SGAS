import { useForm } from "react-hook-form";
import { useCreateGuideProfile } from "../hooks/useGuide";
import type { CreateGuideProfileDto } from "../dto/guide.dto";
import { useState } from "react";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";

function Guide() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGuideProfileDto>();

  const createProfile = useCreateGuideProfile();
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
const user = useAppSelector((s) => s.auth.user);

  const onSubmit = (data: CreateGuideProfileDto) => {
    // simulate success temporarily
    setSuccess(true);

    // redirect after 2 seconds
    setTimeout(() => {
      navigate("/guide/dashboard");
    }, 2000);
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center p-8 ">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
                        
        {/* HEADER */}
        <div className="bg-slate-400 h-36 relative">
            
          <div className="absolute -bottom-14 left-10">
            <div className="relative">
           <p className="text-sm font-semibold mb-6 text-gray-800 mt-10 font-mono">
               Hey, {user?.username} Create Your Profile
              </p> 
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
                <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="text-gray-500" size={28} />
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="pt-20 px-10 pb-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <input
                  {...register("fullName", { required: "Full name is required" })}
                  placeholder="Enter full name"
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-teal-400 outline-none"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-gray-600">Phone Number</label>
                <input
                  {...register("phone", { required: "Phone number is required" })}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-teal-400 outline-none"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label className="text-sm text-gray-600">Department</label>
                <input
                  {...register("department", { required: "Department is required" })}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-teal-400 outline-none"
                  placeholder="Enter department"
                />
                {errors.department && (
                  <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="text-sm text-gray-600">Specialization</label>
                <input
                  {...register("specialization", { required: "Specialization is required" })}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-teal-400 outline-none"
                  placeholder="Enter your specialization"
                />
                {errors.specialization && (
                  <p className="text-xs text-red-500 mt-1">{errors.specialization.message}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm text-gray-600">Bio</label>
              <textarea
                {...register("bio", { required: "Bio is required" })}
                rows={4}
                className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-100 focus:ring-2 focus:ring-teal-400 outline-none resize-none"
                placeholder="Write your bio"
              />
              {errors.bio && (
                <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
              )}
            </div>

            {/* BUTTON */}
            <div className="flex justify-end space-x-4 items-center">
              {success && (
                <p className="text-green-600 font-medium">Profile created successfully! Redirecting...</p>
              )}
              <button
                type="submit"
                disabled={createProfile.isPending}
                className="px-8 py-3 rounded-xl bg-slate-800 text-white font-medium transition shadow-md"
              >
                {createProfile.isPending ? "Creating..." : "Save Profile"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
    </>
  );
}

export default Guide;