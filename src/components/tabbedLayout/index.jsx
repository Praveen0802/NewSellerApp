// Updated TabbedLayout component with proper column name mapping
import { useRouter } from "next/router";
import { useEffect, useRef, useState, useCallback } from "react";
import AvailableList from "../tradePage/components/availableList";
import SelectListItem from "../tradePage/components/selectListItem";
import ActiveFiltersBox from "./ActiveFilterBoxs";
import { FilterSection } from "./filterSection";
import HeaderV2 from "./HeaderV2";
import DropdownList from "./DropdownList";
import useIsMobile from "@/utils/helperFunctions/useIsmobile";

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
  onCurrencyChange,
  selectedCurrency = "GBP",
  headerV2ClassName,
  tabCurrencies = {},
  className = "bg-[#ECEDF2] w-full h-full relative",
  containerClassName = "flex flex-col gap-[24px] max-sm:gap-[16px]",
  showFilters = true,
  currentFilterValues = {},
  onClearAllFilters,
  showSelectedFilterPills = false,
  loading = false,
  hideVisibleColumns = false,
  showTabFullWidth = false,
  customTableComponent = () => {},
  showCustomTable = false,
  customComponent = () => {},
  transitionDirection: parentTransitionDirection = null,
  disableTransitions = false,
  useHeaderV2 = false,
  onAddInventory = () => {},
  addInventoryText = "Add Inventory",
  isDraggableColumns = false,
  isDraggableFilters = true,
  showColumnSearch = false,
  showFilterSearch = false,
  onColumnsReorder,
  onFiltersReorder,
  excludedKeys = [],
  // NEW callback to notify parent when filter visibility toggles
  onFilterToggle, // <-- added
  // NEW PROPS FOR SCROLL HANDLING
  onScrollEnd,
  loadingMore = false,
  hasNextPage = true,
  scrollThreshold = 100, // Distance from bottom to trigger load more
  reportsPage,
  // NEW PROP FOR COLUMN HEADERS MAPPING
  columnHeadersMap = {}, // Object mapping column keys to display names
}) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(initialTab || tabs[0]?.key);
  const [checkboxValues, setCheckboxValues] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [showListItems, setShowListItems] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState("next");
  const [previousListItems, setPreviousListItems] = useState([]);
  const [currentListItems, setCurrentListItems] = useState([]);
  const [orderedColumns, setOrderedColumns] = useState([]);
  const [orderedFilters, setOrderedFilters] = useState({});

  // Ref for the scrollable container
  const scrollContainerRef = useRef(null);

  // Initialize activeFilters with all filters checked by default
  const [activeFilters, setActiveFilters] = useState(() => {
    const initialActiveFilters = new Set();
    if (filterConfig && filterConfig[initialTab || tabs[0]?.key]) {
      filterConfig[initialTab || tabs[0]?.key].forEach((filter) => {
        initialActiveFilters.add(filter.name);
      });
    }
    return initialActiveFilters;
  });

  const filterDropdownRef = useRef(null);
  const columnDropdownRef = useRef(null);

  // Throttled scroll handler to prevent excessive API calls
  const handleScroll = useCallback(
    (event) => {
      if (!onScrollEnd || loadingMore || !hasNextPage) return;

      const { scrollTop, scrollHeight, clientHeight } = event.target;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < scrollThreshold) {
        onScrollEnd();
      }
    },
    [onScrollEnd, loadingMore, hasNextPage, scrollThreshold]
  );

  // Debounced scroll handler
  const debouncedHandleScroll = useCallback(debounce(handleScroll, 150), [
    handleScroll,
  ]);

  // Helper function for debouncing
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // NEW: Handler for toggling list items visibility
  const handleToggleListItems = () => {
    setShowListItems(!showListItems);
  };

  // UPDATED: Enhanced function to get available columns with proper name mapping
  const getAvailableColumns = () => {
    if (!visibleColumns) return [];

    const baseColumns = Object.entries(visibleColumns).map(
      ([columnKey, isVisible]) => ({
        key: columnKey,
        // Use the provided mapping or generate a fallback label
        label:
          columnHeadersMap[columnKey] ||
          columnKey
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
        isVisible: isVisible,
        // Ensure DropdownList sees the right flags
        isActive: isVisible,     // added
        isChecked: isVisible,
        checked: isVisible,
      })
    );

    if (orderedColumns.length > 0) {
      const orderedItems = [];
      const usedKeys = new Set();

      orderedColumns.forEach((orderedKey) => {
        const item = baseColumns.find((col) => col.key === orderedKey);
        if (item) {
          orderedItems.push(item);
          usedKeys.add(orderedKey);
        }
      });

      baseColumns.forEach((item) => {
        if (!usedKeys.has(item.key)) {
          orderedItems.push(item);
        }
      });

      return orderedItems;
    }

    return baseColumns;
  };

  console.log(getAvailableColumns(),'getAvailableColumnsgetAvailableColumns')
  // Enhanced function to get available filters with ordering
  const getAvailableFilters = () => {
    if (!filterConfig || !filterConfig[selectedTab]) return [];

    const baseFilters = filterConfig[selectedTab].map((filter) => ({
      key: filter.name,
      label: filter.label,
      type: filter.type,
      isActive: activeFilters.has(filter.name),
    }));

    const tabOrderedFilters = orderedFilters[selectedTab];
    if (tabOrderedFilters && tabOrderedFilters.length > 0) {
      const orderedItems = [];
      const usedKeys = new Set();

      tabOrderedFilters.forEach((orderedKey) => {
        const item = baseFilters.find((filter) => filter.key === orderedKey);
        if (item) {
          orderedItems.push(item);
          usedKeys.add(orderedKey);
        }
      });

      baseFilters.forEach((item) => {
        if (!usedKeys.has(item.key)) {
          orderedItems.push(item);
        }
      });

      return orderedItems;
    }

    return baseFilters;
  };

  const getVisibleFilters = () => {
    if (!filterConfig || !filterConfig[selectedTab]) return [];

    const allFilters = filterConfig[selectedTab]?.filter((filter) =>
      activeFilters.has(filter.name)
    );

    const tabOrderedFilters = orderedFilters[selectedTab];
    if (tabOrderedFilters && tabOrderedFilters.length > 0) {
      const orderedItems = [];
      const usedKeys = new Set();

      tabOrderedFilters.forEach((orderedKey) => {
        const filter = allFilters.find((f) => f.name === orderedKey);
        if (filter) {
          orderedItems.push(filter);
          usedKeys.add(orderedKey);
        }
      });

      allFilters.forEach((filter) => {
        if (!usedKeys.has(filter.name)) {
          orderedItems.push(filter);
        }
      });

      return orderedItems;
    }

    return allFilters;
  };

  // Handle columns reordering
  const handleColumnsReorder = (reorderedItems) => {
    const newOrder = reorderedItems.map((item) => item.key);
    setOrderedColumns(newOrder);

    if (onColumnsReorder) {
      onColumnsReorder(newOrder, reorderedItems);
    }
  };

  const handleFiltersReorder = (reorderedItems) => {
    const newOrder = reorderedItems.map((item) => item.key);
    setOrderedFilters((prev) => ({
      ...prev,
      [selectedTab]: newOrder,
    }));

    if (onFiltersReorder) {
      onFiltersReorder(selectedTab, newOrder, reorderedItems);
    }
  };

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

  // Update activeFilters when tab changes
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

  // Handle transitions for list items when they change
  useEffect(() => {
    const newItems = getCurrentListItems();
    const currentItemsString = JSON.stringify(
      currentListItems.map((item) => ({ name: item.name, value: item.value }))
    );
    const newItemsString = JSON.stringify(
      newItems.map((item) => ({ name: item.name, value: item.value }))
    );

    if (
      !disableTransitions &&
      currentItemsString !== newItemsString &&
      currentListItems.length > 0 &&
      parentTransitionDirection
    ) {
      setPreviousListItems([...currentListItems]);
      setIsTransitioning(true);
      setTransitionDirection(parentTransitionDirection);
      setCurrentListItems(newItems);

      setTimeout(() => {
        setIsTransitioning(false);
        setPreviousListItems([]);
      }, 300);
    } else {
      setCurrentListItems(newItems);
    }
  }, [
    JSON.stringify(listItemsConfig[selectedTab]),
    checkboxValues,
    parentTransitionDirection,
    disableTransitions,
  ]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab.key);
    if (tab.route) {
      router?.push(tab.route);
    }
    onTabChange?.(tab);
  };

  // Updated handleCheckboxToggle in TabbedLayout component
  const handleCheckboxToggle = (itemKey, currentValue) => {
    let key, newValue, item;

    if (typeof itemKey === "number") {
      const currentItems = getCurrentListItems();
      item = currentItems[itemKey];
      if (!item?.key) return;
      key = item.key;
      newValue = !checkboxValues[item.key];
    } else {
      // Find the item by key to check if it's disabled
      const currentItems = getCurrentListItems();
      item = currentItems.find((item) => item.key === itemKey);
      key = itemKey;
      newValue =
        typeof currentValue === "boolean"
          ? !currentValue
          : !checkboxValues[key];
    }

    // Early return if the item is disabled
    if (item?.disabled) {
      console.log(`Checkbox ${key} is disabled and cannot be toggled`);
      return;
    }

    const updatedCheckboxValues = {
      ...checkboxValues,
      [key]: newValue,
    };

    setCheckboxValues(updatedCheckboxValues);
    onCheckboxToggle?.(key, newValue, updatedCheckboxValues);
  };

  const handleFilterChange = (filterKey, value, allFilters, currentTab) => {
    console.log("Filter changed:", {
      filterKey,
      value,
      allFilters,
      currentTab,
    });
    onFilterChange?.(filterKey, value, allFilters, currentTab);
  };

  const handleFilterToggle = (filterKey) => {
    const newActiveFilters = new Set(activeFilters);

    if (activeFilters.has(filterKey)) {
      newActiveFilters.delete(filterKey);
    } else {
      newActiveFilters.add(filterKey);
    }

    setActiveFilters(newActiveFilters);

    // NEW: notify parent with active + current order for this tab
    if (onFilterToggle) {
      const activeKeys = Array.from(newActiveFilters);
      const orderedKeys =
        (orderedFilters[selectedTab] && orderedFilters[selectedTab].length > 0)
          ? orderedFilters[selectedTab]
          : (filterConfig?.[selectedTab]?.map((f) => f.name) || []);
      onFilterToggle(selectedTab, activeKeys, orderedKeys);
    }
  };

  const handleColumnToggle = (columnKey) => {
    onColumnToggle?.(columnKey);
  };

  const handleClearAllFilters = () => {
    if (onClearAllFilters) {
      onClearAllFilters?.();
    } else if (onFilterChange) {
      const clearedFilters = {};
      Object.keys(currentFilterValues).forEach((key) => {
        if (typeof currentFilterValues[key] === "object") {
          clearedFilters[key] = {};
        } else {
          clearedFilters[key] = "";
        }
      });

      Object.keys(currentFilterValues).forEach((key) => {
        onFilterChange(key, clearedFilters[key], clearedFilters, selectedTab);
      });
    }
  };

  const tabbedFilterActiveFilterCongig = () => {
    return (
      <div className={containerClassName}>
        <div className="bg-white">
          <p className="px-6 max-sm:px-4 pt-4 max-sm:pt-3 text-[#323A70] text-[18px] max-sm:text-[16px] font-semibold">
            Overview
          </p>

          {/* List Items Section with Transitions */}
          <div
            className={`transition-all duration-300 ease-in-out hideScrollbar max-md:overflow-auto md:overflow-hidden border-b-[1px] border-[#E0E1EA] ${
              showListItems
                ? "max-h-[500px] opacity-100 px-6 max-sm:px-4 pb-3 pt-3 max-sm:pb-2 max-sm:pt-2"
                : "max-h-0 opacity-0 px-6 max-sm:px-4 py-0"
            }`}
          >
            <div className="relative">
              {!disableTransitions &&
                isTransitioning &&
                previousListItems.length > 0 && (
                  <div
                    className={`
                  ${
                    previousListItems?.length == 4
                      ? "md:grid md:grid-cols-4 max-md:flex gap-4 max-sm:gap-3 overflow-x-auto"
                      : "flex gap-4 max-sm:gap-3 flex-nowrap"
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
                        className=" md:min-w-[200px] max-sm:min-w-[200px]"
                      >
                        <AvailableList
                          list={{
                            name: item?.name,
                            value: item?.value,
                            smallTooptip: item?.smallTooptip,
                            showCheckbox: item?.showCheckbox,
                            isChecked: item?.isChecked,
                            disabled: item?.disabled,
                            onCheckChange: undefined,
                            onClick: undefined,
                          }}
                          loading={loading}
                        />
                      </div>
                    ))}
                  </div>
                )}

              <div
                className={`
                ${
                  currentListItems?.length == 4
                    ? "md:grid md:grid-cols-4 max-md:flex gap-4 max-sm:gap-3 overflow-x-auto"
                    : "flex gap-4 max-sm:gap-3 flex-nowrap overflow-x-scroll max-sm:overflow-x-auto hideScrollbar"
                } min-w-min md:min-w-0 ${
                  !disableTransitions
                    ? "transition-transform duration-300 ease-in-out"
                    : ""
                }
                ${
                  !disableTransitions && isTransitioning
                    ? "transform translate-x-0"
                    : "transform translate-x-0"
                }
              `}
                style={{
                  transform:
                    !disableTransitions && isTransitioning
                      ? "translateX(0)"
                      : "translateX(0)",
                  animation:
                    !disableTransitions && isTransitioning
                      ? transitionDirection === "next"
                        ? "slideInFromRight 0.3s ease-in-out"
                        : "slideInFromLeft 0.3s ease-in-out"
                      : "none",
                }}
              >
                {currentListItems?.map((item, index) => (
                  <div
                    key={`current-${item.key || index}-${Date.now()}`}
                    className="flex-grow flex-shrink flex-basis-[25%] md:min-w-[12rem] max-sm:min-w-[200px]"
                  >
                    <AvailableList
                      list={{
                        name: item?.name,
                        value: item?.value,
                        showCheckbox: item?.showCheckbox,
                        smallTooptip: item?.smallTooptip,
                         disabled: item?.disabled,
                        isChecked: item?.isChecked,
                        onCheckChange:
                          item?.showCheckbox &&
                          item?.key &&
                          (!isTransitioning || disableTransitions)
                            ? () =>
                                handleCheckboxToggle(item.key, item.isChecked)
                            : undefined,
                        onClick:
                          item?.showCheckbox &&
                          item?.key &&
                          (!isTransitioning || disableTransitions)
                            ? () =>
                                handleCheckboxToggle(item.key, item.isChecked)
                            : undefined,
                      }}
                      loading={loading}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Section */}
          {showFilters && getVisibleFilters().length > 0 && (
            <div className="px-6 max-sm:px-4 py-5 max-sm:py-3">
              {customComponent && customComponent()}
              <FilterSection
                filterConfig={getVisibleFilters()}
                currentTab={selectedTab}
                onFilterChange={handleFilterChange}
                containerClassName="flex max-md:flex-col max-sm:flex-col md:flex-wrap gap-3 max-sm:gap-3 items-center max-sm:items-stretch"
                initialValues={currentFilterValues}
              />
            </div>
          )}

          {showSelectedFilterPills && (
            <div className="px-[20px] max-sm:px-[16px] border-t-1 border-gray-200">
              <ActiveFiltersBox
                activeFilters={currentFilterValues}
                onFilterChange={onFilterChange}
                onClearAllFilters={handleClearAllFilters}
                currentTab={selectedTab}
                filterConfig={filterConfig}
                excludedKeys={excludedKeys}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const isMobile = useIsMobile();
  return (
    <div className={className}>
      {/* Header V2 or Original Top Right Controls */}
      {useHeaderV2 ? (
        <div className={`${headerV2ClassName}`}>
          <HeaderV2
            showFilters={showFilters}
            showFilterDropdown={showFilterDropdown}
            setShowFilterDropdown={setShowFilterDropdown}
            setShowColumnDropdown={setShowColumnDropdown}
            showColumnDropdown={showColumnDropdown}
            filterDropdownRef={filterDropdownRef}
            columnDropdownRef={columnDropdownRef}
            getAvailableFilters={getAvailableFilters}
            handleFilterToggle={handleFilterToggle}
            getAvailableColumns={getAvailableColumns}
            handleColumnToggle={handleColumnToggle}
            handleColumnsReorder={handleColumnsReorder}
            handleFiltersReorder={handleFiltersReorder}
            hideVisibleColumns={hideVisibleColumns}
            onAddInventory={onAddInventory}
            addInventoryText={addInventoryText}
            showListItems={showListItems}
            onToggleListItems={handleToggleListItems}
            isDraggableColumns={isDraggableColumns}
            isDraggableFilters={isDraggableFilters}
            showColumnSearch={showColumnSearch}
            showFilterSearch={showFilterSearch}
              showGlobalCurrency={!!onCurrencyChange}
              currencyOptions={(tabCurrencies && tabCurrencies[selectedTab]) ? (tabCurrencies[selectedTab].options || tabCurrencies.options || []) : (tabCurrencies?.options || [])}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={(val) => onCurrencyChange && onCurrencyChange(val, selectedTab)}
          />
        </div>
      ) : (
        <div className="absolute top-6 max-sm:top-4 right-6 max-sm:right-4 flex gap-2 z-50">
          {showFilters && !isMobile && (
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowColumnDropdown(false);
                }}
                className="p-2 max-sm:p-1.5 bg-white border cursor-pointer border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                title="Filters"
              >
                <FilterIcon className="w-5 h-5 max-sm:w-4 max-sm:h-4 text-gray-600" />
              </button>

              <DropdownList
                isOpen={showFilterDropdown}
                title="Filters"
                items={getAvailableFilters()}
                onItemChange={handleFilterToggle}
                onItemsReorder={handleFiltersReorder}
                emptyMessage="No filters available"
                className="absolute right-0 mt-2 w-64 max-sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                isDraggable={isDraggableFilters}
                showSearch={showFilterSearch}
              />
            </div>
          )}

          {!hideVisibleColumns && !isMobile && (
            <div className="relative" ref={columnDropdownRef}>
              <button
                onClick={() => {
                  setShowColumnDropdown(!showColumnDropdown);
                  setShowFilterDropdown(false);
                }}
                className="p-2 max-sm:p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                title="Columns"
              >
                <ColumnsIcon className="w-5 h-5 max-sm:w-4 max-sm:h-4 text-gray-600" />
              </button>

              <DropdownList
                isOpen={showColumnDropdown}
                title="Columns"
                items={getAvailableColumns()}
                onItemChange={handleColumnToggle}
                onItemsReorder={handleColumnsReorder}
                emptyMessage="No columns available"
                className="absolute right-0 mt-2 w-64 max-sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                isDraggable={isDraggableColumns}
                showSearch={showColumnSearch}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile and Desktop tabs */}
      {tabs?.length > 0 && (
        <div
          className={`flex gap-[4px] max-sm:gap-[2px] ${
            showTabFullWidth ? "w-full" : "w-[70%] max-sm:w-full"
          } px-[24px] max-sm:px-[16px] ${useHeaderV2 ? "pt-0" : "pt-[24px] max-sm:pt-[16px]"}`}
        >
          {/* Desktop tabs - hidden on small screens */}
          <div className="hidden sm:contents">
            {tabs?.map((tab, index) => {
              const selectedIndex = tab?.key === selectedTab;
              return (
                <SelectListItem
                  key={index}
                  item={tab}
                  selectedIndex={selectedIndex}
                  handleSelectItemClick={handleTabChange}
                  onCurrencyChange={onCurrencyChange}
                  loading={loading}
                  selectedCurrency={tabCurrencies?.[tab.key] || selectedCurrency}
                />
              );
            })}
          </div>
          
          {/* Mobile tab selector - visible only on small screens */}
          <div className="sm:hidden w-full pb-3">
            <div className="relative">
              <select
                value={selectedTab}
                onChange={(e) => {
                  const selectedTabObj = tabs.find(tab => tab.key === e.target.value);
                  if (selectedTabObj) {
                    handleTabChange(selectedTabObj);
                  }
                }}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                {tabs.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.name} {tab.count && `(${tab.count})`}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Mobile tab info display */}
            {(() => {
              const currentTab = tabs.find(tab => tab.key === selectedTab);
              return currentTab && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-blue-800 font-medium">
                      {currentTab.name}
                    </div>
                    <div className="text-xs text-blue-600">
                      {currentTab.count && `${currentTab.count} items`}
                      {currentTab.amount && ` • ${currentTab.amount}`}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* UPDATED: Scrollable container with scroll handler */}
      {!showCustomTable && tabbedFilterActiveFilterCongig()}

      {showCustomTable && (
        <div
          ref={scrollContainerRef}
          className={`${
            customTableComponent && `${`overflow-auto ${reportsPage ? "max-h-[calc(100vh-125px)]" :"max-h-[calc(100vh-250px)] max-sm:max-h-[calc(100vh-200px)]"}`}`
          }`}
          onScroll={debouncedHandleScroll}
        >
          {tabbedFilterActiveFilterCongig()}
          {customTableComponent && customTableComponent()}

          {/* Loading indicator for pagination */}
          {loadingMore && (
            <div className="flex justify-center py-4 max-sm:py-3">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm max-sm:text-xs">Loading more...</span>
              </div>
            </div>
          )}

          {/* End of data indicator */}
          {!hasNextPage && !loading && (
            <div className="flex justify-center py-4 max-sm:py-3 text-gray-500 text-sm max-sm:text-xs">
              No more data to load
            </div>
          )}
        </div>
      )}

      {/* CSS Animations */}
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

          .hideScrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .hideScrollbar::-webkit-scrollbar {
            display: none;
          }

          /* Mobile responsive improvements */
          @media (max-width: 640px) {
            .grid-cols-4 {
              grid-template-columns: 1fr;
            }
            
            .md\:flex {
              display: flex;
              flex-direction: column;
            }
            
            .gap-4 {
              gap: 0.75rem;
            }
            
            .px-6 {
              padding-left: 1rem;
              padding-right: 1rem;
            }
            
            .py-5 {
              padding-top: 0.75rem;
              padding-bottom: 0.75rem;
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default TabbedLayout;