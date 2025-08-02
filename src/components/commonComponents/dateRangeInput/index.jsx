import React, { useState, useEffect, useRef } from "react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import FloatingPlaceholder from "@/components/floatinginputFields/floatingplaceolder";

const FloatingDateRange = ({
  label,
  value = { startDate: "", endDate: "" },
  onChange,
  id,
  keyValue,
  hideCalendarIcon = false,
  name,
  required = false,
  mandatory = false,
  parentClassName = "",
  readOnly,
  className = "",
  labelClassName = "",
  error = "",
  singleDateMode = false,
  hideLabel = false,
  subParentClassName = "",
  minDate = null,
  maxDate = null,
  openUpward = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(value.startDate || "");
  const [endDate, setEndDate] = useState(value.endDate || "");
  const [displayValue, setDisplayValue] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: true, left: 0 });
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Helper function to parse a date string in local timezone
  const parseLocalDate = (dateString) => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Convert string dates to Date objects for comparison
  const minDateObj = minDate ? parseLocalDate(minDate) : null;
  const maxDateObj = maxDate ? parseLocalDate(maxDate) : null;

  // Function to calculate optimal dropdown position
  const calculateDropdownPosition = () => {
    if (!inputRef.current) return { top: true, left: 0 };

    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Estimated dropdown height (adjust based on your actual dropdown size)
    const dropdownHeight = 350;
    const dropdownWidth = inputRect.width;
    
    // Check if there's enough space below
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    
    // Determine vertical position
    const shouldOpenUpward = openUpward || spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
    
    // Determine horizontal position
    let leftOffset = 0;
    const spaceRight = viewportWidth - inputRect.left;
    
    if (spaceRight < dropdownWidth) {
      // If not enough space on the right, align to the right edge
      leftOffset = Math.min(0, spaceRight - dropdownWidth);
    }

    return {
      top: !shouldOpenUpward,
      left: leftOffset
    };
  };

  // Update dropdown position when opening
  const updateDropdownPosition = () => {
    const position = calculateDropdownPosition();
    setDropdownPosition(position);
  };

  // Format and set display value when value prop changes
  useEffect(() => {
    if (singleDateMode) {
      if (value?.startDate) {
        const formattedDate = formatDate(value.startDate);
        setDisplayValue(formattedDate);
        setStartDate(value.startDate);
        setCurrentMonth(parseLocalDate(value.startDate));
      } else {
        setDisplayValue("");
        setStartDate("");
      }
    } else {
      if (value?.startDate && value?.endDate) {
        const formattedStart = formatDate(value.startDate);
        const formattedEnd = formatDate(value.endDate);
        setDisplayValue(`${formattedStart} - ${formattedEnd}`);
        setStartDate(value.startDate);
        setEndDate(value.endDate);
        setCurrentMonth(parseLocalDate(value.startDate));
      } else {
        setDisplayValue("");
        setStartDate("");
        setEndDate("");
      }
    }
  }, [value, singleDateMode]);

  // Update focus state when display value changes
  useEffect(() => {
    setIsFocused(displayValue ? true : false);
  }, [displayValue]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  // Convert a Date object to YYYY-MM-DD string without timezone shift
  const toLocalDateString = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month).padStart(2, "0");
    const formattedYear = String(year);
    return `${formattedDay}/${formattedMonth}/${formattedYear}`;
  };

  // Check if a date is within the allowed range
  const isDateInRange = (date) => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    if (minDateObj) {
      const minDateCheck = new Date(minDateObj);
      minDateCheck.setHours(0, 0, 0, 0);
      if (dateToCheck < minDateCheck) return false;
    }

    if (maxDateObj) {
      const maxDateCheck = new Date(maxDateObj);
      maxDateCheck.setHours(0, 0, 0, 0);
      if (dateToCheck > maxDateCheck) return false;
    }

    return true;
  };

  const handleInputClick = () => {
    if (!readOnly) {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(!isOpen);
      setIsFocused(true);
      setTempStartDate(startDate ? parseLocalDate(startDate) : null);
      setTempEndDate(endDate ? parseLocalDate(endDate) : null);
    }
  };

  const handleApply = () => {
    if (singleDateMode) {
      if (tempStartDate && isDateInRange(tempStartDate)) {
        const formattedDate = toLocalDateString(tempStartDate);
        setStartDate(formattedDate);
        setDisplayValue(formatDate(formattedDate));

        if (onChange) {
          onChange(
            { startDate: formattedDate, endDate: formattedDate },
            keyValue
          );
        }
      }
    } else {
      if (
        tempStartDate &&
        tempEndDate &&
        isDateInRange(tempStartDate) &&
        isDateInRange(tempEndDate)
      ) {
        const formattedStart = toLocalDateString(tempStartDate);
        const formattedEnd = toLocalDateString(tempEndDate);
        setStartDate(formattedStart);
        setEndDate(formattedEnd);
        setDisplayValue(
          `${formatDate(formattedStart)} - ${formatDate(formattedEnd)}`
        );

        if (onChange) {
          onChange(
            { startDate: formattedStart, endDate: formattedEnd },
            keyValue
          );
        }
      }
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setTempStartDate(null);
    setTempEndDate(null);
    setDisplayValue("");
    if (onChange) {
      onChange({ startDate: "", endDate: "" }, keyValue);
    }
    setIsOpen(false);
  };

  const handleDateClick = (date) => {
    if (!isDateInRange(date)) {
      return;
    }

    if (singleDateMode) {
      setTempStartDate(date);
      setTempEndDate(date);

      const formattedDate = toLocalDateString(date);
      setStartDate(formattedDate);
      setEndDate(formattedDate);
      setDisplayValue(formatDate(formattedDate));

      if (onChange) {
        onChange(
          { startDate: formattedDate, endDate: formattedDate },
          keyValue
        );
      }

      setIsOpen(false);
    } else {
      if (!tempStartDate || (tempStartDate && tempEndDate)) {
        setTempStartDate(date);
        setTempEndDate(null);
      } else if (date < tempStartDate) {
        setTempStartDate(date);
        setTempEndDate(null);
      } else {
        setTempEndDate(date);
      }
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

    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const prevMonthDays = new Date(year, month, 0).getDate();
    const nextMonthDays = 42 - (daysInMonth + startingDay);

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
        isDisabled: true,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isDisabled = !isDateInRange(date);

      let isSelected;

      if (singleDateMode) {
        isSelected =
          tempStartDate &&
          date.getDate() === tempStartDate.getDate() &&
          date.getMonth() === tempStartDate.getMonth() &&
          date.getFullYear() === tempStartDate.getFullYear();
      } else {
        isSelected =
          tempStartDate && tempEndDate
            ? date >= tempStartDate && date <= tempEndDate
            : tempStartDate
            ? date.getDate() === tempStartDate.getDate() &&
              date.getMonth() === tempStartDate.getMonth() &&
              date.getFullYear() === tempStartDate.getFullYear()
            : false;
      }

      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isSelected: isSelected,
        isInRange:
          !singleDateMode &&
          tempStartDate &&
          tempEndDate &&
          date > tempStartDate &&
          date < tempEndDate,
        isDisabled: isDisabled,
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
        isDisabled: true,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className={`w-full`}>
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
            const isDisabled = dayObj.isDisabled;

            const dayDate = new Date(dayObj.date);
            dayDate.setHours(0, 0, 0, 0);
            const isToday =
              dayDate.getDate() === today.getDate() &&
              dayDate.getMonth() === today.getMonth() &&
              dayDate.getFullYear() === today.getFullYear();

            return (
              <button
                key={index}
                onClick={() => !isDisabled && handleDateClick(dayObj.date)}
                className={`h-6 rounded text-[10px]
                  ${dayObj.isCurrentMonth ? "text-gray-800" : "text-gray-400"}
                  ${isSelected && !isDisabled ? "bg-green-500 text-white" : ""}
                  ${isInRange && !isDisabled ? "bg-blue-100" : ""}
                  ${isToday && !isDisabled ? "border border-green-400" : ""}
                  ${
                    isDisabled
                      ? "text-gray-300 cursor-not-allowed bg-gray-50"
                      : "cursor-pointer hover:bg-green-200"
                  }
                `}
                disabled={isDisabled}
              >
                {dayObj.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const baseClasses = `block w-full px-2 py-2 text-xs  rounded border-[1px] focus:outline-none ${
    error ? "border-red-500" : "border-[#DADBE5]"
  } text-[#231F20] caret-[#022B50] ${
    error
      ? "border-red-500"
      : isFocused
      ? "border-[#DADBE5] focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
      : "border-[#DADBE5]"
  }`;

  return (
    <div className={`${parentClassName} relative w-full`} ref={dropdownRef}>
      {!hideLabel && (
        <FloatingPlaceholder
          className={`${labelClassName} ${!hideCalendarIcon && "!pl-5"} ${
            readOnly && "bg-gray-100 "
          }`}
          isFocused={isFocused}
          hasError={!!error}
        >
          <span
            style={{ fontSize: isFocused ? "10px" : "11px" }}
            className={`${labelClassName} ${readOnly && "bg-gray-100"} ${
              error ? "text-red-500" : "text-[#808082]"
            }`}
          >
            {label}
            {mandatory ? "*" : ""}
          </span>
        </FloatingPlaceholder>
      )}

      <div className={`${subParentClassName} relative`} ref={inputRef}>
        {!hideCalendarIcon && (
          <div
            className="absolute left-2 z-10 bg-white top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={handleInputClick}
          >
            <IconStore.calendar className="size-4" />
          </div>
        )}

        <input
          id={id}
          type="text"
          name={name}
          value={displayValue}
          readOnly
          onClick={handleInputClick}
          className={`${!hideCalendarIcon && "!pl-8"} ${baseClasses} ${
            readOnly && "bg-gray-100"
          }  cursor-pointer ${className}`}
          placeholder=""
          required={required}
        />
      </div>

      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}

      {isOpen && (
        <div
          className={`fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-2 min-w-[280px]`}
          style={{
            top: dropdownPosition.top 
              ? `${inputRef.current?.getBoundingClientRect().bottom + window.scrollY + 4}px`
              : `${inputRef.current?.getBoundingClientRect().top + window.scrollY - 350}px`,
            left: `${inputRef.current?.getBoundingClientRect().left + window.scrollX + dropdownPosition.left}px`,
            width: `${inputRef.current?.getBoundingClientRect().width}px`,
            maxWidth: '95vw',
          }}
        >
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">
              {singleDateMode
                ? tempStartDate
                  ? `${formatDate(toLocalDateString(tempStartDate))}`
                  : "Select date"
                : tempStartDate && tempEndDate
                ? `${formatDate(
                    toLocalDateString(tempStartDate)
                  )} - ${formatDate(toLocalDateString(tempEndDate))}`
                : tempStartDate
                ? `${formatDate(
                    toLocalDateString(tempStartDate)
                  )} - Select end date`
                : "Select start date"}
            </div>

            {renderCalendar()}

            <div className="flex justify-between pt-2">
              <button
                onClick={handleClear}
                className="px-2 py-1 cursor-pointer text-xs text-gray-700 hover:bg-gray-100 rounded"
              >
                Reset
              </button>
              {!singleDateMode && (
                <div className="flex gap-1">
                  <button
                    onClick={handleApply}
                    className="px-2 py-1 text-xs cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={
                      !tempStartDate ||
                      !tempEndDate ||
                      !isDateInRange(tempStartDate) ||
                      !isDateInRange(tempEndDate)
                    }
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingDateRange;