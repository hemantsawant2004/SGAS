import { useState } from "react";
import { useForm } from "react-hook-form";
import { Camera } from "lucide-react";
import { useAppSelector } from "../../../app/hooks";
import type { CreateGuideProfileDto } from "../dto/guide.dto";
import {
  useCreateGuideProfile,
  useMyGuideProfile,
  useUpdateGuideProfile,
} from "../hooks/useGuide";
import MultiSelectField from "../../../Components/formcomponents/MultiSelectField";
import InputField from "../../../Components/formcomponents/Inputfield";
import TextAreaField from "../../../Components/formcomponents/TextareaComponent";
import { BackButton } from "../../../Components/formcomponents/BackButtonComponent";

const defaultFormValues: CreateGuideProfileDto = {
  fullName: "",
  email: "",
  phone: "",
  linkedin: "",
  bio: "",
  departmentName: "",
  qualification: "",
  experience: 0,
  expertise: [],
};



const languageOptions = [
  { value: "Java", label: "Java" },
  { value: "Python", label: "Python" },
  { value: "C", label: "C" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "Angular", label: "Angular" },
  { value: "React", label: "React" },
  { value: "MySQL", label: "MySQL" },
  { value: "Oracle", label: "Oracle" },
  { value: "PHP", label: "PHP" },
  { value: "R programming", label: "R programming" },
  { value: "HTML", label: "HTML" },
  { value: "Express", label: "Express" },
  { value: "Android", label: "Android" },
  { value: ".Net", label: ".Net" },
  { value: "Node.js", label: "Node.js" },
  { value: "Firebase", label: "Firebase" },
  { value: "MERN", label: "MERN" },
  { value: "MEAN", label: "MEAN" },
  { value: "ASP.Net", label: "ASP.Net" },

];

