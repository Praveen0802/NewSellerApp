import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import SelectListItem from "../tradePage/components/selectListItem";
import AvailableList from "../tradePage/components/availableList";
import { FilterSection } from "./filterSection";
import ActiveFiltersBox from "./ActiveFilterBoxs";

// Mock icons - replace with your actual icons
const FilterIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
    />
  </svg>
);

const ColumnsIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002-2M9 7a2 2 0 012 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 002-2"
    />
  </svg>
);

const TabbedLayout = ({
  tabs,
  initialTab,
  listItemsConfig,
  filterConfig,
  onTabChange,
  onFilterChange,
  onCheckboxToggle,
  onColumnToggle,
  visibleColumns,
  className = "bg-[#ECEDF2] w-full h-full relative",
  containerClassName = "flex flex-col gap-[24px]",
  showFilters = true,
  currentFilterValues = {},
  onClearAllFilters,
  showSelectedFilterPills = false,
  hideVisibleColumns = false,
  // New prop to receive transition direction from parent (only for specific components)
  transitionDirection: parentTransitionDirection = null,
  // New prop to disable transitions entirely
  disableTransitions = false,
}) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(initialTab || tabs[0]?.key);
  const [checkboxValues, setCheckboxValues] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // New states for transition handling
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState("next");
  const [previousListItems, setPreviousListItems] = useState([]);
  const [currentListItems, setCurrentListItems] = useState([]);

  // Initialize activeFilters with all filters checked by default
  const [activeFilters, setActiveFilters] = useState(() => {
    const initialActiveFilters = new Set();

    // Get all filter names for the initial tab and add them to the set
    if (filterConfig && filterConfig[initialTab || tabs[0]?.key]) {
      filterConfig[initialTab || tabs[0]?.key].forEach((filter) => {
        initialActiveFilters.add(filter.name);
      });
    }

    return initialActiveFilters;
  });

  const filterDropdownRef = useRef(null);
  const columnDropdownRef = useRef(null);

  // Initialize checkbox values from config
  useEffect(() => {
    const initialCheckboxes = {};
    Object.keys(listItemsConfig).forEach((tabKey) => {
      listItemsConfig[tabKey].forEach((item) => {
        if (item.key) {
          initialCheckboxes[item.key] = item.isChecked || false;
        }
      });
    });
    setCheckboxValues(initialCheckboxes);
  }, [JSON.stringify(listItemsConfig)]);

  // Update activeFilters when tab changes to include all filters for the new tab
  useEffect(() => {
    if (filterConfig && filterConfig[selectedTab]) {
      const newActiveFilters = new Set();
      filterConfig[selectedTab].forEach((filter) => {
        newActiveFilters.add(filter.name);
      });
      setActiveFilters(newActiveFilters);
    }
  }, [selectedTab, filterConfig]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
      if (
        columnDropdownRef.current &&
        !columnDropdownRef.current.contains(event.target)
      ) {
        setShowColumnDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get current tab's list items
  const getCurrentListItems = () => {
    const baseItems = listItemsConfig[selectedTab] || [];
    return baseItems.map((item) => ({
      ...item,
      isChecked: item.key
        ? checkboxValues[item.key] ?? item.isChecked ?? false
        : false,
    }));
  };

  // Handle transitions for list items when they change - only if transitions are enabled
  useEffect(() => {
    const newItems = getCurrentListItems();
    const currentItemsString = JSON.stringify(
      currentListItems.map((item) => ({ name: item.name, value: item.value }))
    );
    const newItemsString = JSON.stringify(
      newItems.map((item) => ({ name: item.name, value: item.value }))
    );

    // Only trigger transition if:
    // 1. Transitions are not disabled
    // 2. The actual content has changed 
    // 3. We have existing items 
    // 4. We have transition direction from parent
    if (
      !disableTransitions &&
      currentItemsString !== newItemsString &&
      currentListItems.length > 0 &&
      parentTransitionDirection
    ) {
      setPreviousListItems([...currentListItems]); // Create a copy
      setIsTransitioning(true);
      setTransitionDirection(parentTransitionDirection);

      // Update items immediately but keep transition state
      setCurrentListItems(newItems);

      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
        setPreviousListItems([]);
      }, 300); // Match CSS transition duration
    } else {
      // If transitions are disabled or no transition direction provided, just update without animation
      setCurrentListItems(newItems);
    }
  }, [
    JSON.stringify(listItemsConfig[selectedTab]),
    checkboxValues,
    parentTransitionDirection,
    disableTransitions,
  ]);

  // Get all available filters for current tab
  const getAvailableFilters = () => {
    if (!filterConfig || !filterConfig[selectedTab]) return [];

    return filterConfig[selectedTab].map((filter) => ({
      key: filter.name,
      label: filter.label,
      type: filter.type,
      isActive: activeFilters.has(filter.name),
    }));
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab.key);
    if (tab.route) {
      router?.push(tab.route);
    }
    onTabChange?.(tab);
  };

  const handleCheckboxToggle = (itemKey, currentValue) => {
    let key, newValue;

    if (typeof itemKey === "number") {
      const currentItems = getCurrentListItems();
      const item = currentItems[itemKey];
      if (!item?.key) return;
      key = item.key;
      newValue = !checkboxValues[item.key];
    } else {
      key = itemKey;
      newValue =
        typeof currentValue === "boolean"
          ? !currentValue
          : !checkboxValues[key];
    }

    const updatedCheckboxValues = {
      ...checkboxValues,
      [key]: newValue,
    };

    setCheckboxValues(updatedCheckboxValues);
    onCheckboxToggle?.(key, newValue, updatedCheckboxValues);
  };

  const handleFilterChange = (filterKey, value, allFilters, currentTab) => {
    onFilterChange?.(filterKey, value, allFilters, currentTab);
  };

  // Handle filter toggle from dropdown
  const handleFilterToggle = (filterKey) => {
    const newActiveFilters = new Set(activeFilters);

    if (activeFilters.has(filterKey)) {
      newActiveFilters.delete(filterKey);
    } else {
      newActiveFilters.add(filterKey);
    }

    setActiveFilters(newActiveFilters);
  };

  // Handle column toggle
  const handleColumnToggle = (columnKey) => {
    onColumnToggle?.(columnKey);
  };

  // Get visible filters based on activeFilters
  const getVisibleFilters = () => {
    if (!filterConfig || !filterConfig[selectedTab]) return [];
    return filterConfig[selectedTab].filter((filter) =>
      activeFilters.has(filter.name)
    );
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    if (onClearAllFilters) {
      onClearAllFilters?.();
    } else if (onFilterChange) {
      // Fallback: clear each filter individually
      const clearedFilters = {};
      Object.keys(currentFilterValues).forEach((key) => {
        if (typeof currentFilterValues[key] === "object") {
          clearedFilters[key] = {};
        } else {
          clearedFilters[key] = "";
        }
      });

      // Call onFilterChange with cleared filters
      Object.keys(currentFilterValues).forEach((key) => {
        onFilterChange(key, clearedFilters[key], clearedFilters, selectedTab);
      });
    }
  };

  return (
    <div className={className}>
      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 flex gap-2 z-50">
        {/* Filter Control */}
        <div className="relative" ref={filterDropdownRef}>
          <button
            onClick={() => {
              setShowFilterDropdown(!showFilterDropdown);
              setShowColumnDropdown(false);
            }}
            className="p-2 bg-white border cursor-pointer border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            title="Filters"
          >
            <FilterIcon className="w-5 h-5 text-gray-600" />
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {getAvailableFilters().map((filter) => (
                  <label
                    key={filter.key}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filter.isActive}
                      onChange={() => handleFilterToggle(filter.key)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {filter.label}
                    </span>
                  </label>
                ))}
              </div>
              {getAvailableFilters().length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  No filters available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Column Control */}
        {!hideVisibleColumns && (
          <div className="relative" ref={columnDropdownRef}>
            <button
              onClick={() => {
                setShowColumnDropdown(!showColumnDropdown);
                setShowFilterDropdown(false);
              }}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
              title="Columns"
            >
              <ColumnsIcon className="w-5 h-5 text-gray-600" />
            </button>

            {showColumnDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Columns</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {visibleColumns &&
                    Object.entries(visibleColumns).map(
                      ([columnKey, isVisible]) => (
                        <label
                          key={columnKey}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => handleColumnToggle(columnKey)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">
                            {columnKey
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </span>
                        </label>
                      )
                    )}
                </div>
                {(!visibleColumns ||
                  Object.keys(visibleColumns).length === 0) && (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No columns available
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop tabs */}
      {tabs?.length > 0 && (
        <div className="hidden md:flex gap-[4px] w-[70%] px-[24px] pt-[24px]">
          {tabs?.map((tab, index) => {
            const selectedIndex = tab?.key === selectedTab;
            return (
              <SelectListItem
                key={index}
                item={tab}
                selectedIndex={selectedIndex}
                handleSelectItemClick={handleTabChange}
              />
            );
          })}
        </div>
      )}

      <div className={containerClassName}>
        <div className="bg-white">
          {/* List Items Section with Transitions */}
          <div className="px-[24px] py-[12px] border-b-[1px] border-[#E0E1EA] overflow-hidden">
            <div className="relative">
              {/* Previous Items (sliding out) - only show if transitions are enabled and transitioning */}
              {!disableTransitions && isTransitioning && previousListItems.length > 0 && (
                <div
                  className={`
                    ${
                      previousListItems?.length == 4
                        ? "grid grid-cols-4 gap-4"
                        : "flex gap-4 flex-nowrap"
                    } min-w-min md:min-w-0 absolute inset-0 transition-transform overflow-scroll duration-300 ease-in-out z-10
                    ${
                      transitionDirection === "next"
                        ? "transform -translate-x-full"
                        : "transform translate-x-full"
                    }
                  `}
                >
                  {previousListItems?.map((item, index) => (
                    <div
                      key={`previous-${item.key || index}-${Date.now()}`}
                      className="min-w-[200px]"
                    >
                      <AvailableList
                        list={{
                          name: item?.name,
                          value: item?.value,
                          showCheckbox: item?.showCheckbox,
                          isChecked: item?.isChecked,
                          onCheckChange: undefined, // Disable interactions during transition
                          onClick: undefined,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Current Items */}
              <div
                className={`
                  ${
                    currentListItems?.length == 4
                      ? "grid grid-cols-4 gap-4"
                      : "flex gap-4 flex-nowrap overflow-x-scroll"
                  } min-w-min md:min-w-0 ${!disableTransitions ? 'transition-transform duration-300 ease-in-out' : ''}
                  ${
                    !disableTransitions && isTransitioning
                      ? "transform translate-x-0"
                      : "transform translate-x-0"
                  }
                `}
                style={{
                  transform: !disableTransitions && isTransitioning
                    ? "translateX(0)"
                    : "translateX(0)",
                  animation: !disableTransitions && isTransitioning
                    ? transitionDirection === "next"
                      ? "slideInFromRight 0.3s ease-in-out"
                      : "slideInFromLeft 0.3s ease-in-out"
                    : "none",
                }}
              >
                {currentListItems?.map((item, index) => (
                  <div
                    key={`current-${item.key || index}-${Date.now()}`}
                    className="min-w-[200px]"
                  >
                    <AvailableList
                      list={{
                        name: item?.name,
                        value: item?.value,
                        showCheckbox: item?.showCheckbox,
                        isChecked: item?.isChecked,
                        onCheckChange:
                          item?.showCheckbox && item?.key && (!isTransitioning || disableTransitions)
                            ? () =>
                                handleCheckboxToggle(item.key, item.isChecked)
                            : undefined,
                        onClick:
                          item?.showCheckbox && item?.key && (!isTransitioning || disableTransitions)
                            ? () =>
                                handleCheckboxToggle(item.key, item.isChecked)
                            : undefined,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Section - Only show filters that are active */}
          {showFilters && getVisibleFilters().length > 0 && (
            <FilterSection
              filterConfig={getVisibleFilters()}
              currentTab={selectedTab}
              onFilterChange={handleFilterChange}
              containerClassName="md:flex flex-wrap gap-3 items-center  p-3"
              initialValues={currentFilterValues}
            />
          )}

          {showSelectedFilterPills && (
            <div className="px-[20px]  border-t-1 border-gray-200 ">
              <ActiveFiltersBox
                activeFilters={currentFilterValues}
                onFilterChange={onFilterChange}
                onClearAllFilters={handleClearAllFilters}
                currentTab={selectedTab}
              />
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations - only include if transitions are not disabled */}
      {!disableTransitions && (
        <style jsx>{`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideInFromLeft {
            from {
              transform: translateX(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideOutToLeft {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(-100%);
              opacity: 0;
            }
          }

          @keyframes slideOutToRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default TabbedLayout;