import Select from "react-select";
import { Controller, type Control } from "react-hook-form";

type Option = {
  value: string;
  label: string;
};

type MultiSelectFieldProps = {
  label: string;
  name: string;
  control: Control<any>;
  options: Option[];
  error?: string;
};

const MultiSelectField = ({
  label,
  name,
  control,
  options,
  error,
}: MultiSelectFieldProps) => {
  return (
    <div className="relative">
      {/* Floating Label */}
      <span
        className={`absolute -top-2 left-2 px-1 bg-white text-xs z-10 ${
          error ? "text-red-600" : "text-slate-500"
        }`}
      >
        {label}
      </span>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            options={options}
            isMulti
            isSearchable
            className="text-sm"
            classNamePrefix="react-select"
            placeholder=""
            value={options.filter((option) =>
              field.value?.includes(option.value)
            )}
            onChange={(selected) =>
              field.onChange(selected.map((item) => item.value))
            }
            styles={{
              control: (base, state) => ({
                ...base,
                borderRadius: "6px",
                borderColor: error
                  ? "#ef4444"
                  : state.isFocused
                  ? "#3b82f6"
                  : "#cbd5e1",
                boxShadow: "none",
                paddingTop: "6px",
                paddingBottom: "6px",
                minHeight: "42px",
              }),
              multiValue: (base) => ({
                ...base,
                
                color: "black",
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: "black",
              }),
            }}
          />
        )}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default MultiSelectField;