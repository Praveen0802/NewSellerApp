import React, { useState, useEffect, useRef } from "react";
import FloatingPlaceholder from "./floatingplaceolder";

const FloatingLabelInput = ({
  label,
  type = "text",
  value = "",
  onChange = () => {},
  onBlur = null,
  onKeyDown = null,
  onClick = null,
  id,
  keyValue,
  showDropdown = false,
  name,
  currencyFormat=false,
  required = false,
  autoComplete = "on",
  mandatory = false,
  labelClassName = "",
  parentClassName = "",
  dropDownComponent,
  readOnly,
  className = "",
  hideLabel = false,
  staticLabel = false,
  placeholder = "",
  error = "",
  rightIcon = null,
  checkLength = false,
  iconBefore = null,
  iconBeforeTooltip = "",
  autoFocus = false,
  showError = false,
  showDelete = false,
  deleteFunction = () => {},
  defaultFocus = false,
  max,
  onFocus = () => {},
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Refs for handling click outside
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Update focus state when value changes
  useEffect(() => {
    setIsFocused(value ? true : false);
  }, [value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  useEffect(() => {
    if (autoFocus) {
      setIsFocused(true);
      document.getElementById(id).focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (
      type === "date" ||
      type === "datetime-local" ||
      (type === "time" && defaultFocus)
    ) {
      setIsFocused(true);
    }
  }, [defaultFocus]);

  const handleBlur = (e) => {
    // Don't close dropdown immediately - let the timeout handle it
    if (e.target.value === "") {
      setIsFocused(false);
    }

    // Use setTimeout to delay the onBlur execution
    // This allows click events in the dropdown to fire first
    setTimeout(() => {
      // Check if the new focus target is within our container
      const activeElement = document.activeElement;
      const isWithinContainer = containerRef.current?.contains(activeElement);
      const isWithinDropdown = dropdownRef.current?.contains(activeElement);
      
      // Only call onBlur if focus moved outside our component
      if (!isWithinContainer && !isWithinDropdown && onBlur) {
        onBlur(e, true);
      }
    }, 150); // Increased timeout to ensure click events fire
  };

  const handleKeyDown = (e) => {
    // Prevent non-numeric characters for number type
    if (type === "number") {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "Home",
        "End",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Clear",
        "Copy",
        "Paste",
      ];

      const isNumberKey = /^[0-9]$/.test(e.key);
      const isDecimalPoint = e.key === "." && !e.target.value?.includes(".");
      const isNegativeSign =
        e.key === "-" &&
        e.target.selectionStart === 0 &&
        !e.target.value.includes("-");
      const isModifierKey = e.ctrlKey || e.metaKey || e.altKey;

      if (
        !allowedKeys.includes(e.key) &&
        !isNumberKey &&
        !isDecimalPoint &&
        !isNegativeSign &&
        !isModifierKey
      ) {
        e.preventDefault();
        return;
      }
    }

    if (onKeyDown && e.key === "Enter") {
      onKeyDown(e, false);
    }
  };

  // Handle input change with number validation
  const handleInputChange = (e) => {
    let inputValue = e.target.value;

    if (type === "number") {
      inputValue = inputValue.replace(/[^0-9.-]/g, "");

      const decimalCount = (inputValue.match(/\./g) || []).length;
      if (decimalCount > 1) {
        const firstDecimalIndex = inputValue.indexOf(".");
        inputValue =
          inputValue.substring(0, firstDecimalIndex + 1) +
          inputValue.substring(firstDecimalIndex + 1).replace(/\./g, "");
      }

      if (inputValue.includes("-")) {
        const negativeIndex = inputValue.indexOf("-");
        if (negativeIndex !== 0) {
          inputValue = inputValue.replace(/-/g, "");
        } else {
          inputValue = "-" + inputValue.substring(1).replace(/-/g, "");
        }
      }

      e.target.value = inputValue;
    }

    onChange(e, keyValue);
  };

  const handleClick = (e) => {
    if (type === "date" || type === "datetime-local" || type === "time") {
      e.target.showPicker?.();
    }

    if (onClick) {
      onClick(e);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleDelete = () => {
    if (deleteFunction) {
      deleteFunction(keyValue);
    }
  };

  // Handle dropdown item clicks - prevent event bubbling
  const handleDropdownClick = (e) => {
    e.stopPropagation();
    // Keep the input focused to prevent dropdown from closing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const actualType = type === "password" && showPassword ? "text" : type;
  const shouldShowDelete = showDelete && value && value.length > 0;

  const getLeftPadding = () => {
    return value?.length <= 3 && iconBefore && checkLength
      ? "pl-12"
      : iconBefore && !checkLength
      ? "pl-12"
      : "px-3";
  };

  const getRightPadding = () => {
    if (type === "password" && shouldShowDelete) return "pr-16";
    if (type === "password" || shouldShowDelete || rightIcon) return "pr-10";
    return iconBefore ? "pr-3" : "";
  };

  const baseClasses = `block w-full ${getLeftPadding()} py-[14px] font-medium text-[14px] rounded border-[1px] focus:outline-none ${
    error ? "border-red-500" : "border-[#DADBE5]"
  } text-[#231F20] caret-[#022B50] ${
    error
      ? "border-red-500"
      : isFocused
      ? "border-[#DADBE5] focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
      : "border-[#DADBE5]"
  } ${getRightPadding()} ${
    type === "number"
      ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      : ""
  }`;

  return (
    <>
    {staticLabel && (
      <div className="mb-2">
        <label className="text-[14px] font-medium text-gray-800">{label}</label>
      </div>
    )}
    <div className={`relative w-full ${parentClassName}`} ref={containerRef}>
      {!hideLabel && (
        <FloatingPlaceholder
          className={`${labelClassName} ${
            value?.length <= 3 && iconBefore && "!left-12"
          } `}
          isFocused={isFocused}
          hasError={!!error}
        >
          <span
            style={{ fontSize: isFocused ? "11px" : "13px" }}
            className={`${labelClassName} ${
              error ? "text-red-500" : "text-[#808082]"
            }`}
          >
            {label}
            {mandatory ? <span className="text-red-400">*</span> : ""}
          </span>
        </FloatingPlaceholder>
      )}

      <div className="relative">
        {/* Left icon - iconBefore with tooltip */}
        {((value?.length <= 3 && iconBefore && checkLength) ||
          (iconBefore && !checkLength)) && (
          <div
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-600 transition-colors h-full"
            onMouseEnter={() => iconBeforeTooltip && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {typeof iconBefore === "function" ? iconBefore() : iconBefore}

            {iconBeforeTooltip && showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-50">
                {iconBeforeTooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-800"></div>
              </div>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          id={id}
          type={actualType}
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          autoComplete={autoComplete}
          required={required}
          readOnly={readOnly}
          className={`${baseClasses} ${
            readOnly && "bg-gray-100 cursor-not-allowed"
          } ${rightIcon ? "pr-10" : ""} ${className} ${
            type === "date" || type === "datetime-local" || type === "time"
              ? "cursor-pointer"
              : ""
          }`}
          placeholder={isFocused ? placeholder : ""}
          {...(max ? { max } : {})}
        />

        {/* Delete button */}
        {shouldShowDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer transition-colors"
            aria-label="Clear input"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Password toggle button */}
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none cursor-pointer ${
              shouldShowDelete ? "right-9" : "right-3"
            }`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {!showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}

        {/* Right icon */}
        {rightIcon && (
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 ${
              type === "password" && shouldShowDelete
                ? "right-16"
                : type === "password" || shouldShowDelete
                ? "right-9"
                : "right-3"
            }`}
          >
            {typeof rightIcon === "function" ? rightIcon() : rightIcon}
          </div>
        )}

        {/* Dropdown - with click handler to prevent closing */}
        {showDropdown && dropDownComponent && (
          <div 
            ref={dropdownRef}
            className="absolute z-[999] shadow-md w-full bg-white"
            onClick={handleDropdownClick}
            onMouseDown={(e) => e.preventDefault()} // Prevent input from losing focus
          >
            {dropDownComponent}
          </div>
        )}
      </div>

      {error && showError && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
    </>
  );
};

export default FloatingLabelInput;