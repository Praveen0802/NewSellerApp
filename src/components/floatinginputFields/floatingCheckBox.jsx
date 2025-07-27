import React from "react";

const FloatingCheckbox = ({
  id,
  name,
  keyValue,
  label,
  checked,
  onChange,
  className = "",
  labelClassName = "",
  parentClassName = "",
  disabled = false,
  beforeIcon = "",
  afterIcon = "",
  options = [], // Array of options for multi-checkbox
  multiselect = false, // Flag to determine if it's multi-option
  value = [], // For multi-select, this will be an array of selected values
  error = "",
  mandatory = false,
}) => {
  // Handle single checkbox change
  const handleSingleChange = (e) => {
    if (onChange) {
      onChange(e, keyValue);
    }
  };

  // Handle multi-option checkbox change
  const handleMultiChange = (optionValue, optionKey) => {
    if (onChange) {
      const isSelected = Array.isArray(value)
        ? value.includes(optionValue)
        : false;
      let newValue;

      if (isSelected) {
        // Remove from selection
        newValue = Array.isArray(value)
          ? value.filter((val) => val !== optionValue)
          : [];
      } else {
        // Add to selection
        newValue = Array.isArray(value)
          ? [...value, optionValue]
          : [optionValue];
      }

      // Create a synthetic event-like object
      const syntheticEvent = {
        target: {
          name: name,
          value: newValue,
          checked: !isSelected,
        },
      };

      // Pass the synthetic event and keyValue (not optionKey)
      onChange(syntheticEvent, keyValue);
    }
  };

  // Render single checkbox
  const renderSingleCheckbox = () => (
    <div
      className={`flex border-[1px] w-full ${
        error ? "border-red-500" : "border-[#DADBE5]"
      } rounded-[6px] items-center ${className}`}
    >
      {beforeIcon && (
        <div className="p-[8px] border-r-[1px] border-[#DADBE5]">
          {beforeIcon}
        </div>
      )}
      <div className="flex gap-4 justify-between w-full px-[10px] py-[6px] items-center">
        <div className="flex items-center gap-2">
          <p
            title={label}
            className={`${labelClassName} text-[12px] truncate ${
              error ? "text-red-500" : "text-[#343432]"
            } font-normal`}
          >
            {label}
            {mandatory && <span className="text-red-500 ml-1">*</span>}
          </p>
          {afterIcon && afterIcon}
        </div>
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={handleSingleChange}
          className={`border-[1px] ${
            error ? "border-red-500" : "border-[#DADBE5]"
          } w-[16px] h-[16px] cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={disabled}
        />
      </div>
    </div>
  );

  // Render multi-option checkboxes
  const renderMultiCheckboxes = () => (
    <div className={`w-full ${parentClassName}`}>
      {label && (
        <div className="mb-3">
          <p
            className={`text-[14px] font-medium text-[#343432] ${labelClassName}`}
          >
            {label}
            {mandatory && <span className="text-red-500 ml-1">*</span>}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const optionValue =
            typeof option === "object" ? option.value : option;
          const optionLabel =
            typeof option === "object" ? option.label : option;
          const optionKey =
            typeof option === "object" ? option.key || option.value : option;
          const optionIcon = typeof option === "object" ? option.icon : null;
          const isSelected = Array.isArray(value)
            ? value.includes(optionValue)
            : false;

          return (
            <div
              key={optionKey || index}
              className={`flex border-[1px] w-full ${
                error ? "border-red-500" : "border-[#DADBE5]"
              } rounded-[6px] items-center hover:bg-gray-50 transition-colors ${
                isSelected ? "bg-blue-50 border-blue-300" : ""
              }`}
            >
              {optionIcon && (
                <div className="p-[8px] border-r-[1px] border-[#DADBE5]">
                  {optionIcon}
                </div>
              )}
              <div className="flex gap-4 justify-between w-full px-[10px] py-[6px] items-center">
                <div className="flex items-center gap-2">
                  <p
                    title={optionLabel}
                    className={`text-[12px] truncate ${
                      error ? "text-red-500" : "text-[#343432]"
                    } font-normal`}
                  >
                    {optionLabel}
                  </p>
                </div>
                <input
                  type="checkbox"
                  id={`${id || name}_${index}`}
                  name={`${name}_${index}`}
                  checked={isSelected}
                  onChange={() => handleMultiChange(optionValue, optionKey)}
                  className={`border-[1px] ${
                    error ? "border-red-500" : "border-[#DADBE5]"
                  } w-[16px] h-[16px] cursor-pointer ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={disabled}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Return error message component
  const renderError = () => {
    if (error) {
      return <p className="mt-1 text-sm text-red-500">{error}</p>;
    }
    return null;
  };

  return (
    <div className={` w-full ${parentClassName}`}>
      {multiselect && options.length > 0
        ? renderMultiCheckboxes()
        : renderSingleCheckbox()}
      {renderError()}
    </div>
  );
};

export default FloatingCheckbox;
