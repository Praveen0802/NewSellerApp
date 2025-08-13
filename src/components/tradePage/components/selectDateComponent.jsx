import FloatingPlaceholder from "@/components/floatinginputFields/floatingplaceolder";
import React, { useState, useRef, useEffect } from "react";

const SelectDateComponent = ({
  label = "Date Range",
  selected = null,
  onChange,
  className = "",
  mandatory = false,
  paddingClassName = "px-3 py-[8px]",
  setSelected,
  error = "",
  id,
  labelClassName = "",
  dateOptions,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [isFocused, setIsFocused] = useState(selected ? true : false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showSingleDatePicker, setShowSingleDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [singleDate, setSingleDate] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Only unfocus if no value is selected
        if (!selected) {
          setIsFocused(false);
        }
        // Also hide date pickers when clicking outside
        setShowCustomDatePicker(false);
        setShowSingleDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selected]);

  // Update selected value when prop changes
  useEffect(() => {
    if (selected) {
      setSelected(selected);
      setIsFocused(true);
    }
  }, [selected]);

  const handleSelect = (option) => {
    setSelected(option.label);

    if (option.value === "custom_range") {
      // Show ONLY custom date range picker
      setShowCustomDatePicker(true);
      setShowSingleDatePicker(false);
    } else {
      // Handle other predefined options - hide all pickers
      setShowCustomDatePicker(false);
      setShowSingleDatePicker(false);
      setIsOpen(false);

      if (onChange) {
        onChange(option.value);
      }
    }

    setIsFocused(true);
  };

  const handleCustomDateChange = (dateRange) => {
    // Format the custom date range for display
    const startFormatted = dateRange.startDate
      ? new Date(dateRange.startDate)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .replace(/\//g, "/")
      : "";

    const endFormatted = dateRange.endDate
      ? new Date(dateRange.endDate)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .replace(/\//g, "/")
      : "";

    // Update the displayed value
    if (startFormatted && endFormatted) {
      setSelected(`${startFormatted} - ${endFormatted}`);

      // Use the original dateRange values to maintain consistency
      setCustomDateRange(dateRange);

      // Call parent onChange with the custom date value
      if (onChange) {
        onChange("custom_range", dateRange);
      }

      // Hide all pickers and close dropdown
      setShowCustomDatePicker(false);
      setShowSingleDatePicker(false);
      setIsOpen(false);
    }
  };
  const handleSingleDateChange = (date) => {
    // Format the single date for display
    const formatted = date
      ? new Date(date)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .replace(/\//g, "/")
      : "";

    if (formatted) {
      setSelected(formatted);
      setSingleDate(date);

      // Call parent onChange with the single date value
      if (onChange) {
        onChange("any", { date });
      }

      // Hide all pickers and close dropdown
      setShowSingleDatePicker(false);
      setShowCustomDatePicker(false);
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);

      // Hide ALL date pickers when reopening main dropdown
      if (newIsOpen) {
        setShowCustomDatePicker(false);
        setShowSingleDatePicker(false);
      }

      setIsFocused(true);
    }
  };

  // Base classes without padding (which is customizable)
  const baseClasses = `block w-full text-[14px] rounded border-[1px] focus:outline-none ${
    error ? "border-red-500" : "border-[#DADBE5]"
  } text-[#231F20] ${
    error
      ? "border-red-500"
      : isFocused
      ? "border-[#DADBE5] focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
      : "border-[#DADBE5]"
  } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-pointer"}`;

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
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
          {mandatory ? "*" : ""}
        </span>
      </FloatingPlaceholder>

      <div
        onClick={toggleDropdown}
        className={`${baseClasses} ${paddingClassName}  flex items-center justify-between relative`}
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label`}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex items-center">
          <span>{selected}</span>
        </div>

        <div>
          <svg
            className={`w-5 h-5 text-purple-800 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
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
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg">
          {/* Show options only when neither date picker is active */}
          {!showCustomDatePicker && !showSingleDatePicker && (
            <div className="grid grid-cols-2 gap-2 p-2">
              {dateOptions.map((option, index) => (
                <button
                  key={index}
                  className={`text-left px-3 py-2 text-[12px] cursor-pointer rounded hover:bg-indigo-50 ${
                    selected === option.label
                      ? "bg-indigo-100 text-purple-800"
                      : "text-gray-900"
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Only ONE of these pickers should be visible at any time */}
          {showSingleDatePicker && (
            <div className="p-2 border-t border-gray-200">
              <div className="mb-1 text-xs font-medium text-gray-700">
                Select date
              </div>

              {/* Single date calendar */}
              <div className="inline-block w-full">
                <SingleDatePicker
                  value={singleDate}
                  onChange={handleSingleDateChange}
                />
              </div>
            </div>
          )}

          {showCustomDatePicker && (
            <div className="p-2 border-t border-gray-200">
              {/* Custom date range calendar */}
              <div className="inline-block w-full">
                <CustomCalendarPicker
                  value={customDateRange}
                  onChange={handleCustomDateChange}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Single Date Picker component
const SingleDatePicker = ({ value, onChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState(
    value ? new Date(value) : null
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "/");
  };

  const handleClear = () => {
    setTempSelectedDate(null);
  };

  const handleConfirm = () => {
    if (tempSelectedDate) {
      const formattedDate = tempSelectedDate.toISOString().split("T")[0];
      if (onChange) {
        onChange(formattedDate);
      }
    }
  };

  const handleDateClick = (date) => {
    setTempSelectedDate(date);
    // Auto apply date on click (optional)
    const formattedDate = date.toISOString().split("T")[0];
    if (onChange) {
      onChange(formattedDate);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday start

    const prevMonthDays = new Date(year, month, 0).getDate();
    const nextMonthDays = 42 - (daysInMonth + startingDay); // 6 weeks display

    const days = [];

    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      const day = prevMonthDays - startingDay + i + 1;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isSelected: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isSelected = tempSelectedDate
        ? date.toDateString() === tempSelectedDate.toDateString()
        : false;

      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isSelected: isSelected,
      });
    }

    // Next month days
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: false,
        isSelected: false,
      });
    }

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-0.5 text-xs rounded cursor-pointer hover:bg-gray-100"
          >
            &lt;
          </button>
          <div className="text-xs font-medium">
            {currentMonth.toLocaleDateString("default", {
              month: "short",
              year: "numeric",
            })}
          </div>
          <button
            onClick={() => navigateMonth(1)}
            className="p-0.5 cursor-pointer text-xs rounded hover:bg-gray-100"
          >
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-[10px] text-center mb-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
            <div key={day} className="font-medium text-gray-500 py-0.5">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map((dayObj, index) => {
            const isSelected = dayObj.isSelected;
            const isToday =
              dayObj.date.toDateString() === new Date().toDateString();

            return (
              <button
                key={index}
                onClick={() => handleDateClick(dayObj.date)}
                className={`h-6 rounded cursor-pointer text-[10px]
                  ${dayObj.isCurrentMonth ? "text-gray-800" : "text-gray-400"}
                  ${isSelected ? "bg-green-300 text-white" : ""}
                  ${isToday ? "border border-green-400" : ""}
                  hover:bg-green-200
                `}
                disabled={!dayObj.isCurrentMonth}
              >
                {dayObj.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-700">
        {tempSelectedDate
          ? formatDate(tempSelectedDate.toISOString())
          : "Select a date"}
      </div>

      {renderCalendar()}

      <div className="flex justify-between pt-2">
        <button
          onClick={handleClear}
          className="px-2 py-1 cursor-pointer text-xs text-gray-700 hover:bg-gray-100 rounded"
        >
          Reset
        </button>
        <button
          onClick={handleConfirm}
          className="px-2 py-1 text-xs cursor-pointer bg-green-400 text-white rounded hover:bg-green-700"
          disabled={!tempSelectedDate}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

// Custom Date Range Picker component
const CustomCalendarPicker = ({ value, onChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState(
    value.startDate ? new Date(value.startDate) : null
  );
  const [tempEndDate, setTempEndDate] = useState(
    value.endDate ? new Date(value.endDate) : null
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "/");
  };

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      // Create new Date objects for start and end dates
      const adjustStartDate = new Date(tempStartDate);
      const adjustEndDate = new Date(tempEndDate);

      // Add timezone offset to ensure the correct date in local time
      const timezoneOffset = adjustStartDate.getTimezoneOffset() * 60000;

      // Format dates ensuring they represent the correct local date regardless of timezone
      const formattedStart = new Date(
        adjustStartDate.getTime() - timezoneOffset
      )
        .toISOString()
        .split("T")[0];
      const formattedEnd = new Date(adjustEndDate.getTime() - timezoneOffset)
        .toISOString()
        .split("T")[0];

      if (onChange) {
        onChange({ startDate: formattedStart, endDate: formattedEnd });
      }
    }
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
  };

  const handleDateClick = (date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // If no start date selected or both are selected, start new selection
      setTempStartDate(date);
      setTempEndDate(null);
    } else if (date < tempStartDate) {
      // If selected date is before start date, make it the new start date
      setTempStartDate(date);
      setTempEndDate(null);
    } else {
      // Otherwise set as end date
      setTempEndDate(date);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday start

    const prevMonthDays = new Date(year, month, 0).getDate();
    const nextMonthDays = 42 - (daysInMonth + startingDay); // 6 weeks display

    const days = [];

    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      const day = prevMonthDays - startingDay + i + 1;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isSelected: false,
        isInRange: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isSelected =
        tempStartDate && tempEndDate
          ? date >= tempStartDate && date <= tempEndDate
          : tempStartDate
          ? date.getTime() === tempStartDate.getTime()
          : false;

      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isSelected: isSelected,
        isInRange:
          tempStartDate &&
          tempEndDate &&
          date > tempStartDate &&
          date < tempEndDate,
      });
    }

    // Next month days
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: false,
        isSelected: false,
        isInRange: false,
      });
    }

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-0.5 text-xs rounded cursor-pointer hover:bg-gray-100"
          >
            &lt;
          </button>
          <div className="text-xs font-medium">
            {currentMonth.toLocaleDateString("default", {
              month: "short",
              year: "numeric",
            })}
          </div>
          <button
            onClick={() => navigateMonth(1)}
            className="p-0.5 cursor-pointer text-xs rounded hover:bg-gray-100"
          >
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-[10px] text-center mb-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
            <div key={day} className="font-medium text-gray-500 py-0.5">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map((dayObj, index) => {
            const isSelected = dayObj.isSelected;
            const isInRange = dayObj.isInRange;
            const isToday =
              dayObj.date.toDateString() === new Date().toDateString();

            return (
              <button
                key={index}
                onClick={() => handleDateClick(dayObj.date)}
                className={`h-6 rounded cursor-pointer text-[10px]
                  ${dayObj.isCurrentMonth ? "text-gray-800" : "text-gray-400"}
                  ${isSelected ? "bg-green-400 text-white" : ""}
                  ${isInRange ? "bg-gray-100" : ""}
                  ${isToday ? "border border-green-400" : ""}
                  hover:bg-green-200
                `}
                disabled={!dayObj.isCurrentMonth}
              >
                {dayObj.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* <div className="text-xs font-medium text-gray-700">
        {tempStartDate && tempEndDate
          ? `${formatDate(tempStartDate.toISOString())} - ${formatDate(
              tempEndDate.toISOString()
            )}`
          : tempStartDate
          ? `${formatDate(tempStartDate.toISOString())} - Select end date`
          : ""}
      </div> */}

      {renderCalendar()}

      <div className="flex justify-between pt-2">
        <button
          onClick={handleClear}
          className="px-2 py-1 cursor-pointer text-xs text-gray-700 hover:bg-gray-100 rounded"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="px-2 py-1 text-xs cursor-pointer bg-green-400 text-white rounded hover:bg-green-700"
          disabled={!tempStartDate || !tempEndDate}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default SelectDateComponent;
