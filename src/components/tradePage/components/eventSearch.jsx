import FormFields from "@/components/formFieldsComponent";
import { IconStore } from "@/utils/helperFunctions/iconStore";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import SearchedList from "./searchedList";
import {
  FetchEventSearch,
  fetchRecentlyViewedList,
  FetchVenue,
} from "@/utils/apiHandler/request";
import SelectDateComponent from "./selectDateComponent";
import { useRouter } from "next/router";
import { SearchX } from "lucide-react";

// Shimmer Effect Component
const ShimmerItem = () => (
  <div className="p-4 border-b border-[#E0E1EA]">
    <div className="flex flex-col gap-2">
      <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded"></div>
      <div className="flex gap-2 items-center">
        <div className="w-1/4 h-3 bg-gray-200 animate-pulse rounded"></div>
        <div className="w-1/5 h-3 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="w-1/2 h-3 bg-gray-200 animate-pulse rounded"></div>
    </div>
  </div>
);

const EventSearch = ({ onClose, allCategories }) => {
  const [formFieldValues, setFormFieldValues] = React.useState({
    event_date: "",
    country: "",
    venue: "",
    event_categories: "",
    any_date: "",
  });

  const displayDropdownRef = useRef(null);

  const [displayEventValues, setDisplayEventValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [venueOptions, setVenueOptions] = useState([]);

  const [filtersApplied, setFiltersApplied] = useState({});
  const [selected, setSelected] = useState();

  const fetchApiCall = async (params) => {
    setLoading(true);
    const response = await FetchEventSearch("", params);
    setDisplayEventValues(response);
    setLoading(false);
  };
  const handleClickReset = () => {
    setLoading(true);
    const initialValues = {
      event_date: "",
      country: "",
      venue: "",
      event_categories: "",
      any_date: "",
    };
    setFormFieldValues(initialValues);
    setFiltersApplied({});
    setSelected();
    setDisplayEventValues([]);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const venueSearch = async (params) => {
    const response = await FetchVenue("", params);
    setVenueOptions(response);
  };

  // const debounce = (func, delay) => {
  //   let timer;
  //   return function (...args) {
  //     clearTimeout(timer);
  //     timer = setTimeout(() => func(...args), delay);
  //   };
  // };
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetchEventSearch = useCallback(
    debounce((fetchFunction, params) => {
      fetchFunction(params);
    }, 1000),
    []
  );

  // const debouncedFetchEventSearch = debounce((fetchFunction, params) => {
  //   fetchFunction(params);
  // }, 500);

  const categoriesList = allCategories?.map((item) => {
    return {
      value: item?.name,
      label: item?.name,
      id: item?.id,
      ...(item?.is_tournament && { is_tournament: item?.is_tournament }),
      ...(item?.game_category && { game_category: item?.game_category }),
      ...(item?.is_tixstock && { is_tixstock: item?.is_tixstock }),
      ...(item?.is_game_category && {
        is_game_category: item?.is_game_category,
      }),
    };
  });

  const router = useRouter();
  const handleChange = async (e, key, type, selectedObject) => {
    const selectType = type === "select";
    const dateType = type === "date"; // Fixed equality check
    const value = selectType || dateType ? e : e.target.value;
    setFormFieldValues({ ...formFieldValues, [key]: value });
    if (key === "event_date") {
      const updatedQueryValues = {
        ...filtersApplied,
        query: value,
      };
      setFiltersApplied(updatedQueryValues);
      debouncedFetchEventSearch(fetchApiCall, updatedQueryValues);
    }
    if (key === "venue") {
      const updatedParams = { ...filtersApplied, venue: "", city: "" };
      setFiltersApplied(updatedParams);
      if (value) {
        debouncedFetchEventSearch(venueSearch, { params: value });
      } else {
        fetchApiCall(updatedParams);
      }
    }
    if (key == "event_categories") {
      const updatedQueryValues = {
        ...filtersApplied,
        is_tournament:
          selectedObject?.is_tournament != undefined
            ? selectedObject?.is_tournament == 0
              ? 0
              : selectedObject?.is_tournament
            : "",
        is_game_category:
          selectedObject?.is_game_category != undefined
            ? selectedObject?.is_game_category
            : "",
        category_id: selectedObject?.id != undefined ? selectedObject?.id : "",
        is_tixstock: selectedObject?.is_tixstock || "",
        game_category: selectedObject?.game_category || "",
      };
      console.log(updatedQueryValues, "updatedQueryValues");
      setFiltersApplied(updatedQueryValues);
      fetchApiCall(updatedQueryValues);
    }
  };
  const handleVenueViewClick = async (params, name, type) => {
    setFormFieldValues({ ...formFieldValues, [type]: name });
    setVenueOptions([]);
    const venueParams = {
      ...filtersApplied,
      ...params,
    };
    setFiltersApplied(venueParams);
    await fetchApiCall(venueParams);
  };

  const venueSearchEventComponent = () => (
    <div ref={displayDropdownRef} className="max-h-[250px] overflow-y-scroll">
      {venueOptions?.venue?.length > 0 && (
        <div className="flex flex-col border-b border-[#E0E1EA] pb-2 mb-2">
          <p className="text-sm py-1 px-2 font-semibold text-gray-700">Venue</p>
          <div className="flex flex-col gap-1">
            {venueOptions.venue.map((item, index) => (
              <p
                onClick={() => {
                  handleVenueViewClick(
                    { venue: item?.s_id },
                    item?.name,
                    "venue"
                  );
                }}
                key={index}
                className="px-2 py-1 text-sm text-gray-600 rounded cursor-pointer hover:bg-[#f0f1f6] transition-colors duration-150"
              >
                {item?.name}
              </p>
            ))}
          </div>
        </div>
      )}

      {venueOptions?.city?.length > 0 && (
        <div className="flex flex-col border-b border-[#E0E1EA] pb-2 mb-2">
          <p className="text-sm py-1 px-2 font-semibold text-gray-700">City</p>
          <div className="flex flex-col gap-1">
            {venueOptions.city.map((item, index) => (
              <p
                key={index}
                onClick={() => {
                  handleVenueViewClick(
                    { city: item?.city_id },
                    item?.name,
                    "venue"
                  );
                }}
                className="px-2 py-1 text-sm text-gray-600 rounded cursor-pointer hover:bg-[#f0f1f6] transition-colors duration-150"
              >
                {item?.name}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        displayDropdownRef.current &&
        !displayDropdownRef.current.contains(event.target)
      ) {
        setVenueOptions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formValues = [
    {
      label: "Event/Performer",
      type: "text",
      id: "event_date",
      hideCalendarIcon: true,
      mandatory: true,
      singleDateMode: true,
      name: "event_date",
      value: formFieldValues?.event_date,
      onChange: (e) => handleChange(e, "event_date"),
      className: `!py-[6px] !text-[13px] !px-[10px]`,
      labelClassName: "!text-[12px] text-gray-600  block",
      placeholder: "Enter event/performer",
    },
    // {
    //   label: "Venue/City",
    //   type: "text",
    //   id: "venue",
    //   name: "venue",
    //   showDropdown: true,
    //   dropDownComponent: venueSearchEventComponent("venue"),
    //   // onBlur: handleVenueBlurChange,
    //   value: formFieldValues?.venue,
    //   onChange: (e) => handleChange(e, "venue"),
    //   className: `!py-[6px] !text-[13px] !px-[10px] `,
    //   labelClassName: "!text-[12px] text-gray-600  block",
    //   placeholder: "Enter venue/city",
    // },
    // {
    //   label: "All event categories",
    //   type: "select",
    //   searchable: true,
    //   mandatory: true,
    //   id: "event_categories",
    //   name: "event_categories",
    //   value: formFieldValues?.event_categories,
    //   onChange: handleChange,
    //   className: `!py-[6px] !text-[13px] !px-[10px]`,
    //   labelClassName: "!text-[12px] text-gray-600  block",
    //   options: categoriesList,
    // },
  ];

  const handleEventClick = async (item) => {

    await fetchRecentlyViewedList("", "POST", "", {
      m_id: item?.m_id,
    });
    router.push(`/trade/inventory/${item?.m_id}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div>
          {[1, 2, 3].map((item) => (
            <ShimmerItem key={item} />
          ))}
        </div>
      );
    } else {
      // Check if there are no results
      const hasPerformers = displayEventValues?.performers?.length > 0;
      const hasEvents = displayEventValues?.events?.length > 0;
      const hasSearched = Object.values(filtersApplied).length > 0;
      // Only show "no results" if user has searched and there are no results
      if (hasSearched && !hasPerformers && !hasEvents) {
        return (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="text-gray-400 mb-4">
              <SearchX className="w-12 h-12" />
            </div>
            <p className="text-gray-500 text-center text-sm">
              No results found
            </p>
            <p className="text-gray-400 text-center text-xs mt-1">
              Try adjusting your search criteria
            </p>
          </div>
        );
      }

      // Return empty div if no search has been performed yet
      if (!hasSearched) {
        return <div></div>;
      }

      return (
        <>
          {hasPerformers && (
            <div className="flex flex-col gap-2">
              <p className="px-4 text-[13px] font-medium">Performers</p>
              {displayEventValues?.performers?.map((item, index) => (
                <p
                  key={index}
                  onClick={() => {
                    handleChange(
                      { target: { value: item?.team_name } },
                      "event_date"
                    );
                  }}
                  className="border border-[#E0E1EA] mx-4 px-1 rounded-md py-1 text-[13px] text-[#343432] cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  {item?.team_name}
                </p>
              ))}
            </div>
          )}
          {hasEvents && (
            <div className={`flex flex-col gap-2 p-3 `}>
              <p className="px-4 text-[13px] font-medium">Events</p>
              {displayEventValues.events.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleEventClick(item)}
                  className="hover:scale-105 cursor-pointer transition-transform duration-200"
                >
                  <SearchedList item={item} />
                </div>
              ))}
            </div>
          )}
        </>
      );
    }
  };

  const dateOptions = [
    { value: "any", label: "Any Date" },
    { value: "today", label: "Today" },
    { value: "next_7days", label: "Next 7 Days" },
    { value: "next_30days", label: "Next 30 Days" },
    { value: "next_60days", label: "Next 60 Days" },
    { value: "custom_range", label: "Custom Range" },
  ];

  const handleDateChange = (key, dateRange) => {
    let updatedParams = {};
    if (key === "custom_range") {
      updatedParams = {
        start_date: dateRange?.startDate,
        end_date: dateRange?.endDate,
        date_format: "",
        any_date: "",
      };
    } else if (key === "any") {
      updatedParams = {
        start_date: "",
        end_date: "",
        date_format: "",
      };
    } else {
      updatedParams = {
        start_date: "",
        end_date: "",
        date_format: key,
        any_date: "",
      };
    }
    const updatedFieldParams = { ...filtersApplied, ...updatedParams };
    setFiltersApplied(updatedFieldParams);

    fetchApiCall(updatedFieldParams);
  };

  return (
    <div className="bg-white w-full h-full shadow-md border-r-[1px] border-[#E0E1EA] flex flex-col">
      <div className="flex justify-between items-center border-b-[1px] border-[#E0E1EA] p-4">
        <p className="text-[#343432] text-[16px] font-semibold">Event Search</p>
        <div className="flex gap-2 items-center">
          <button onClick={handleClickReset} className="cursor-pointer">
            <IconStore.reload className="stroke-[#3E2E7E] size-4" />
          </button>
          <button className="cursor-pointer" onClick={onClose}>
            <IconStore.close className="stroke-[#3E2E7E] size-4" />
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-[14px]">
        <FormFields formFields={formValues} />
        <SelectDateComponent
          label="Date range"
          onChange={handleDateChange}
          selected={selected}
          setSelected={setSelected}
          labelClassName="!text-[12px] text-gray-600  block"
          id="date-picker"
          paddingClassName="!py-[6px] text-[12px] !px-[10px]"
          dateOptions={dateOptions}
        />
      </div>
      <div className="overflow-y-auto flex-1 pb-[100px]">{renderContent()}</div>
    </div>
  );
};

export default EventSearch;
