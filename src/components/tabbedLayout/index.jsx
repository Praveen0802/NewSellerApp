import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SelectListItem from "../tradePage/components/selectListItem";
import AvailableList from "../tradePage/components/availableList";
import { FilterSection } from "./filterSection";

const TabbedLayout = ({
  tabs,
  initialTab,
  listItemsConfig,
  filterConfig,
  onTabChange,
  onFilterChange,
  onCheckboxToggle,
  className = "bg-[#ECEDF2] w-full h-full relative",
  containerClassName = "flex flex-col gap-[24px]",
  showFilters = true,
}) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(initialTab || tabs[0]?.key);
  const [checkboxValues, setCheckboxValues] = useState({});

  // Initialize checkbox values from config - Fixed to run only once per config change
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
  }, [JSON.stringify(listItemsConfig)]); // Only re-run if config actually changes

  // Get current tab's list items - Fixed to properly merge state
  const getCurrentListItems = () => {
    const baseItems = listItemsConfig[selectedTab] || [];
    return baseItems.map((item) => ({
      ...item,
      isChecked: item.key
        ? checkboxValues[item.key] ?? item.isChecked ?? false
        : false,
    }));
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab.key);
    if (tab.route) {
      router?.push(tab.route);
    }
    onTabChange?.(tab);
  };

  // Fixed checkbox toggle handler
  const handleCheckboxToggle = (itemKey, currentValue) => {
    // Handle both index-based and key-based calls
    let key, newValue;

    if (typeof itemKey === "number") {
      // If called with index (legacy support)
      const currentItems = getCurrentListItems();
      const item = currentItems[itemKey];
      if (!item?.key) return;
      key = item.key;
      newValue = !checkboxValues[item.key];
    } else {
      // If called with key directly (recommended)
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

    // Call parent callback with proper parameters
    onCheckboxToggle?.(key, newValue, updatedCheckboxValues);
  };

  const handleFilterChange = (filterKey, value, allFilters, currentTab) => {
    onFilterChange?.(filterKey, value, allFilters, currentTab);
  };

  return (
    <div className={className}>
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
          {/* List Items Section */}
          <div className="px-[24px] py-[20px] border-b-[1px] border-[#E0E1EA] overflow-x-auto">
            <div className="flex gap-4 flex-nowrap min-w-min md:min-w-0">
              {getCurrentListItems()?.map((item, index) => (
                <AvailableList
                  key={item.key || index} // Better key for React reconciliation
                  list={{
                    name: item?.name,
                    value: item?.value,
                    showCheckbox: item?.showCheckbox,
                    isChecked: item?.isChecked,
                    // Fixed: Pass the item key and current checked state
                    onCheckChange:
                      item?.showCheckbox && item?.key
                        ? () => handleCheckboxToggle(item.key, item.isChecked)
                        : undefined,
                    onClick:
                      item?.showCheckbox && item?.key
                        ? () => handleCheckboxToggle(item.key, item.isChecked)
                        : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Filter Section */}
          {showFilters && filterConfig && (
            <FilterSection
              filterConfig={filterConfig[selectedTab]}
              currentTab={selectedTab}
              onFilterChange={handleFilterChange}
              containerClassName="md:flex gap-4 items-center md:w-[90%] p-4"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TabbedLayout;
