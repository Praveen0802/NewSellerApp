import React, { useEffect, useRef, useState } from "react";
import FloatingPlaceholder from "./floatingplaceolder";
import { IconStore } from "@/utils/helperFunctions/iconStore";

const FloatingSelect = ({
  options = [],
  label = "Select",
  selectedValue = null,
  onSelect,
  keyValue,
  placeholder = "",
  className = "",
  mandatory = false,
  selectedClassName = "",
  paddingClassName = "px-3 py-[14px]",
  error = "",
  id,
  name,
  required = false,
  labelClassName = "",
  hideLabel = false,
  disabled = false,
  searchable = false,
  rightIcon = null,
  multiselect = false, // New prop for multiselect functionality
  openUpward = false, // New prop to control dropdown direction
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(
    multiselect
      ? Array.isArray(selectedValue)
        ? selectedValue
        : []
      : selectedValue
  );
  const [isFocused, setIsFocused] = useState(selectedValue ? true : false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Only unfocus if no value is selected
        if (
          (!selected && !multiselect) ||
          (multiselect && selected.length === 0)
        ) {
          setIsFocused(false);
        }
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selected, multiselect]);

  // Update selected value when prop changes
  useEffect(() => {
    if (multiselect) {
      setSelected(Array.isArray(selectedValue) ? selectedValue : []);
    } else {
      setSelected(selectedValue);
    }

    if (
      (multiselect &&
        Array.isArray(selectedValue) &&
        selectedValue.length > 0) ||
      (!multiselect && selectedValue)
    ) {
      setIsFocused(true);
    }
  }, [selectedValue, multiselect]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option, objectType) => {
    if (multiselect) {
      const optionValue =
        typeof option === "object" && option !== null ? option.value : option;

      // Check if the option is already selected
      const isSelected = selected.some((item) => {
        const itemValue =
          typeof item === "object" && item !== null ? item.value : item;
        return itemValue === optionValue;
      });

      let newSelected;
      if (isSelected) {
        // Remove option if already selected
        newSelected = selected.filter((item) => {
          const itemValue =
            typeof item === "object" && item !== null ? item.value : item;
          return itemValue !== optionValue;
        });
      } else {
        // Add option if not selected
        newSelected = [...selected, option];
      }

      setSelected(newSelected);
      setIsFocused(true);

      if (onSelect) {
        onSelect(newSelected, keyValue, "select", objectType);
      }
    } else {
      // Original single select behavior
      setSelected(option);
      setIsOpen(false);
      setIsFocused(true);
      setSearchTerm("");

      if (onSelect) {
        onSelect(option, keyValue, "select", objectType);
      }
    }
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();

    // Extract values from filtered options in the same format they're stored in selected state
    const allSelectedValues = filteredOptions.map((option) => {
      // If options are objects with value property, extract just the value
      // Otherwise use the option itself (for simple value arrays)
      return option.value !== undefined ? option.value : option;
    });

    setSelected(allSelectedValues);

    if (onSelect) {
      onSelect(allSelectedValues, keyValue, "select");
    }
  };

  const handleDeselectAll = (e) => {
    e.stopPropagation();
    setSelected([]);
    if (onSelect) {
      onSelect([], keyValue, "select");
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(true);
    }
  };

  // Find the currently selected option's label
  const getSelectedLabel = () => {
    if (multiselect) {
      if (!selected || selected.length === 0) return "";

      if (selected.length === 1) {
        const selectedOption = options.find((option) => {
          const optionValue =
            option.value !== undefined ? option.value : option;
          const selectedValue =
            selected[0].value !== undefined ? selected[0].value : selected[0];
          return optionValue === selectedValue;
        });

        return selectedOption ? selectedOption.label || selectedOption : "";
      } else {
        return `${selected.length} items selected`;
      }
    } else {
      // Original single select logic
      if (!selected) return "";

      const selectedOption = options.find(
        (option) => option.value === selected || option === selected
      );

      return selectedOption ? selectedOption.label || selectedOption : "";
    }
  };

  // Filter options based on search term
  const filteredOptions = options.filter((option) => {
    const label = option.label !== undefined ? option.label : option;
    return label.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Check if an option is selected in multiselect mode
  const isOptionSelected = (option) => {
    if (!multiselect || !selected || selected.length === 0) return false;

    const optionValue = option.value !== undefined ? option.value : option;

    return selected.some((item) => {
      const itemValue =
        typeof item === "object" && item !== null ? item.value : item;
      return itemValue === optionValue;
    });
  };

  // Base classes without padding (which is now customizable)
  const baseClasses = `block w-full text-[14px] rounded border-[1px] focus:outline-none ${
    error ? "border-red-500" : "border-[#DADBE5]"
  } text-[#231F20] ${
    error
      ? "border-red-500"
      : isFocused
      ? "border-[#DADBE5] focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
      : "border-[#DADBE5]"
  } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-pointer"}`;

  // Determine dropdown positioning classes
  const getDropdownPositionClasses = () => {
    if (openUpward) {
      return "absolute z-[99] w-full bottom-full mb-1 bg-white rounded-md shadow-lg";
    }
    return "absolute z-[99] w-full mt-1 bg-white rounded-md shadow-lg";
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {!hideLabel && (
        <FloatingPlaceholder
          className={`${labelClassName} ${disabled && "!bg-gray-100"}`}
          isFocused={isFocused || isOpen}
          hasError={!!error}
        >
          <span
            style={{ fontSize: isFocused || isOpen ? "11px" : "13px" }}
            className={`${labelClassName} ${
              error ? "text-red-500" : "text-[#808082]"
            }`}
          >
            {label}
            {mandatory ? <span className="text-red-400">*</span> : ""}
          </span>
        </FloatingPlaceholder>
      )}

      <div
        onClick={toggleDropdown}
        className={`${baseClasses} ${paddingClassName} flex items-center justify-between relative`}
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label`}
        tabIndex={disabled ? -1 : 0}
      >
        {searchable && isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder || "Search..."}
            className="w-full outline-none bg-transparent"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={`block ${selectedClassName} ${   //removed truncate to show full option content
              !selected || (multiselect && selected.length === 0)
                ? "text-gray-400"
                : ""
            }`}
          >
            {getSelectedLabel() || (isFocused ? placeholder : "")}
          </span>
        )}

        <div className="flex items-center">
          {rightIcon && (
            <div className="mr-2">
              {typeof rightIcon === "function" ? rightIcon() : rightIcon}
            </div>
          )}
          <svg
            className={`w-5 h-5 text-[#130061] transition-transform duration-200 ${
              isOpen
                ? openUpward
                  ? "transform rotate-0"
                  : "transform rotate-180"
                : openUpward
                ? "transform rotate-180"
                : ""
            } ${disabled ? "text-gray-400" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className={getDropdownPositionClasses()}>
          {multiselect && (
            <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 cursor-pointer hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-blue-600 cursor-pointer hover:text-blue-800"
              >
                Deselect All
              </button>
            </div>
          )}
          <ul
            className="py-1 overflow-auto text-[14px] rounded-md max-h-60 focus:outline-none"
            role="listbox"
            id={`${id}-listbox`}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const value =
                  option.value !== undefined ? option.value : option;
                const label =
                  option.label !== undefined ? option.label : option;
                const isSelectedOption = multiselect
                  ? isOptionSelected(option)
                  : selected === value || selected === option;

                return (
                  <li
                    key={index}
                    className={`cursor-pointer flex justify-between items-center select-none relative py-2 px-3 hover:bg-indigo-50 ${
                      isSelectedOption
                        ? "bg-indigo-100 text-[#130061]"
                        : "text-gray-900"
                    }`}
                    id={`option-${index}`}
                    role="option"
                    aria-selected={isSelectedOption}
                    onClick={(e) => {
                      if (!multiselect) {
                        handleSelect(
                          value !== undefined ? value : option,
                          option
                        );
                      } else {
                        e.stopPropagation();
                        handleSelect(
                          value !== undefined ? value : option,
                          option
                        );
                      }
                    }}
                  >
                    <div className="flex items-center w-full">
                      {multiselect && (
                        <div className="mr-3">
                          <input
                            type="checkbox"
                            checked={isSelectedOption}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      )}
                      <span
                        className={`block  ${ //removed truncate to show full option content
                          isSelectedOption ? "font-medium" : "font-normal"
                        }`}
                      >
                        {label}
                      </span>
                    </div>

                    {isSelectedOption && !multiselect && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect("");
                        }}
                        className="rounded-full cursor-pointer hover:bg-gray-200 p-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FloatingSelect;
