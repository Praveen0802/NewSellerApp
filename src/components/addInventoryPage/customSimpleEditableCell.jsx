import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelectEditableCell = ({
  value,
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
  disabled = false,
  placeholder = "Select...",
  saveOnChange = true,
  iconBefore = null,
  rowValue = {},
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

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const dropdownHeight = Math.min(options.length * 36 + 8, 200); // Dynamic height based on options
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Calculate optimal width
    const maxOptionLength = Math.max(
      ...options.map((opt) => opt.label?.length || 0),
      placeholder.length
    );
    const minWidthFromContent = Math.max(maxOptionLength * 8 + 60, 150);
    const maxAllowedWidth = Math.min(viewportWidth - rect.left - 20, 300);
    const optimalWidth = Math.min(minWidthFromContent, maxAllowedWidth);

    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const position = {
      left: rect.left + window.scrollX,
      width: Math.max(optimalWidth, rect.width),
      showAbove,
    };

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

  // FIXED: Immediate click handler
  const handleClick = useCallback((e) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Always enter edit mode immediately on first click
    setIsEditing(true);
    setIsDropdownOpen(true);
  }, [disabled]);

  // Handle input field click
  const handleInputClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    // Toggle dropdown when clicking on input
    setIsDropdownOpen(prev => !prev);
    
    // Ensure we're in editing mode
    if (!isEditing) {
      setIsEditing(true);
    }
  }, [disabled, isEditing]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        const dropdown = document.querySelector("[data-custom-select-dropdown]");
        if (dropdown && dropdown.contains(event.target)) {
          return;
        }
        setIsDropdownOpen(false);
        // Exit editing mode when clicking outside
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
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
    setIsDropdownOpen(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setIsDropdownOpen(false);
  };

  const handleOptionSelect = (optionValue) => {
    setEditValue(optionValue);

    if (saveOnChange) {
      onSave(optionValue);
      setIsEditing(false);
      setIsDropdownOpen(false);
    } else {
      // For non-saveOnChange mode, keep dropdown open until manual save
      setIsDropdownOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (options.length > 0) {
      const option = options.find((opt) => opt.value == value);
      return option ? option.label : !value ? placeholder : value;
    }
    return value || placeholder;
  };

  const getEditDisplayValue = () => {
    if (options.length > 0) {
      const option = options.find((opt) => opt.value == editValue);
      return option ? option.label : !editValue ? placeholder : editValue;
    }
    return editValue || placeholder;
  };

  const hasValue = () => {
    const option = options.find((opt) => opt.value === value);
    return !!option;
  };

  const getInputPadding = () => {
    return iconBefore ? "pl-10 pr-8" : "px-2 ";
  };

  const renderIconBefore = () => {
    if (!iconBefore) return null;

    return (
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
        {typeof iconBefore === "function" ? iconBefore(rowValue) : iconBefore}
      </div>
    );
  };

  // Editing mode with custom dropdown
  if (isEditing && !disabled) {
    return (
      <div className="relative w-full" ref={containerRef}>
        <div className="relative">
          {renderIconBefore()}
          <div
            ref={dropdownRef}
            className={`border rounded ${getInputPadding()} py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] transition-colors ${
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
              <span className={`truncate text-[#323A70]`}>
                {getEditDisplayValue()}
              </span>
              <ChevronDown
                size={12}
                className={`transform transition-transform text-[#323A70] flex-shrink-0 ml-2 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {isDropdownOpen && (
          <div
            data-custom-select-dropdown
            className="fixed bg-white border border-[#DADBE5] rounded shadow-lg max-h-48 overflow-y-auto z-[9999]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            onScroll={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Placeholder option */}
            {/* <div
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                !editValue ? "bg-blue-50 text-blue-700" : "text-gray-700"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleOptionSelect("");
              }}
            >
              <span className="text-xs">{placeholder}</span>
            </div> */}

            {/* Options */}
            {options.map((option) => {
              const isSelected = editValue === option.value;
              return (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                    isSelected ? "bg-blue-50 text-blue-700" : "text-[#323A70]"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect(option.value);
                  }}
                >
                  <span className="text-xs">{option.label}</span>
                </div>
              );
            })}

            {/* Save/Cancel buttons for non-saveOnChange mode */}
            {!saveOnChange && (
              <div className="border-t border-[#DADBE5] p-2 flex justify-end space-x-2 bg-gray-50">
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

  // Hover/clickable mode - Show immediately if alwaysShowAsEditable is true
  if ((alwaysShowAsEditable || isRowHovered) && !disabled) {
    return (
      <div className={`cursor-pointer ${className}`} onClick={handleClick}>
        <div className="relative">
          {renderIconBefore()}
          <div
            className={`border border-[#DADBE5] rounded ${getInputPadding()} py-1 text-xs bg-white w-full cursor-pointer text-[#323A70]  hover:border-green-600 transition-colors flex justify-between items-center`}
          >
            <span className={`truncate text-[#323A70]`}>
              {getDisplayValue()}
            </span>
            <ChevronDown size={12} className=" flex-shrink-0 text-[#323A70]" />
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
                : "text-[#323A70]"
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
              : "text-[#323A70]"
          }`}
        >
          {getDisplayValue()}
        </span>
      )}
    </div>
  );
};

export default CustomSelectEditableCell;