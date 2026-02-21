import type { UseFormRegisterReturn } from "react-hook-form";

type TextAreaProps = {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  rows?: number; // optional, default 4
};

const TextAreaField = ({
  label,
  registration,
  error, // <-- fixed: include error here
  rows = 4,  // default 4 rows
}: TextAreaProps) => {
  return (
    <div className="relative w-full">
      {/* Floating label */}
       <span
        className={`absolute -top-2 left-2 px-1 bg-white text-xs pointer-events-none ${
          error ? "text-red-600" : "text-slate-500"
        } peer-focus:text-blue-600`}
      >
        {label}
      </span>

      <textarea
        {...registration}
        rows={rows}
        placeholder=" " // important for floating label
        className={`peer w-full border rounded px-3 pt-4 pb-2 text-sm outline-none
        ${error ? "border-red-500" : "border-gray-300 focus:border-blue-500"}`}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TextAreaField;
