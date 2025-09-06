import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { debounce } from "lodash";
import CustomSelectEditableCell from "./customSimpleEditableCell";
import FloatingDateRange from "../commonComponents/dateRangeInput";

const MultiSelectEditableCell = ({
  value,
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
  disabled = false,
  placeholder = "Select options...",
  saveOnChange = true,
  alwaysShowAsEditable = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    showAbove: false,
  });
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  // Enhanced function to convert various value formats to array
  const normalizeValue = (val) => {
    if (!val) return [];
    
    // If it's already an array, handle each item
    if (Array.isArray(val)) {
      return val.map(item => {
        if (typeof item === 'object' && item !== null) {
          // Handle object with value property
          return item.value || item.id || item.key || String(item);
        }
        return item;
      });
    }
    
    // If it's an object, extract the value
    if (typeof val === 'object' && val !== null) {
      if (val.value !== undefined) return [val.value];
      if (val.id !== undefined) return [val.id];
      if (val.key !== undefined) return [val.key];
      // If object doesn't have expected properties, convert to string
      return [String(val)];
    }
    
    // If it's a string, handle comma-separated values
    if (typeof val === "string") {
      if (val === "[object Object]") {
        console.warn("Received [object Object] as value, returning empty array");
        return [];
      }
      return val.includes(",") ? val.split(",").map((v) => v.trim()) : [val];
    }
    
    return [val];
  };

  // Function to convert normalized array back to the expected format
  const denormalizeValue = (normalizedArray) => {
    if (!normalizedArray || normalizedArray.length === 0) return [];
    
    // Check what format the original options use
    const sampleOption = options[0];
    if (sampleOption && typeof sampleOption.value === 'object') {
      // If options have object values, return objects
      return normalizedArray.map(val => {
        const matchingOption = options.find(opt => 
          (opt.value && opt.value.value === val) || 
          (opt.value && opt.value.id === val) ||
          opt.value === val
        );
        return matchingOption ? matchingOption.value : val;
      });
    }
    
    // Otherwise return simple array
    return normalizedArray;
  };

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(normalizeValue(value));
  }, [value]);

  // Calculate dropdown position with fixed smaller width
  const calculateDropdownPosition = useCallback(() => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const dropdownHeight = 300;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Set a fixed, smaller width for the dropdown
    const fixedWidth = 240;
    const maxAllowedWidth = Math.min(viewportWidth - rect.left - 20, fixedWidth);

    // Decide whether to show above or below
    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const position = {
      left: rect.left + window.scrollX,
      width: Math.max(maxAllowedWidth, 200),
      showAbove,
    };

    // Adjust left position if dropdown would go off-screen
    if (position.left + position.width > viewportWidth) {
      position.left = Math.max(10, viewportWidth - position.width - 10);
    }

    if (showAbove) {
      position.top = rect.top + window.scrollY - dropdownHeight + 30;
    } else {
      position.top = rect.bottom + window.scrollY + 4;
    }

    setDropdownPosition(position);
  }, []);

  // Update position when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      calculateDropdownPosition();

      const handleReposition = () => {
        calculateDropdownPosition();
      };

      window.addEventListener("scroll", handleReposition, true);
      window.addEventListener("resize", handleReposition);

      return () => {
        window.removeEventListener("scroll", handleReposition, true);
        window.removeEventListener("resize", handleReposition);
      };
    }
  }, [isDropdownOpen, calculateDropdownPosition]);

  const handleClick = useCallback((e) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsEditing(true);
    setIsDropdownOpen(true);
  }, [disabled]);

  const handleInputClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDropdownOpen(prev => !prev);
    
    if (!isEditing) {
      setIsEditing(true);
    }
  }, [disabled, isEditing]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        const dropdown = document.querySelector("[data-multiselect-dropdown]");
        if (dropdown && dropdown.contains(event.target)) {
          return;
        }
        setIsDropdownOpen(false);
        if (isDropdownOpen) {
          setIsEditing(false);
        }
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
        setIsEditing(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleSave = () => {
    const normalizedCurrent = normalizeValue(value);
    const normalizedEdit = normalizeValue(editValue);

    if (JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedEdit)) {
      // Convert back to expected format before saving
      const valueToSave = denormalizeValue(normalizedEdit);
      onSave(valueToSave);
    }
    setIsEditing(false);
    setIsDropdownOpen(false);
  };

  const handleCancel = () => {
    setEditValue(normalizeValue(value));
    setIsEditing(false);
    setIsDropdownOpen(false);
  };

  const debouncedOnSave = useCallback(
    debounce(
      (newValue) => {
        const valueToSave = denormalizeValue(newValue);
        onSave(valueToSave);
      },
      saveOnChange ? 100 : 500
    ),
    [onSave, saveOnChange, options] // Added options to dependency array
  );

  const handleOptionToggle = (optionValue) => {
    const currentValues = normalizeValue(editValue);
    let newValues;

    if (currentValues.includes(optionValue)) {
      newValues = currentValues.filter((val) => val !== optionValue);
    } else {
      newValues = [...currentValues, optionValue];
    }

    setEditValue(newValues);

    if (saveOnChange) {
      const valueToSave = denormalizeValue(newValues);
      onSave(valueToSave);
    } else {
      debouncedOnSave(newValues);
    }
  };

  // Check if all options are selected
  const areAllSelected = () => {
    const currentValues = normalizeValue(editValue);
    return options.length > 0 && currentValues.length === options.length;
  };

  // Handle select all checkbox toggle
  const handleSelectAllToggle = () => {
    const allSelected = areAllSelected();
    let newValues;

    if (allSelected) {
      newValues = [];
    } else {
      newValues = options.map((opt) => opt.value);
    }

    setEditValue(newValues);

    if (saveOnChange) {
      const valueToSave = denormalizeValue(newValues);
      onSave(valueToSave);
    }
  };

  const getDisplayValue = () => {
    const normalizedValue = normalizeValue(value);
    if (normalizedValue.length === 0) return placeholder;

    return `${normalizedValue.length} item${
      normalizedValue.length !== 1 ? "s" : ""
    } selected`;
  };

  const getSelectedCount = () => {
    const normalizedValue = normalizeValue(editValue);
    return normalizedValue.length;
  };

  // Get option value for comparison - handles both simple values and objects
  const getOptionValue = (option) => {
    if (typeof option.value === 'object' && option.value !== null) {
      return option.value.value || option.value.id || option.value.key || String(option.value);
    }
    return option.value;
  };

  // Editing mode with dropdown
  if (isEditing && !disabled) {
    return (
      <div className="relative w-full" ref={containerRef}>
        <div
          ref={dropdownRef}
          className={`border rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] transition-colors ${
            isFocused || isDropdownOpen
              ? "border-green-500 ring-2 ring-green-600"
              : "border-[#DADBE5] hover:border-green-600"
          }`}
          onClick={handleInputClick}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          tabIndex={0}
        >
          <div className="flex justify-between items-center">
            <span className="truncate text-[#323A70]">
              {getSelectedCount() > 0
                ? `${getSelectedCount()} selected`
                : placeholder}
            </span>
            <ChevronDown
              size={12}
              className={`transform transition-transform text-[#323A70] flex-shrink-0 ml-2 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isDropdownOpen && (
          <div
            data-multiselect-dropdown
            className={`fixed bg-white border border-[#DADBE5] rounded shadow-lg max-h-64 overflow-y-auto ${
              dropdownPosition.showAbove ? "shadow-lg" : "shadow-lg"
            }`}
            style={{
              zIndex: 9999,
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            onScroll={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Select All Header */}
            <div className="border-b border-[#DADBE5] p-3 sticky top-0 bg-white">
              <div
                className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAllToggle();
                }}
              >
                <input
                  type="checkbox"
                  checked={areAllSelected()}
                  onChange={() => {}}
                  className="w-3 h-3 text-blue-600 border-[#DADBE5] mt-0.5 flex-shrink-0"
                />
                <span className="text-xs font-medium text-[#323A70]">
                  Select All ({options.length} items)
                </span>
              </div>
            </div>

            {/* Options List */}
            {options.map((option) => {
              const optionValue = getOptionValue(option);
              const isSelected = normalizeValue(editValue).includes(optionValue);
              
              return (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-200 flex items-start space-x-2 transition-colors ${
                    isSelected ? "bg-blue-100" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionToggle(optionValue);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-3 h-3 text-blue-600 border-[#DADBE5] mt-0.5 flex-shrink-0"
                  />
                  <span className="text-xs text-[#323A70] leading-tight break-words whitespace-normal">
                    {option.label}
                  </span>
                </div>
              );
            })}

            {!saveOnChange && (
              <div className="border-t border-[#DADBE5] p-2 flex justify-end space-x-2 sticky bottom-0 bg-white">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Hover/clickable mode
  if ((alwaysShowAsEditable || isRowHovered) && !disabled) {
    return (
      <div className={`cursor-pointer ${className}`} onClick={handleClick}>
        <div className="border border-[#DADBE5] rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer hover:border-green-600 hover:ring-2 hover:ring-green-600 transition-colors">
          <div className="flex justify-between items-center">
            <span
              className={`truncate ${
                normalizeValue(value).length > 0
                  ? "text-[#323A70]"
                  : "text-gray-400"
              }`}
            >
              {getDisplayValue()}
            </span>
            <ChevronDown
              size={12}
              className="text-[#323A70] flex-shrink-0 ml-2"
            />
          </div>
        </div>
      </div>
    );
  }

  // Default display mode
  return (
    <div
      className={`${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
      onClick={handleClick}
    >
      <span
        className={`text-xs truncate ${
          disabled
            ? "text-gray-400"
            : normalizeValue(value).length > 0
            ? "text-[#323A70]"
            : "text-gray-400"
        }`}
      >
        {getDisplayValue()}
      </span>
    </div>
  );
};

const SimpleEditableCell = ({
  value,
  type = "text",
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
  disabled = false,
  placeholder = "Enter...",
  saveOnChange = true,
  iconBefore = null,
  rowValue = {},
  alwaysShowAsEditable = false,
  // Date range specific props
  dateRangeProps = {},
}) => {
  // All hooks must be defined at the top level
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  useEffect(() => {
    setEditValue(value);
  }, [value, type]);

  const handleClick = useCallback((e) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsEditing(true);
    setShouldFocusInput(true);
  }, [disabled]);

  const handleDateInputClick = useCallback((e) => {
    e.stopPropagation();
    
    if (disabled) return;
    
    if (!isEditing) {
      setIsEditing(true);
      setShouldFocusInput(true);
    }
    
    if (inputRef.current && type === "date") {
      setTimeout(() => {
        if (inputRef.current?.showPicker) {
          inputRef.current.showPicker();
        }
      }, 0);
    }
  }, [disabled, isEditing, type]);

  useEffect(() => {
    if (isEditing && shouldFocusInput && inputRef.current) {
      setShouldFocusInput(false);
      
      if (type === "date") {
        inputRef.current.focus();
        setTimeout(() => {
          if (inputRef.current?.showPicker) {
            inputRef.current.showPicker();
          }
        }, 0);
      } else {
        inputRef.current.focus();
        if (inputRef.current.select) {
          inputRef.current.select();
        }
      }
    }
  }, [isEditing, type, shouldFocusInput]);

  // Helper functions that need to be defined early
  const getInputPadding = () => {
    return iconBefore ? "pl-10 pr-2" : "px-2";
  };

  const renderIconBefore = () => {
    if (!iconBefore) return null;

    return (
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
        {typeof iconBefore === "function" ? iconBefore(rowValue) : iconBefore}
      </div>
    );
  };

  const handleSave = () => {
    let valueToSave = editValue;
    
    if (type === "date") {
      valueToSave = formatDateForSave(editValue);
    }
    
    if (valueToSave !== value) {
      onSave(valueToSave);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleChange = (newValue) => {
    setEditValue(newValue);

    if (saveOnChange && newValue !== value) {
      let valueToSave = newValue;
      
      if (type === "date") {
        valueToSave = formatDateForSave(newValue);
      }
      
      onSave(valueToSave);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (!saveOnChange) {
      handleSave();
    } else {
      setIsEditing(false);
    }
  };

  const getDisplayValue = () => {
    if (type === "checkbox") {
      return value ? "Yes" : "No";
    }
    if (type === "date") {
      return value ? formatDateForDisplay(value) : placeholder;
    }
    return value || placeholder;
  };

  const hasValue = () => {
    if (type === "checkbox") return true;
    if (type === "date") {
      return !!(value && value.toString().trim());
    }
    return !!(value && value.toString().trim());
  };

  // Helper functions for date formatting (keep existing ones for backward compatibility)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    
    try {
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return "";
    }
  };

  const formatDateForSave = (dateString) => {
    if (!dateString) return "";
    
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      return dateString;
    } catch (error) {
      console.error('Error formatting date for save:', error);
      return dateString;
    }
  };

  // For multiselect type, use the MultiSelectEditableCell
  if (type === "multiselect") {
    return (
      <MultiSelectEditableCell
        value={value}
        options={options}
        onSave={onSave}
        className={className}
        isRowHovered={isRowHovered}
        disabled={disabled}
        placeholder={placeholder}
        saveOnChange={saveOnChange}
        alwaysShowAsEditable={alwaysShowAsEditable}
      />
    );
  }

  // For select type, use the custom select component
  if (type === "select") {
    return (
      <CustomSelectEditableCell
        value={value}
        options={options}
        onSave={onSave}
        className={className}
        isRowHovered={isRowHovered}
        disabled={disabled}
        placeholder={placeholder}
        saveOnChange={saveOnChange}
        iconBefore={iconBefore}
        rowValue={rowValue}
        alwaysShowAsEditable={alwaysShowAsEditable}
      />
    );
  }

  // For date-range type, use the FloatingDateRange component
  if (type === "date") {
    // Convert string value to dateRange format if needed
    const convertToDateRangeFormat = (val) => {
      if (!val) return { startDate: "", endDate: "" };
      
      // If it's already in the right format
      if (typeof val === 'object' && val.startDate !== undefined) {
        return val;
      }
      
      // If it's a string, use it as startDate (for single date mode)
      if (typeof val === 'string') {
        return { startDate: val, endDate: val };
      }
      
      return { startDate: "", endDate: "" };
    };

    // Convert dateRange format back to string if needed
    const convertFromDateRangeFormat = (dateRangeValue) => {
      if (!dateRangeValue) return "";
      
      // Return just the startDate if both dates are the same (single date mode)
      if (dateRangeValue.startDate === dateRangeValue.endDate) {
        return dateRangeValue.startDate;
      }
      
      // Return the entire object if different dates
      return dateRangeValue;
    };

    const handleDateRangeChange = (newDateRange) => {
      const valueToSave = convertFromDateRangeFormat(newDateRange);
      onSave(valueToSave);
    };

    const getDateRangeDisplayValue = () => {
      const dateRangeValue = convertToDateRangeFormat(value);
      
      if (!dateRangeValue.startDate) return placeholder;
      
      if (dateRangeValue.startDate === dateRangeValue.endDate || !dateRangeValue.endDate) {
        return formatDateForDisplay(dateRangeValue.startDate);
      }
      
      return `${formatDateForDisplay(dateRangeValue.startDate)} - ${formatDateForDisplay(dateRangeValue.endDate)}`;
    };

    const hasDateRangeValue = () => {
      const dateRangeValue = convertToDateRangeFormat(value);
      return !!(dateRangeValue.startDate && dateRangeValue.startDate.toString().trim());
    };

    // Editing mode for date-range
    // if (isEditing || (alwaysShowAsEditable || isRowHovered) && !disabled) {
      return (
        <div className="w-full">
          <FloatingDateRange
            label={'select Date'}
            value={convertToDateRangeFormat(isEditing ? editValue : value)}
            onChange={handleDateRangeChange}
            singleDateMode={true}
            // hideLabel={true}
            hideFloatingLabel={true}
            saveOnChange={saveOnChange}
            readOnly={false}
            autoOpen={isEditing && shouldFocusInput} // Auto-open when entering edit mode
            {...dateRangeProps}
          />
        </div>
      );
    // }

    // Hover/clickable mode for date-range
    if ((alwaysShowAsEditable || isRowHovered) && !disabled) {
      return (
        <div className={`cursor-pointer ${className}`} onClick={() => setIsEditing(true)}>
          <div className="relative">
            {iconBefore && (
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                {typeof iconBefore === "function" ? iconBefore(rowValue) : iconBefore}
              </div>
            )}
            <input
              type="text"
              value={getDateRangeDisplayValue()}
              placeholder={placeholder}
              className={`border border-[#DADBE5] rounded ${iconBefore ? "pl-10 pr-2" : "px-2"} py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] hover:border-green-600 transition-colors placeholder:text-gray-400`}
              readOnly
            />
          </div>
        </div>
      );
    }

    // Default display mode for date-range
    return (
      <div
        className={`${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${className} relative`}
        onClick={() => !disabled && setIsEditing(true)}
      >
        {iconBefore && (
          <div className="inline-flex items-center">
            <span className="mr-1">
              {typeof iconBefore === "function" ? iconBefore() : iconBefore}
            </span>
            <span
              className={`text-xs ${
                disabled
                  ? "text-gray-400"
                  : hasDateRangeValue()
                  ? "text-[#323A70]"
                  : "text-gray-400"
              }`}
            >
              {getDateRangeDisplayValue()}
            </span>
          </div>
        )}
        {!iconBefore && (
          <span
            className={`text-xs ${
              disabled
                ? "text-gray-400"
                : hasDateRangeValue()
                ? "text-[#323A70]"
                : "text-gray-400"
            }`}
          >
            {getDateRangeDisplayValue()}
          </span>
        )}
      </div>
    );
  }

  // For all other types, continue with existing logic
  // (no additional hooks after this point)

  

  // Editing mode (for non-select types)
  if (isEditing && !disabled) {
    return (
      <div className="w-full relative">
        {iconBefore && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
            {typeof iconBefore === "function" ? iconBefore(rowValue) : iconBefore}
          </div>
        )}
        {type === "checkbox" ? (
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="checkbox"
              checked={editValue}
              onChange={(e) => handleChange(e.target.checked)}
              onKeyDown={handleKeyPress}
              onBlur={handleBlur}
              onFocus={() => setIsFocused(true)}
              className={`w-4 h-4 text-gray-600 bg-gray-100 rounded transition-colors ${
                isFocused
                  ? "border-green-500 ring-2 ring-green-500"
                  : "border-[#DADBE5] hover:border-green-400"
              }`}
            />
          </div>
        ) : type === "date" ? (
          <input
            ref={inputRef}
            type="date"
            value={formatDateForInput(editValue) || ""}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            onClick={handleDateInputClick}
            className={`border rounded ${iconBefore ? "pl-10 pr-2" : "px-2"} py-1 text-xs focus:outline-none w-full bg-white text-[#323A70] transition-colors ${
              isFocused
                ? "border-green-500 ring-2 ring-green-500"
                : "border-[#DADBE5] hover:border-green-400"
            }`}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={editValue || ""}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            className={`border rounded ${iconBefore ? "pl-10 pr-2" : "px-2"} py-1 text-xs focus:outline-none w-full bg-white text-[#323A70] transition-colors placeholder:text-gray-400 ${
              isFocused
                ? "border-green-500 ring-2 ring-green-500"
                : "border-[#DADBE5] hover:border-green-400"
            }`}
          />
        )}
      </div>
    );
  }

  // Hover/clickable mode
  if ((alwaysShowAsEditable || isRowHovered) && !disabled) {
    return (
      <div className={`cursor-pointer ${className}`} onClick={handleClick}>
        <div className="relative">
          {iconBefore && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
              {typeof iconBefore === "function" ? iconBefore(rowValue) : iconBefore}
            </div>
          )}
          {type === "checkbox" ? (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editValue}
                className="w-4 h-4 text-gray-600 bg-gray-100 border-[#DADBE5] rounded cursor-pointer hover:border-green-600 transition-colors"
                readOnly
              />
            </div>
          ) : (
            <input
              type={type === "date" ? "text" : type}
              value={type === "date" ? formatDateForDisplay(editValue) : (editValue || "")}
              placeholder={placeholder}
              className={`border border-[#DADBE5] rounded ${iconBefore ? "pl-10 pr-2" : "px-2"} py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] hover:border-green-600 transition-colors placeholder:text-gray-400`}
              readOnly
            />
          )}
        </div>
      </div>
    );
  }

  // Default display mode
  return (
    <div
      className={`${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className} relative`}
      onClick={handleClick}
    >
      {iconBefore && (
        <div className="inline-flex items-center">
          <span className="mr-1">
            {typeof iconBefore === "function" ? iconBefore() : iconBefore}
          </span>
          <span
            className={`text-xs ${
              disabled
                ? "text-gray-400"
                : hasValue()
                ? "text-[#323A70]"
                : "text-gray-400"
            }`}
          >
            {getDisplayValue()}
          </span>
        </div>
      )}
      {!iconBefore && (
        <span
          className={`text-xs ${
            disabled
              ? "text-gray-400"
              : hasValue()
              ? "text-[#323A70]"
              : "text-gray-400"
          }`}
        >
          {getDisplayValue()}
        </span>
      )}
    </div>
  );
};

export { MultiSelectEditableCell, SimpleEditableCell };