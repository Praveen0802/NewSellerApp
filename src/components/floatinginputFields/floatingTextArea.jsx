import React, { useState, useEffect } from "react";
import FloatingPlaceholder from "./floatingplaceolder";

const FloatingLabelTextarea = ({
  label,
  value = "",
  onChange,
  onBlur = null,
  onKeyDown = null,
  id,
  keyValue,
  name,
  required = false,
  autoComplete = "on",
  mandatory = false,
  labelClassName = "",
  readOnly,
  className = "",
  placeholder = "",
  error = "",
  rows = 4,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Update focus state when value changes
  useEffect(() => {
    setIsFocused(value ? true : false);
  }, [value]);

  const handleFocus = () => setIsFocused(true);

  const handleBlur = (e) => {
    if (e.target.value === "") {
      setIsFocused(false);
    }

    // Call the onBlur callback if provided
    if (onBlur) {
      onBlur(e, true);
    }
  };

  const handleKeyDown = (e) => {
    // Call the onKeyDown callback if provided
    if (onKeyDown && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onKeyDown(e, false);
    }
  };

  const baseClasses = `block w-full px-3 py-[14px] text-[14px] rounded border-[1px] focus:outline-none ${
    error ? "border-red-500" : "border-[#DADBE5]"
  } text-[#231F20] caret-[#022B50] ${
    error
      ? "border-red-500"
      : isFocused
      ? "border-[#DADBE5] focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
      : "border-[#DADBE5]"
  } resize-none`;

  return (
    <div className="relative w-full">
      <div className="relative">
        <textarea
          id={id}
          name={name}
          value={value || ""}
          onChange={(e) => onChange(e, keyValue)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || label}
          onKeyDown={handleKeyDown}
          autoComplete={autoComplete}
          required={required}
          readOnly={readOnly}
          className={`${baseClasses} ${
            readOnly && "bg-gray-100 cursor-not-allowed"
          } ${className}`}
          rows={rows}
          maxLength={maxLength}
        />
      </div>

      {maxLength && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default FloatingLabelTextarea;
