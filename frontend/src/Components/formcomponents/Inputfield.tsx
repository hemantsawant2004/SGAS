import type { UseFormRegisterReturn } from "react-hook-form";


type InputFieldProps = {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
};

const InputField = ({ label, error, registration }: InputFieldProps) => {
  return (
    <div className="relative">
      {/* Placeholder / border label */}
      <span
        className={`absolute -top-2 left-2 px-1 bg-white text-xs pointer-events-none ${
          error ? "text-red-600" : "text-slate-500"
        } peer-focus:text-blue-600`}
      >
        {label}
      </span>

      <input
        {...registration}
        className={`peer w-full border rounded px-3 pt-4 pb-2 text-sm outline-none ${
          error
            ? "border-red-500"
            : "border-slate-300 focus:border-blue-500"
        }`}
      />
    

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputField;