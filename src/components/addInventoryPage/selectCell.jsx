import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { debounce } from "lodash";

const MultiSelectEditableCell = ({
  value,
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
  disabled = false,
  placeholder = "Select options...",
  saveOnChange = true,
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

  // Convert string value to array if needed
  const normalizeValue = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      return val.includes(",") ? val.split(",").map((v) => v.trim()) : [val];
    }
    return [val];
  };

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(normalizeValue(value));
  }, [value]);

  // Calculate dropdown position with dynamic width
  const calculateDropdownPosition = useCallback(() => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const dropdownHeight = 300; // Increased height for better visibility
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Calculate optimal width based on content
    const maxOptionLength = Math.max(
      ...options.map((opt) => opt.label?.length || 0),
      placeholder.length
    );

    // Calculate minimum width needed (rough estimation: 8px per character + padding)
    const minWidthFromContent = Math.max(maxOptionLength * 8 + 60, 250);
    const maxAllowedWidth = Math.min(viewportWidth - rect.left - 20, 400);
    const optimalWidth = Math.min(minWidthFromContent, maxAllowedWidth);

    // Decide whether to show above or below
    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const position = {
      left: rect.left + window.scrollX,
      width: Math.max(optimalWidth, rect.width),
      showAbove,
    };

    // Adjust left position if dropdown would go off-screen
    if (position.left + position.width > viewportWidth) {
      position.left = Math.max(10, viewportWidth - position.width - 10);
    }

    if (showAbove) {
      position.top = rect.top + window.scrollY - dropdownHeight;
    } else {
      position.top = rect.bottom + window.scrollY + 4;
    }

    setDropdownPosition(position);
  }, [options, placeholder]);

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

  // Prevent editing if disabled
  const handleClick = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const dropdown = document.querySelector("[data-multiselect-dropdown]");
        if (dropdown && dropdown.contains(event.target)) {
          return;
        }
        setIsDropdownOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (isDropdownOpen) {
        const dropdown = document.querySelector("[data-multiselect-dropdown]");
        if (dropdown && dropdown.contains(event.target)) {
          return;
        }

        let currentElement = event.target;
        while (currentElement && currentElement !== document) {
          if (
            currentElement.hasAttribute &&
            currentElement.hasAttribute("data-multiselect-dropdown")
          ) {
            return;
          }
          currentElement = currentElement.parentElement;
        }

        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleSave = () => {
    const normalizedCurrent = normalizeValue(value);
    const normalizedEdit = normalizeValue(editValue);

    if (JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedEdit)) {
      onSave(normalizedEdit);
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
        onSave(newValue);
      },
      saveOnChange ? 100 : 500
    ),
    [onSave, saveOnChange]
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
      onSave(newValues);
    } else {
      debouncedOnSave(newValues);
    }
  };

  const handleSelectAll = () => {
    const allValues = options.map((opt) => opt.value);
    setEditValue(allValues);

    if (saveOnChange) {
      onSave(allValues);
    }
  };

  const handleDeselectAll = () => {
    setEditValue([]);

    if (saveOnChange) {
      onSave([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
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

  if (isEditing && !disabled) {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <div
          className={`border rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] transition-colors ${
            isFocused || isDropdownOpen
              ? "border-green-500 ring-2 ring-green-600"
              : "border-[#DADBE5] hover:border-green-600"
          }`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseEnter={() => !isDropdownOpen && setIsFocused(true)}
          onMouseLeave={() => !isDropdownOpen && setIsFocused(false)}
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
            <div className="border-b border-[#DADBE5] p-2 sticky top-0 bg-white">
              <div className="flex justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeselectAll();
                  }}
                  className="text-xs px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {options.map((option) => {
              const isSelected = normalizeValue(editValue).includes(
                option.value
              );
              return (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-start space-x-2 transition-colors ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionToggle(option.value);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-3 h-3 text-blue-600 border-[#DADBE5] mt-0.5 flex-shrink-0"
                  />
                  <span className="text-xs text-[#323A70] leading-tight break-words">
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

  if (isRowHovered && !disabled) {
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

// Updated SimpleEditableCell component with iconBefore support
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
  // NEW: Add iconBefore prop
  iconBefore = null,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleClick = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
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
      onSave(newValue);
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
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select && type !== "select") {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const getDisplayValue = () => {
    if (type === "select" && options.length > 0) {
      const option = options.find((opt) => opt.value == value);
      return option ? option.label : !value ? placeholder : value;
    }
    if (type === "checkbox") {
      return value ? "Yes" : "No";
    }
    return value || placeholder;
  };

  const hasValue = () => {
    if (type === "checkbox") return true;
    if (type === "select") {
      const option = options.find((opt) => opt.value === value);
      return !!option;
    }
    return !!(value && value.toString().trim());
  };

  // NEW: Helper function to get padding based on iconBefore
  const getInputPadding = () => {
    return iconBefore ? "pl-10 pr-2" : "px-2";
  };

  // NEW: Render iconBefore if present
  const renderIconBefore = () => {
    if (!iconBefore) return null;

    return (
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
        {typeof iconBefore === "function" ? iconBefore() : iconBefore}
      </div>
    );
  };

  if (isEditing && !disabled) {
    return (
      <div className="w-full relative">
        {renderIconBefore()}
        {type === "select" ? (
          <select
            ref={inputRef}
            value={editValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            className={`border rounded ${getInputPadding()} py-1 text-xs focus:outline-none bg-white w-full text-[#323A70] transition-colors ${
              isFocused
                ? "border-green-600 ring-2 ring-green-500"
                : "border-[#DADBE5] hover:border-green-500"
            }`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "checkbox" ? (
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="checkbox"
              checked={editValue}
              onChange={(e) => handleChange(e.target.checked)}
              onKeyDown={handleKeyPress}
              onBlur={handleBlur}
              onFocus={() => setIsFocused(true)}
              onMouseEnter={() => setIsFocused(true)}
              onMouseLeave={() => setIsFocused(false)}
              className={`w-4 h-4 text-blue-600 bg-gray-100 rounded transition-colors ${
                isFocused
                  ? "border-green-500 ring-2 ring-green-500"
                  : "border-[#DADBE5] hover:border-green-400"
              }`}
            />
          </div>
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
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            className={`border rounded ${getInputPadding()} py-1 text-xs focus:outline-none w-full bg-white text-[#323A70] transition-colors placeholder:text-gray-400 ${
              isFocused
                ? "border-green-500 ring-2 ring-green-500"
                : "border-[#DADBE5] hover:border-green-400"
            }`}
          />
        )}
      </div>
    );
  }

  if (isRowHovered && !disabled) {
    return (
      <div className={`cursor-pointer ${className}`} onClick={handleClick}>
        <div className="relative">
          {renderIconBefore()}
          {type === "select" ? (
            <select
              value={editValue || ""}
              className={`border border-[#DADBE5] rounded ${getInputPadding()} py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] hover:border-green-600 transition-colors`}
              onClick={handleClick}
              readOnly
            >
              <option>{getDisplayValue()}</option>
            </select>
          ) : type === "checkbox" ? (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editValue}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-[#DADBE5] rounded cursor-pointer hover:border-green-600 transition-colors"
                onClick={handleClick}
                readOnly
              />
            </div>
          ) : (
            <input
              type={type}
              value={editValue || ""}
              placeholder={placeholder}
              className={`border border-[#DADBE5] rounded ${getInputPadding()} py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] hover:border-green-600 transition-colors placeholder:text-gray-400`}
              onClick={handleClick}
              readOnly
            />
          )}
        </div>
      </div>
    );
  }

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
