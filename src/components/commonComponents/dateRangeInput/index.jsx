import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  staticLabel = false,
  subParentClassName = "",
  minDate = null,
  maxDate = null,
  openUpward = false,
  showYear = false,
  showMonth = false,
  parentClassNameUpdate=''
}) => {
  console.log(showYear,'showMonth')
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(value.startDate || "");
  const [endDate, setEndDate] = useState(value.endDate || "");
  const [displayValue, setDisplayValue] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: true,
    left: 0,
  });
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const portalRef = useRef(null);

  // Helper function to parse a date string in local timezone
  const parseLocalDate = (dateString) => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Convert string dates to Date objects for comparison
  const minDateObj = minDate ? parseLocalDate(minDate) : null;
  const maxDateObj = maxDate ? parseLocalDate(maxDate) : null;

  // Generate year options based on min/max dates
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const minYear = minDateObj ? minDateObj.getFullYear() : currentYear - 100;
    const maxYear = maxDateObj ? maxDateObj.getFullYear() : currentYear + 10;

    const years = [];
    for (let year = maxYear; year >= minYear; year--) {
      years.push(year);
    }
    return years;
  };

  // Generate month options
  const generateMonthOptions = () => {
    const months = [
      { value: 0, label: "January" },
      { value: 1, label: "February" },
      { value: 2, label: "March" },
      { value: 3, label: "April" },
      { value: 4, label: "May" },
      { value: 5, label: "June" },
      { value: 6, label: "July" },
      { value: 7, label: "August" },
      { value: 8, label: "September" },
      { value: 9, label: "October" },
      { value: 10, label: "November" },
      { value: 11, label: "December" },
    ];
    return months;
  };

  // Function to calculate optimal dropdown position
  const calculateDropdownPosition = () => {
    if (!inputRef.current) return { top: true, left: 0 };

    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const dropdownHeight = 350;
    const dropdownWidth = inputRect.width;

    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    const shouldOpenUpward =
      openUpward ||
      (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);

    let leftOffset = 0;
    const spaceRight = viewportWidth - inputRect.left;

    if (spaceRight < dropdownWidth) {
      leftOffset = Math.min(0, spaceRight - dropdownWidth);
    }

    return {
      top: !shouldOpenUpward,
      left: leftOffset,
    };
  };

  // Update dropdown position when opening
  const updateDropdownPosition = () => {
    const position = calculateDropdownPosition();
    setDropdownPosition(position);
  };

  // Initialize current month based on maxDate when component mounts or maxDate changes
  useEffect(() => {
    if (maxDate && !value?.startDate) {
      // If maxDate is provided and no value is set, start calendar at maxDate
      const maxDateParsed = parseLocalDate(maxDate);
      setCurrentMonth(maxDateParsed);
    } else if (value?.startDate) {
      // If value is provided, use that for current month
      setCurrentMonth(parseLocalDate(value.startDate));
    }
  }, [maxDate, value?.startDate]);

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
      if (!isOpen) return;
      const target = event.target;
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (portalRef.current && portalRef.current.contains(target))
      ) {
        return; // click inside component or portal content
      }
      setIsOpen(false);
      setShowYearDropdown(false);
      setShowMonthDropdown(false);
      setIsInSelectionMode(false);
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

  // Enhanced date range check function
  const isDateInRange = (date) => {
    if (!date) return false;

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    if (minDateObj) {
      const minDateCheck = new Date(minDateObj);
      minDateCheck.setHours(0, 0, 0, 0);
      if (dateToCheck < minDateCheck) {
        console.log("Date is before minDate:", dateToCheck, minDateCheck);
        return false;
      }
    }

    if (maxDateObj) {
      const maxDateCheck = new Date(maxDateObj);
      maxDateCheck.setHours(0, 0, 0, 0);
      if (dateToCheck > maxDateCheck) {
        console.log("Date is after maxDate:", dateToCheck, maxDateCheck);
        return false;
      }
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
      setIsInSelectionMode(true);
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
    setIsInSelectionMode(false);
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
    setIsInSelectionMode(false);
  };

  const handleDateClick = (date) => {
    console.log("Clicked date:", date, "Is in range:", isDateInRange(date));

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
      setIsInSelectionMode(false);
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

  // Enhanced navigation with date range constraints
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);

    // Check if the new month would be outside allowed range
    if (direction > 0 && maxDateObj) {
      // Moving forward - check if new month exceeds maxDate
      const firstDayOfNewMonth = new Date(
        newMonth.getFullYear(),
        newMonth.getMonth(),
        1
      );
      const lastDayOfMaxMonth = new Date(
        maxDateObj.getFullYear(),
        maxDateObj.getMonth() + 1,
        0
      );

      if (firstDayOfNewMonth > lastDayOfMaxMonth) {
        return; // Don't navigate beyond maxDate month
      }
    }

    if (direction < 0 && minDateObj) {
      // Moving backward - check if new month is before minDate
      const lastDayOfNewMonth = new Date(
        newMonth.getFullYear(),
        newMonth.getMonth() + 1,
        0
      );
      const firstDayOfMinMonth = new Date(
        minDateObj.getFullYear(),
        minDateObj.getMonth(),
        1
      );

      if (lastDayOfNewMonth < firstDayOfMinMonth) {
        return; // Don't navigate before minDate month
      }
    }

    setCurrentMonth(newMonth);
  };

  const handleYearSelect = (year) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(year);
    setCurrentMonth(newMonth);
    setShowYearDropdown(false);
  };

  const handleMonthSelect = (month) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(month);
    setCurrentMonth(newMonth);
    setShowMonthDropdown(false);
  };

  const renderYearDropdown = () => {
    const years = generateYearOptions();
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto overflow-x-hidden mt-1">
        {years.map((year) => (
          <button
            key={year}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleYearSelect(year);
            }}
            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 whitespace-nowrap ${
              year === currentMonth.getFullYear()
                ? "bg-blue-50 text-gray-600"
                : ""
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    );
  };

  const renderMonthDropdown = () => {
    const months = generateMonthOptions();
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto overflow-x-hidden mt-1">
        {months.map((month) => (
          <button
            key={month.value}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMonthSelect(month.value);
            }}
            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 whitespace-nowrap ${
              month.value === currentMonth.getMonth()
                ? "bg-blue-50 text-gray-600"
                : ""
            }`}
          >
            {month.label}
          </button>
        ))}
      </div>
    );
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

    // Check if navigation buttons should be disabled
    const canNavigateBackward =
      !minDateObj ||
      new Date(year, month - 1, 1) >=
        new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);

    const canNavigateForward =
      !maxDateObj ||
      new Date(year, month + 1, 1) <=
        new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), 1);

    return (
      <>
        <div className={`w-full relative ${parentClassNameUpdate}`}>
          <div className="flex justify-between items-center mb-1 relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigateMonth(-1);
              }}
              disabled={!canNavigateBackward}
              className={`p-0.5 text-xs rounded flex-shrink-0 ${
                canNavigateBackward
                  ? "cursor-pointer hover:bg-gray-100"
                  : "cursor-not-allowed text-gray-300"
              }`}
            >
              &lt;
            </button>

            <div className="flex items-center gap-1 flex-1 justify-center">
              {showMonth && (
                <div className="relative flex-1 max-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMonthDropdown(!showMonthDropdown);
                      setShowYearDropdown(false);
                    }}
                    className="w-full text-xs font-medium hover:bg-gray-100 px-2 py-0.5 rounded cursor-pointer flex items-center justify-center"
                  >
                    <span className="truncate">
                      {currentMonth.toLocaleDateString("default", {
                        month: "short",
                      })}
                    </span>
                    <span className="ml-1 flex-shrink-0">▼</span>
                  </button>
                  {showMonthDropdown && renderMonthDropdown()}
                </div>
              )}

              {showYear && (
                <div className="relative flex-1 max-w-[80px]">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowYearDropdown(!showYearDropdown);
                      setShowMonthDropdown(false);
                    }}
                    className="w-full text-xs font-medium hover:bg-gray-100 px-2 py-0.5 rounded cursor-pointer flex items-center justify-center"
                  >
                    <span className="truncate">
                      {currentMonth.getFullYear()}
                    </span>
                    <span className="ml-1 flex-shrink-0">▼</span>
                  </button>
                  {showYearDropdown && renderYearDropdown()}
                </div>
              )}

              {!showMonth && !showYear && (
                <div className="text-xs font-medium text-center">
                  {currentMonth.toLocaleDateString("default", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigateMonth(1);
              }}
              disabled={!canNavigateForward}
              className={`p-0.5 text-xs rounded flex-shrink-0 ${
                canNavigateForward
                  ? "cursor-pointer hover:bg-gray-100"
                  : "cursor-not-allowed text-gray-300"
              }`}
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-[10px] text-center mb-1">
            {(["M", "T", "W", "T", "F", "S", "S"]).map((day, idx) => (
              <div key={`${day}-${idx}`} className="font-medium text-gray-500 py-0.5">
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
                  ${isInRange && !isDisabled ? "bg-gray-100" : ""}
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
      </>
    );
  };

  const shouldShowError = error && !isInSelectionMode;

  const baseClasses = `block w-full px-2 py-2 text-xs  rounded border-[1px] focus:outline-none ${
    shouldShowError ? "border-red-500" : "border-[#DADBE5]"
  } text-[#231F20] caret-[#022B50] ${
    shouldShowError
      ? "border-red-500"
      : isFocused
      ? "border-[#DADBE5] focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
      : "border-[#DADBE5]"
  }`;

  const dropdownContent = isOpen && (
    <div
      className={`absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-2 min-w-[280px]`}
      style={{
        top: dropdownPosition.top ? '100%' : 'auto',
        bottom: dropdownPosition.top ? 'auto' : '100%',
        left: `${dropdownPosition.left}px`,
        right: 'auto',
        width: `${inputRef.current?.getBoundingClientRect().width || 280}px`,
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
                className="px-2 py-1 text-xs cursor-pointer bg-[#343432] text-white rounded  disabled:bg-gray-400 disabled:cursor-not-allowed"
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
  );

  return (
    <>
      {staticLabel && (
        <div className="mb-2">
          <label className="text-[14px] font-medium text-gray-800">
            {label}
          </label>
        </div>
      )}
      <div className={`${parentClassName} relative w-full`} ref={dropdownRef}>
        {!hideLabel && (
          <FloatingPlaceholder
            className={`${labelClassName} ${!hideCalendarIcon && "!pl-5"} ${
              readOnly && "bg-gray-100 "
            }`}
            isFocused={isFocused}
            hasError={shouldShowError}
          >
            <span
              style={{ fontSize: isFocused ? "10px" : "11px" }}
              className={`${labelClassName} ${readOnly && "bg-gray-100"} ${
                shouldShowError ? "text-red-500" : "text-[#808082]"
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
              <IconStore.calendar className="size-2" />
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

        {shouldShowError && (
          <p className="mt-0.5 text-xs text-red-500">{error}</p>
        )}
        {isOpen && createPortal(
          <div
            ref={portalRef}
            className="fixed z-[20000]"
            style={{
              top: `${inputRef.current?.getBoundingClientRect().bottom + window.scrollY + (dropdownPosition.top ? 4 : -4)}px`,
              left: `${inputRef.current?.getBoundingClientRect().left + window.scrollX + dropdownPosition.left}px`,
              position: 'absolute'
            }}
          >
            {dropdownContent}
          </div>,
          document.body
        )}
      </div>
    </>
  );
};

export default FloatingDateRange;
