import React, { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  Edit,
  MapPin,
  X,
  XCircle,
} from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import CustomModal from "@/components/commonComponents/customModal";
import CustomSelect from "@/components/commonComponents/customSelect";
import {
  getmarketingInsights,
  updateTicketsPrice,
} from "@/utils/apiHandler/request";
import Tooltip from "@/components/addInventoryPage/simmpleTooltip";

// Shimmer Loader Component
const ShimmerLoader = () => {
  return (
    <div className="animate-pulse w-full">
      {/* Header shimmer */}
      <div className="flex border-b border-gray-200 bg-white">
        <div className="p-3 w-32">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="p-3 w-20">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="p-3 w-24">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="p-3 w-24">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="p-3 w-28">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="p-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>

      {/* Row shimmers */}
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex border-b border-gray-200">
          <div className="p-3 w-32">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="p-3 w-20">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="p-3 w-24">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="p-3 w-24">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="p-3 w-28">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="p-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 mb-4">
        <Calendar className="w-12 h-12" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No listings found
      </h3>
      <p className="text-gray-500 text-center max-w-sm">
        There are currently no ticket listings available for this match.
      </p>
    </div>
  );
};

const ListingsMarketplace = ({ show, onClose, matchInfo, filters }) => {
  const [listValueData, setListvalueData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const getInsightsData = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getmarketingInsights("", {
        match_id: matchInfo?.match_id,
        ...params,
      });

      setListvalueData(res);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Failed to load ticket listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (show && matchInfo?.match_id) {
      getInsightsData();
    }
  }, [show, matchInfo?.match_id]);

  // Safe data extraction with null checks
  const listingsArray = listValueData?.listings?.data || [];
  const [selectedTab, setSelectedTab] = useState("Listings");
  const [editingRow, setEditingRow] = useState(null);
  const [editPrices, setEditPrices] = useState({});

  // Filter states
  const [sections, setSections] = useState("All Sections");
  const [venues, setVenues] = useState("All Venue Areas");
  const [quantities, setQuantities] = useState("All Quantities");

  const [filtersApplied, setFiltersApplied] = useState({
    ticket_category: "",
    quantity: "",
  });
  const matchDetails = {
    title: matchInfo?.match_name || "Match Details",
    date: matchInfo?.match_date || matchInfo?.match_date_format || "Date TBD",
    venue: `${matchInfo?.stadium_name || "Stadium"}, ${
      matchInfo?.city_name || "City"
    }, ${matchInfo?.country_name || "Country"}`,
  };

  const filterOptions = [
    ...Object.entries(filters?.block_data || {}).map(([key, value]) => ({
      value: key,
      label: value,
    })),
  ];

  // const venueOptions = [
  //   { value: "all", label: "All Venue Areas" },
  //   { value: "home", label: "Home" },
  //   { value: "away", label: "Away" },
  // ];
  const generateQuantityOptions = (max = 50) => {
    return Array.from({ length: max }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    }));
  };

  const quantityOptions = generateQuantityOptions();

  // Function to handle price edit initialization
  const startEditPrice = (ticketId, currentPrice) => {
    setEditingRow(ticketId);
    setEditPrices({
      ...editPrices,
      [ticketId]: String(currentPrice || "").replace(/[^0-9.]/g, "") || "",
    });
  };

  // Function to handle price input change
  const handlePriceChange = (ticketId, value) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = cleanValue.split(".");
    const formattedValue =
      parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleanValue;

    setEditPrices({
      ...editPrices,
      [ticketId]: formattedValue,
    });
  };

  // Function to save price and trigger callback
  // Function to save price and refresh data
  const savePrice = async (item) => {
    if (!item?.ticket_id) return;

    try {
      const updatedPrice = editPrices[item.ticket_id];

      console.log("Updated price:", updatedPrice);

      const response = await updateTicketsPrice("", "", {
        ticket_id: item.ticket_id,
        new_price: updatedPrice,
      });

      console.log(response, "response");

      // Clear editing state first
      setEditingRow(null);
      setEditPrices((prevPrices) => {
        const newPrices = { ...prevPrices };
        delete newPrices[item.ticket_id];
        return newPrices;
      });

      // Refresh the entire dataset
      await getInsightsData();

      // Trigger callback function with updated data
      if (onPriceUpdate) {
        const updatedItem = {
          ...item,
          price: `$ ${updatedPrice}`,
        };
        onPriceUpdate(updatedItem, updatedPrice);
      }
    } catch (err) {
      console.error("Error updating price:", err);
      // You might want to show an error message to the user here
    }
  };

  // Function to cancel price edit
  const cancelEdit = () => {
    setEditingRow(null);
    setEditPrices({});
  };

  // Function to get benefits text from ticket_details
  const getBenefitsText = (ticketDetails) => {
    if (
      !ticketDetails ||
      !Array.isArray(ticketDetails) ||
      ticketDetails.length === 0
    ) {
      return "No benefits";
    }
    return (
      ticketDetails
        .slice(0, 2)
        .filter((detail) => detail?.name) // Filter out null/undefined names
        .map((detail) => detail.name)
        .join(", ") || "No benefits"
    );
  };

  // Callback function that can be passed as prop
  const onPriceUpdate = (updatedItem, newPrice) => {
    // This function will be called when price is updated
    console.log("Price updated for item:", updatedItem);
    console.log("New price:", newPrice);
  };

  const handleSelectChange = async (value, key) => {
    const updatedFilters = {
      ...filtersApplied,
      [key]: value,
    };
    getInsightsData(updatedFilters);
    setFiltersApplied(updatedFilters);
  };

  console.log(listValueData, "listValueDatalistValueDatalistValueData");

  return (
    <div className="p-4">
      <CustomModal show={show} onClose={() => onClose()}>
        <div className="bg-white w-4xl rounded-md">
          {/* Header with match details */}
          <div className="px-4 pt-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-[#323A70]">
              {matchDetails.title}
            </h2>
            <button
              onClick={() => onClose()}
              className="text-gray-500 cursor-pointer"
            >
              <XCircle />
            </button>
          </div>

          {/* Date and venue info */}
          <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <span className="text-[#323A70]">
                <Calendar className="w-4 h-4 text-[#00A3ED]" />
              </span>
              <span className="text-sm text-[#323A70]">
                {matchDetails.date}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#323A70]">
                <MapPin className="w-4 h-4 text-[#00A3ED]" />
              </span>
              <span className="text-sm ">{matchDetails.venue}</span>
            </div>
          </div>

          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <div className="flex">
              {/* {["Listings", "Sales"].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-2 text-sm cursor-pointer ${
                    selectedTab === tab
                      ? "border-b-2 border-[#130061] text-[#130061] font-medium"
                      : "text-[#323A70]"
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              ))} */}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[#323A70]">Filter by:</span>
              <div className="flex gap-2">
                <CustomSelect
                  selectedValue={filtersApplied?.ticket_category}
                  options={filterOptions}
                  onSelect={(e) => {
                    handleSelectChange(e, "ticket_category");
                  }}
                  placeholder="All Sections"
                  textSize="text-xs"
                  buttonPadding="px-2 py-1"
                  className="!w-[120px]"
                />
                {/* <CustomSelect
                  selectedValue={venues}
                  options={venueOptions}
                  onSelect={setVenues}
                  placeholder="All Venue Areas"
                  textSize="text-xs"
                  buttonPadding="px-2 py-1"
                /> */}
                <CustomSelect
                  selectedValue={filtersApplied?.quantity}
                  options={quantityOptions}
                  onSelect={(e) => {
                    handleSelectChange(e, "quantity");
                  }}
                  placeholder="All Quantities"
                  textSize="text-xs"
                  buttonPadding="px-2 py-1 !w-full"
                  className="!w-[120px]"
                />
              </div>
            </div>
          </div>

          <div className="p-4 max-h-[500px] overflow-auto">
            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-400 mb-4">
                  <X className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error
                </h3>
                <p className="text-gray-500 text-center max-w-sm mb-4">
                  {error}
                </p>
                <button
                  onClick={getInsightsData}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && <ShimmerLoader />}

            {/* Empty State */}
            {!isLoading && !error && listingsArray.length === 0 && (
              <EmptyState />
            )}

            {/* Data State */}
            {!isLoading && !error && listingsArray.length > 0 && (
              <>
                {/* Table header with flex layout */}
                <div className="flex border-b border-gray-200 bg-white">
                  <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-32">
                    Section/Block
                  </div>
                  <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-20">
                    Row
                  </div>
                  <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-24">
                    Quantity
                  </div>
                  <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-24">
                    Category
                  </div>
                  <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-28 flex items-center">
                    Payout Price <ChevronDown className="ml-1 w-4 h-4" />
                  </div>
                  <div className="p-3 text-[12px] font-medium text-[#7D82A4] flex-1">
                    Benefits & Restrictions
                  </div>
                </div>

                {/* Table rows with flex layout */}
                {listingsArray.map((item, index) => {
                  // Null check for item
                  if (!item) return null;

                  return (
                    <div
                      key={item.ticket_id || index}
                      className="flex border-b border-gray-200 hover:bg-gray-50 text-[#323A70]"
                    >
                      <div
                        className="p-3 text-[12px] w-32 truncate"
                        title={item.block_id}
                      >
                        {item.block_id || "-"}
                      </div>
                      <div className="p-3 text-[12px] w-20">-</div>
                      <div className="p-3 text-[12px] w-24">
                        {item.quantity || "-"}
                      </div>
                      <div
                        className="p-3 text-[12px] w-24 truncate"
                        title={item.ticket_category}
                      >
                        {item.ticket_category || "-"}
                      </div>
                      <div className="p-3 text-[12px] w-32">
                        {editingRow === item.ticket_id ? (
                          // Edit Mode - Show input field with save/cancel buttons
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">
                              {item?.currencyIcon}
                            </span>
                            <input
                              type="text"
                              value={`${editPrices[item.ticket_id]}` || ""}
                              onChange={(e) =>
                                handlePriceChange(
                                  item.ticket_id,
                                  e.target.value.replace(/[^0-9.]/g, "")
                                )
                              }
                              className="border border-blue-500 rounded w-16 px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0.00"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => savePrice(item)}
                                className="bg-green-600 hover:bg-green-700 text-white rounded p-1 transition-colors"
                                title="Save price"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="bg-gray-400 hover:bg-gray-500 text-white rounded p-1 transition-colors"
                                title="Cancel edit"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Display Mode - Show price with edit option if flag === 1
                          <div className="flex items-center gap-1 group">
                            <span className="text-gray-600">
                              {item?.currencyIcon}
                            </span>
                            <span
                              className={`${
                                item.flag === 1
                                  ? "cursor-pointer hover:text-blue-600 transition-colors"
                                  : "text-gray-700"
                              }`}
                              onClick={() =>
                                item.flag === 1 &&
                                startEditPrice(item.ticket_id, item.price)
                              }
                              title={
                                item.flag === 1
                                  ? "Click to edit price"
                                  : "Price not editable"
                              }
                            >
                              {item.price || "-"}
                            </span>
                            {item.flag === 1 && (
                              <button
                                onClick={() =>
                                  startEditPrice(item.ticket_id, item.price)
                                }
                                className="ml-2 opacity-0 group-hover:opacity-100 bg-blue-500 hover:bg-blue-600 text-white rounded p-1 transition-all duration-200"
                                title="Edit price"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-3 text-[12px] flex-1 flex items-center justify-between">
                        <span
                          className="break-words pr-2 max-w-[180px]"
                          title={getBenefitsText(item.ticket_details)}
                        >
                          {getBenefitsText(item.ticket_details)}
                        </span>
                        <Tooltip
                          content={getBenefitsText(item.ticket_details)}
                          position="top"
                        >
                          <button className="text-gray-400 flex-shrink-0">
                            <IconStore.document />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default ListingsMarketplace;