function Guide() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateGuideProfileDto>({
    defaultValues: defaultFormValues,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const username = user?.username;
  const { mutate: createProfile, isPending: isCreating } = useCreateGuideProfile(username);
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateGuideProfile(username);

  const {
    data: existingProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useMyGuideProfile(username);

  const profileErrorStatus = (profileError as any)?.response?.status;
  const hasProfile = Boolean(existingProfile) && !profileError;

  const onCreateSubmit = (data: CreateGuideProfileDto) => {
    alert(`Welcome to Guide Allocation Portal ${data.fullName}`)
    createProfile({
      ...data,
      experience: Number(data.experience),
    });
  };

  const onUpdateSubmit = (data: CreateGuideProfileDto) => {
    alert(`Dear, ${data.fullName} Your Profile is Now Updated`);
    updateProfile(
      {
        ...data,
        experience: Number(data.experience),
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const startEdit = () => {
    if (!existingProfile) return;
    reset({
      fullName: existingProfile.fullName,
      email: existingProfile.email,
      phone: existingProfile.phone,
      linkedin: existingProfile.linkedin ?? "",
      bio: existingProfile.bio,
      departmentName: existingProfile.departmentName,
      qualification: existingProfile.qualification,
      experience: existingProfile.experience,
      expertise: existingProfile.expertise ?? [],
    });
    setIsEditing(true);
  };

  const renderProfileForm = (
    mode: "create" | "edit",
    submitHandler: (data: CreateGuideProfileDto) => void,
    isSubmitting: boolean
  ) => (
    <>
      <BackButton />
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 dark:text-black">

        <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:border-white">
          <div className="relative flex min-h-52 items-start bg-gradient-to-r from-slate-700 to-slate-900 px-5 pb-6 pt-8 sm:h-40 sm:min-h-0 sm:items-center sm:px-10 dark:border-white">
            <div>
              <h1 className="text-xl font-bold text-white transition hover:scale-105 sm:text-2xl">
                {/* {mode === "create" ? "Create Profile" : "Edit Profile"} */}
                Guide Allocation Portal
              </h1>
              <p className="mt-1 text-sm text-slate-300">Welcome, {user?.username}</p>
            </div>

            <div className="absolute bottom-4 left-5 sm:-bottom-14 sm:left-auto sm:right-10">
              <label className="cursor-pointer group">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg transition group-hover:scale-105 sm:h-28 sm:w-28">
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

          <div className="px-4 pb-8 pt-24 sm:px-12 sm:pb-12 sm:pt-20 dark:bg-slate-800">
            <form onSubmit={handleSubmit(submitHandler)} className="space-y-10">
              <div className="bg-slate-50 p-6 rounded-2xl shadow-sm ">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Personal Details</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    {/* name */}
                    <InputField
                      label="Full Name"
                      registration={register("fullName", {
                        required: "Full name is required",
                      })}
                      error={errors.fullName?.message}
                    />
                  </div>

                  {/* email */}
                  <div>
                    <InputField
                      label="Email"
                      registration={register("email", {
                        required: "Email is required",
                      })}
                      error={errors.email?.message}
                    />
                  </div>

                  {/* phone number */}
                  <div>
                    <InputField
                      label="Phone"
                      registration={register("phone", {
                        required: "Phone Number is required",
                      })}
                      error={errors.phone?.message}
                    />
                  </div>

                  {/* Linked in */}
                  <div>
                    <InputField
                      label="LinkedIn Profile"
                      registration={register("linkedin", {
                      })}
                      error={errors.linkedin?.message}
                    />
                  </div>
                </div>

                {/* bio */}
                <div className="mt-6">
                  <TextAreaField
                    label="Bio"
                    registration={register("bio", {
                    })}
                    error={errors.bio?.message}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl shadow-sm ">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Qualification Details</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* department */}
                  <div>
                    <InputField
                      label="Department"
                      registration={register("departmentName", {
                        required: "Department Name is required",
                      })}
                      error={errors.departmentName?.message}
                    />
                  </div>

                  {/* Qualification */}
                  <div>
                    <InputField
                      label="Qualification"
                      registration={register("qualification", {
                        required: "Qualification is required",
                      })}
                      error={errors.qualification?.message}
                    />
                  </div>

                  {/* experience */}
                  <div>
                    <InputField
                      label="Experience"
                      registration={register("experience", {
                        required: "experience is required",
                      })}
                      error={errors.experience?.message}
                    />
                  </div>
                  <div>
                    <MultiSelectField
                      label="Expertise (Languages)"
                      name="expertise"
                      control={control}
                      options={languageOptions}
                      error={errors.expertise?.message}
                    />

                    {errors.expertise && (
                      <p className="error">{errors.expertise.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-full rounded-xl bg-slate-200 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-300 sm:w-auto sm:px-8"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-slate-900 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-slate-800 sm:w-auto sm:px-10"
                >
                  {isSubmitting
                    ? mode === "create"
                      ? "Saving..."
                      : "Updating..."
                    : mode === "create"
                      ? "Save Profile"
                      : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <style>{`
        .label {
          font-size: 14px;
          font-weight: 500;
          color: #475569;
        }
        .input {
          margin-top: 6px;
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          outline: none;
          transition: 0.2s;
        }
        .input:focus {
          border-color: #334155;
          box-shadow: 0 0 0 2px rgba(51, 65, 85, 0.2);
        }
        .error {
          font-size: 12px;
          color: #ef4444;
          margin-top: 4px;
        }
      `}</style>
      </div>
    </>
  );

  if (!username) {
    return <div className="p-6 text-slate-600">Loading user...</div>;
  }

  if (isProfileLoading) {
    return <div className="p-6 text-slate-600">Loading profile...</div>;
  }

  if (hasProfile && existingProfile && !isEditing) {
    return (
      <>
        <BackButton />

        <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
          <div className="mx-auto grid max-w-7xl gap-6 sm:gap-10 lg:grid-cols-[320px_1fr]">

            {/* LEFT SIDEBAR */}
            <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-lg dark:border-white dark:bg-slate-800 sm:p-8">

              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white shadow-md dark:bg-gray-600 dark:text-white sm:h-32 sm:w-32 sm:text-4xl">
                {existingProfile.fullName.charAt(0)}
              </div>

              <h1 className="mt-6 text-xl font-bold text-slate-800 dark:text-white">
                {existingProfile.fullName}
              </h1>
                {/* 
              <p className="text-sm text-slate-500 mt-1 dark:text-white">
                {existingProfile.departmentName}
              </p> */}

              <div className="mt-6 w-full space-y-4 border-t pt-6 text-sm text-slate-600 dark:text-white">
                <div>
                  <p className="text-xs text-slate-400 uppercase dark:text-white">Email</p>
                  <p className="font-medium">{existingProfile.email}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase dark:text-white">Phone</p>
                  <p className="font-medium">{existingProfile.phone}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase dark:text-white">Experience</p>
                  <p className="font-medium">
                    I have Experience of, {existingProfile.experience} Years
                  </p>
                </div>
              </div>

              <button
                onClick={startEdit}
                className="mt-8 w-full bg-slate-900 text-white py-2 rounded-xl hover:bg-slate-800 hover:border-white transition"
              >
                Edit Profile
              </button>
            </div>

            {/* RIGHT CONTENT */}
            <div className="space-y-10">

              {/* ABOUT SECTION */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-white dark:bg-slate-800 sm:p-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 dark:text-white">
                  About Me
                </h2>
                <p className="text-slate-600 leading-relaxed dark:text-white">
                  {existingProfile.bio}
                </p>
              </div>

              {/* QUALIFICATIONS */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:bg-slate-800 sm:p-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 dark:text-white">
                  Qualifications
                </h2>

                <div className="grid md:grid-cols-2 gap-6 dark:text-white">
                  <DetailBlock label="Qualification" value={existingProfile.qualification} />
                  <DetailBlock label="Department" value={existingProfile.departmentName} />
                  <DetailBlock label="LinkedIn" value={existingProfile.linkedin || "-"} />
                </div>
              </div>

              {/* EXPERTISE */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:bg-slate-800 dark:text-white sm:p-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 dark:text-white">
                  Technical Expertise
                </h2>

                <div className="flex flex-wrap gap-3 dark:border-white">
                  {existingProfile.expertise?.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm hover:scale-110 transition dark:text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </>
    );
  }

  if (hasProfile && isEditing) {
    return renderProfileForm("edit", onUpdateSubmit, isUpdating);
  }

  if (username && !hasProfile && profileErrorStatus === 404) {
    return renderProfileForm("create", onCreateSubmit, isCreating);
  }

  return (
    <div className="p-6 text-red-600">Unable to load profile right now. Please try again.</div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase mb-1 dark:text-white">
        {label}
      </p>
      <p className="text-slate-800 font-medium dark:text-white">
        {value}
      </p>
    </div>
  );
}
export default Guide;
