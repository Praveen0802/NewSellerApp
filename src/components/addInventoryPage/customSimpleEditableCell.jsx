import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    showAbove: false,
  });
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Filter options based on search term
  const filterOptions = useCallback((searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [options]);

  // Update filtered options when options change
  useEffect(() => {
    filterOptions(searchTerm);
  }, [options, searchTerm, filterOptions]);

  // Calculate dropdown position with fixed smaller width
  const calculateDropdownPosition = useCallback(() => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const dropdownHeight = Math.min(filteredOptions.length * 40 + 80, 280); // Added space for search
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Set a fixed, smaller width for the dropdown
    const fixedWidth = 240; // Increased for search
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
      position.top = rect.top + window.scrollY - dropdownHeight;
    } else {
      position.top = rect.bottom + window.scrollY + 4;
    }

    setDropdownPosition(position);
  }, [filteredOptions]);

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isDropdownOpen]);

  // Immediate click handler
  const handleClick = useCallback((e) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Always enter edit mode immediately on first click
    setIsEditing(true);
    setIsDropdownOpen(true);
    setSearchTerm("");
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

    if (!isDropdownOpen) {
      setSearchTerm("");
    }
  }, [disabled, isEditing, isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        const dropdown = document.querySelector("[data-custom-select-dropdown]");
        if (dropdown && dropdown.contains(event.target)) {
          return;
        }
        setIsDropdownOpen(false);
        setSearchTerm("");
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
        setSearchTerm("");
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
    // Use loose equality to handle type differences
    if (editValue != value) {
      onSave(editValue);
    }
    setIsEditing(false);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleOptionSelect = (optionValue) => {
    setEditValue(optionValue);

    if (saveOnChange) {
      onSave(optionValue);
      setIsEditing(false);
      setIsDropdownOpen(false);
      setSearchTerm("");
    } else {
      // For non-saveOnChange mode, keep dropdown open until manual save
      setIsDropdownOpen(false);
      setSearchTerm("");
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterOptions(term);
  };

  const clearSearch = () => {
    setSearchTerm("");
    filterOptions("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const getDisplayValue = () => {
    if (options.length > 0) {
      // Use loose equality to handle type differences
      const option = options.find((opt) => opt.value == value);
      return option ? option.label : !value ? placeholder : value;
    }
    return value || placeholder;
  };

  const getEditDisplayValue = () => {
    if (options.length > 0) {
      // Use loose equality to handle type differences
      const option = options.find((opt) => opt.value == editValue);
      return option ? option.label : !editValue ? placeholder : editValue;
    }
    return editValue || placeholder;
  };

  const hasValue = () => {
    // Use loose equality to handle type differences
    const option = options.find((opt) => opt.value == value);
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
            className="fixed bg-white border border-[#DADBE5] rounded shadow-lg max-h-64 overflow-hidden z-[9999]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
          >
            {/* Search Input */}
            <div className="p-3 border-b border-[#DADBE5] sticky top-0 bg-white">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search options..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs border border-[#DADBE5] rounded focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  // Use loose equality to handle type differences (number vs string)
                  const isSelected = editValue == option.value;
                  return (
                    <div
                      key={option.value}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-200 transition-colors ${
                        isSelected ? "bg-gray-100 text-gray-700" : "text-[#323A70]"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionSelect(option.value);
                      }}
                    >
                      <span className="text-xs leading-tight break-words whitespace-normal">
                        {option.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-xs text-gray-500">
                  No options found for "{searchTerm}"
                </div>
              )}
            </div>

            {/* Save/Cancel buttons for non-saveOnChange mode */}
            {!saveOnChange && (
              <div className="border-t border-[#DADBE5] p-2 flex justify-end space-x-2 bg-gray-50 sticky bottom-0">
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