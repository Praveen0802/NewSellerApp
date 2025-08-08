import React, { useState } from "react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import Image from "next/image";
import blueCalendar from "../../../public/blue-calendar.svg";
import blueLocation from "../../../public/blue-location.svg";
import blueClock from "../../../public/blue-clock.svg";
import FormFields from "../formFieldsComponent";

const InventoryTable = ({ listArrayValues, dynamicKeys = [] }) => {
  const [expandedAccordions, setExpandedAccordions] = useState([]);

  const toggleAccordion = (index) => {
    if (expandedAccordions.includes(index)) {
      setExpandedAccordions(expandedAccordions.filter((i) => i !== index));
    } else {
      setExpandedAccordions([...expandedAccordions, index]);
    }
  };

  const fieldStyle =
    "w-full rounded-md border border-gray-300 p-2 text-gray-700 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all duration-200";

  // Default field configurations
  const getFieldConfig = (key) => {
    const configs = {
      ticketType: {
        type: "select",
        searchable: true,
        options: [
          { label: "E-ticket", value: "E-ticket" },
          { label: "Paper ticket", value: "Paper ticket" },
          { label: "Mobile ticket", value: "Mobile ticket" },
        ],
      },
      splitType: {
        type: "select",
        searchable: true,
        options: [
          { label: "Split Type", value: "Split Type" },
          { label: "No Split", value: "No Split" },
          { label: "Free Split", value: "Free Split" },
        ],
      },
      fanArea: {
        type: "select",
        searchable: true,
        options: [
          {
            label: "Longside Lower Tier Central",
            value: "Longside Lower Tier Central",
          },
          { label: "Longside Upper Tier", value: "Longside Upper Tier" },
          { label: "Behind Goal", value: "Behind Goal" },
        ],
      },
      sectionBlock: {
        type: "select",
        searchable: true,
        options: [
          { label: "Block 1", value: "Block 1" },
          { label: "Block 2", value: "Block 2" },
          { label: "Block 3", value: "Block 3" },
        ],
      },
      seatingArrangement: {
        type: "select",
        searchable: true,
        options: [
          { label: "No preference", value: "No preference" },
          { label: "Together", value: "Together" },
          { label: "Separate", value: "Separate" },
        ],
      },
      ticketsInHand: {
        type: "checkbox",
      },
      dateToShip: {
        type: "date",
      },
      faceValue: {
        type: "text",
        prefix: "£",
      },
      payoutPrice: {
        type: "text",
        prefix: "£",
      },
    };

    return configs[key] || { type: "text" };
  };

  const createFormField = (key, value) => {
    const config = getFieldConfig(key);
    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");

    const baseField = {
      hideLabel: true,
      label: label,
      id: key,
      name: key,
      value: value,
      className: `!py-1 !px-2 ${fieldStyle}`,
    };

    if (config.type === "checkbox") {
      return {
        ...baseField,
        type: "checkbox",
        checked: value,
        className: "!py-1 !px-2",
      };
    }

    return {
      ...baseField,
      type: config.type,
      searchable: config.searchable,
      options: config.options,
      prefix: config.prefix,
    };
  };

  // Get column width class based on key
  const getColumnWidth = (key) => {
    const widthMap = {
      ticketType: "w-24",
      splitType: "w-24",
      seatingArrangement: "w-32",
      fanArea: "w-48",
      sectionBlock: "w-28",
      faceValue: "w-28",
      payoutPrice: "w-28",
      benefits: "w-24",
      restrictions: "w-24",
      dateToShip: "w-28",
      ticketsInHand: "w-24",
      uploadTickets: "w-24",
    };
    return widthMap[key] || "w-20";
  };

  // Determine which keys to display - use dynamicKeys if provided, otherwise use tableHeader
  const getDisplayKeys = (item) => {
    if (dynamicKeys.length > 0) {
      return dynamicKeys;
    }
    return item.tableHeader || [];
  };

  // Calculate minimum table width based on number of columns
  const getMinTableWidth = (columnCount) => {
    const baseWidth = 1200;
    const extraWidth = Math.max(0, (columnCount - 10) * 100);
    return baseWidth + extraWidth;
  };

  return (
    <div className="bg-white rounded-md shadow-sm mb-4">
      {listArrayValues.map((item, index) => {
        const displayKeys = getDisplayKeys(item);
        const minTableWidth = getMinTableWidth(displayKeys.length + 3); // +3 for checkbox, actions, and buffer

        return (
          <div key={index} className="mb-4">
            <div
              className="bg-[#343432] text-white p-4 rounded-t-md flex justify-between items-center cursor-pointer"
              onClick={() => toggleAccordion(index)}
            >
              <div className="flex flex-col md:flex-row md:gap-4 items-start md:items-center min-w-0 flex-1">
                <h3 className="text-lg font-medium truncate max-w-full md:max-w-xs">
                  {item.accordionTitle?.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm min-w-0">
                  {item.accordionTitle?.date && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Image
                        src={blueCalendar}
                        alt="calendar"
                        width={14}
                        height={14}
                        className="invert flex-shrink-0"
                      />
                      <span className="text-[12px] font-normal text-white truncate">
                        {item.accordionTitle.date}
                      </span>
                    </div>
                  )}
                  {item.accordionTitle?.time && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Image
                        src={blueClock}
                        alt="clock"
                        width={14}
                        height={14}
                        className="invert flex-shrink-0"
                      />
                      <span className="text-[12px] font-normal text-white truncate">
                        {item.accordionTitle.time}
                      </span>
                    </div>
                  )}
                  {item.accordionTitle?.location && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Image
                        src={blueLocation}
                        alt="location"
                        width={14}
                        height={14}
                        className="invert flex-shrink-0"
                      />
                      <span className="text-[12px] font-normal text-white truncate max-w-[200px]">
                        {item.accordionTitle.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center flex-shrink-0 ml-2">
                <span>
                  {expandedAccordions.includes(index) ? (
                    <IconStore.chevronUp className="size-5" />
                  ) : (
                    <IconStore.chevronDown className="size-5" />
                  )}
                </span>
              </div>
            </div>

            {expandedAccordions.includes(index) && (
              <div className="border border-t-0 border-[#E0E1EA] rounded-b-md relative">
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ minWidth: `${minTableWidth}px` }}>
                    <thead>
                      <tr className="bg-[#F5F7FA] border-b border-[#E0E1EA]">
                        <th className="w-10 px-2 py-3 sticky left-0 bg-[#F5F7FA] z-10">
                          <input type="checkbox" className="rounded" />
                        </th>
                        {displayKeys.map((header, headerIndex) => (
                          <th
                            key={headerIndex}
                            className="px-2 py-3 text-left text-sm font-medium text-[#323A70] whitespace-nowrap"
                          >
                            {typeof header === 'object' ? header.title : header}
                          </th>
                        ))}
                        <th className="px-2 py-3 text-left text-sm font-medium text-[#323A70] sticky right-0 bg-[#F5F7FA] z-10">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {item?.tableKey?.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-[#E0E1EA] hover:bg-gray-50"
                        >
                          <td className="px-2 py-2 sticky left-0 bg-white z-10">
                            <input type="checkbox" className="rounded" />
                          </td>
                          {displayKeys.map((header, colIndex) => {
                            const key = typeof header === 'object' ? header.key : header;
                            const value = row[key];

                            if (key === 'uploadTickets') {
                              return (
                                <td key={colIndex} className="px-2 py-2">
                                  <div className="w-24">
                                    <button className="bg-blue-50 text-gray-600 px-3 py-1 rounded text-sm">
                                      Upload
                                    </button>
                                  </div>
                                </td>
                              );
                            }

                            if (key === 'ticketsInHand') {
                              return (
                                <td key={colIndex} className="px-2 py-2">
                                  <div className="w-24 flex justify-center">
                                    <FormFields
                                      formFields={[createFormField(key, value)]}
                                    />
                                  </div>
                                </td>
                              );
                            }

                            return (
                              <td key={colIndex} className="px-2 py-2">
                                <div className={getColumnWidth(key)}>
                                  <FormFields
                                    formFields={[createFormField(key, value)]}
                                  />
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-2 py-2 sticky right-0 bg-white z-10">
                            <div className="flex space-x-2">
                              <button className="text-gray-500 hover:text-gray-600">
                                <IconStore.copy className="size-5" />
                              </button>
                              <button className="text-gray-500 hover:text-gray-600">
                                <IconStore.download className="size-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InventoryTable;