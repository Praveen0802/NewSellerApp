import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { debounce } from 'lodash';

const MultiSelectEditableCell = ({
  value,
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
  disabled = false,
  placeholder = "Select options...",
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

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const dropdownHeight = 200; // Estimated max height of dropdown
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Decide whether to show above or below
    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const position = {
      left: rect.left + window.scrollX,
      width: rect.width,
      showAbove,
    };

    if (showAbove) {
      // Position above the input
      position.top = rect.top + window.scrollY - dropdownHeight;
    } else {
      // Position below the input
      position.top = rect.bottom + window.scrollY + 4;
    }

    setDropdownPosition(position);
  }, []);

  // Update position when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      calculateDropdownPosition();

      // Recalculate on scroll or resize
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
    debounce((newValue) => {
      onSave(newValue);
    }, 500), // 500ms delay
    [onSave]
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

    // Call debounced save function
    debouncedOnSave(newValues);
  };

  const handleSelectAll = () => {
    setEditValue(options.map((opt) => opt.value));
  };

  const handleDeselectAll = () => {
    setEditValue([]);
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
              className={`transform transition-transform text-[#323A70] ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isDropdownOpen && (
          <div
            data-multiselect-dropdown
            className={`fixed bg-white border border-[#DADBE5] rounded shadow-lg max-h-48 overflow-y-auto ${
              dropdownPosition.showAbove ? "shadow-lg" : "shadow-lg"
            }`}
            style={{
              zIndex: 9999,
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: Math.max(dropdownPosition.width, 200),
              minWidth: "200px",
            }}
            onScroll={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="border-b border-[#DADBE5] p-2">
              <div className="flex justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeselectAll();
                  }}
                  className="text-xs px-2 py-1 text-red-600 hover:text-red-800"
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
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center space-x-2 ${
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
                    className="w-3 h-3 text-blue-600 border-[#DADBE5]"
                  />
                  <span className="text-xs text-[#323A70]">{option.label}</span>
                </div>
              );
            })}

            <div className="border-t border-[#DADBE5] p-2 flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
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
            <ChevronDown size={12} className="text-[#323A70]" />
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

// Updated SimpleEditableCell component with placeholder support
const SimpleEditableCell = ({
  value,
  type = "text",
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
  disabled = false,
  placeholder = "Enter...",
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
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
    if (type === "checkbox") return true; // Always show Yes/No for checkbox
    if (type === "select") {
      const option = options.find((opt) => opt.value === value);
      return !!option;
    }
    return !!(value && value.toString().trim());
  };

  if (isEditing && !disabled) {
    return (
      <div className="w-full">
        {type === "select" ? (
          <select
            ref={inputRef}
            value={editValue || ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            className={`border rounded px-2 py-1 text-xs focus:outline-none bg-white w-full text-[#323A70] transition-colors ${
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
          <input
            ref={inputRef}
            type="checkbox"
            checked={editValue}
            onChange={(e) => setEditValue(e.target.checked)}
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
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={editValue || ""}
            placeholder={placeholder}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            className={`border rounded px-2 py-1 text-xs focus:outline-none w-full bg-white text-[#323A70] transition-colors placeholder:text-gray-400 ${
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
        {type === "select" ? (
          <select
            value={editValue || ""}
            className="border border-[#DADBE5] rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] hover:border-green-600 transition-colors"
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
            className="border border-[#DADBE5] rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] hover:border-green-600 transition-colors placeholder:text-gray-400"
            onClick={handleClick}
            readOnly
          />
        )}
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
  );
};

export { MultiSelectEditableCell, SimpleEditableCell };
