import React, { useState, useRef, useEffect } from "react";

const CustomSelect = ({
  options = [],
  selectedValue = null,
  onSelect,
  placeholder = "Select Your option",
  className = "",
  textSize = "text-lg", // Default text size
  buttonPadding = "px-4 py-2", // Default button padding
  dropdownItemPadding = "py-2 pl-3 pr-9", // Default dropdown item padding
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(selectedValue);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update selected value when prop changes
  useEffect(() => {
    setSelected(selectedValue);
  }, [selectedValue]);

  const handleSelect = (option) => {
    // If clicking the already selected option, clear the selection
    if (
      selected === option ||
      (option.value !== undefined && selected === option.value)
    ) {
      setSelected(null);
      if (onSelect) {
        onSelect(null);
      }
    } else {
      setSelected(option.value !== undefined ? option.value : option);
      if (onSelect) {
        onSelect(option.value !== undefined ? option.value : option);
      }
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Find the currently selected option's label
  const getSelectedLabel = () => {
    if (!selected && placeholder) return { placeholder: placeholder };

    const selectedOption = options.find(
      (option) => option.value === selected || option === selected
    );

    return selectedOption
      ? selectedOption.label || selectedOption
      : { placeholder: placeholder };
  };

  const viewingValue = getSelectedLabel();

  return (
    <div className={`relative w-fit ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex items-center justify-between ${buttonPadding} ${textSize} text-left text-gray-700 bg-white border-[1px] border-[#DADBE5] rounded-[4px] focus:outline-none`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`${
            viewingValue?.placeholder ? "text-gray-400" : "text-[#323A70]"
          } font-normal text-[12px]`}
        >
          {viewingValue?.placeholder ? viewingValue?.placeholder : viewingValue}
        </span>
        <svg
          className={`w-5 h-5 ml-2 ${
            viewingValue?.placeholder ? "text-gray-400" : "text-[#130061]"
          } transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
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
      </button>

      {isOpen && (
        <div className="absolute z-[999] w-full mt-1 bg-white rounded-md shadow-lg">
          <ul
            className={`py-1 overflow-auto ${textSize} rounded-md max-h-60 focus:outline-none`}
            role="listbox"
          >
            {options.map((option, index) => {
              const value = option.value !== undefined ? option.value : option;
              const label = option.label !== undefined ? option.label : option;
              const isSelectedOption =
                selected === value || selected === option;

              return (
                <li
                  key={index}
                  className={`cursor-pointer select-none flex justify-between items-center relative ${dropdownItemPadding} hover:bg-indigo-50 ${
                    isSelectedOption
                      ? "bg-indigo-100 text-[#130061]"
                      : "text-gray-900"
                  }`}
                  id={`option-${index}`}
                  role="option"
                  aria-selected={isSelectedOption}
                  onClick={() => handleSelect(option)}
                >
                  <span
                    className={`block truncate ${
                      isSelectedOption ? "font-medium" : "font-normal"
                    }`}
                  >
                    {label}
                  </span>

                  {isSelectedOption && (
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
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
