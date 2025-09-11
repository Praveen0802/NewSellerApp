import React, { useState, useEffect } from "react";
import FormFields from "../formFieldsComponent";

const FilterSection = ({
  filterConfig,
  currentTab,
  onFilterChange,
  containerClassName = "md:flex gap-4 items-center  p-4",
  initialValues = {},
}) => {
  const [filterValues, setFilterValues] = useState(initialValues);

  // Update internal state when initialValues change (from ActiveFiltersBox clearing)
  useEffect(() => {
    setFilterValues(initialValues);
  }, [initialValues]);

  const handleFilterChange = (filterKey, value, additionalData = {}) => {
    const updatedFilters = {
      ...filterValues,
      [filterKey]: value,
      ...additionalData,
    };

    setFilterValues(updatedFilters);
    onFilterChange?.(filterKey, value, updatedFilters, currentTab);
  };

  if (!filterConfig || filterConfig.length === 0) {
    return null;
  }

  // Convert filter config to FormFields format and add current values
  const formFieldsData = filterConfig.map((filter) => {
    const isCheckbox = filter?.type === "checkbox";
    let resolvedValue;
    if (isCheckbox) {
      // For checkboxes: default to false unless explicitly provided in initialValues/state
      const current = filterValues?.[filter.name];
      resolvedValue = current !== undefined ? current : false;
    } else {
      resolvedValue =
        filterValues?.[filter.name] ?? filter?.defaultValue ?? filter?.value ?? "";
    }

    return {
      ...filter,
      // For checkboxes, ensure checked is driven by current value and not by config visibility flags
      checked: isCheckbox ? !!resolvedValue : filter.checked,
      value: resolvedValue,
      onChange: (e) => {
        const value = isCheckbox
          ? (e?.target?.checked ?? !!e)
          : e?.target?.value !== undefined
          ? e.target.value
          : e;
        handleFilterChange(filter.name, value);
      },
    };
  });

  return (
    <div className={` ${containerClassName}`}>
      <FormFields formFields={formFieldsData} />
    </div>
  );
};

export { FilterSection };
