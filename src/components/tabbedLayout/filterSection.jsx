import React, { useState } from "react";
import FormFields from "../formFieldsComponent";

const FilterSection = ({
  filterConfig,
  currentTab,
  onFilterChange,
  containerClassName = "md:flex gap-4 items-center md:w-[90%] p-4",
  initialValues = {},
}) => {
  const [filterValues, setFilterValues] = useState(initialValues);

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
  const formFieldsData = filterConfig.map((filter) => ({
    ...filter,
    value: filterValues[filter.name] || filter.defaultValue || "",
    onChange: (e) => {
      const value = e?.target?.value !== undefined ? e.target.value : e;
      handleFilterChange(filter.name, value);
    },
  }));

  return (
    <div className={containerClassName}>
      <FormFields formFields={formFieldsData} />
    </div>
  );
};

export { FilterSection };
