import React, { useEffect, useState } from "react";
import { Calendar, Check, ChevronDown, MapPin, X, XCircle } from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import CustomModal from "@/components/commonComponents/customModal";
import CustomSelect from "@/components/commonComponents/customSelect";
import {
  getmarketingInsights,
  updateTicketsPrice,
} from "@/utils/apiHandler/request";

// Shimmer Loader Component
const ShimmerLoader = () => {
  return (
    <div className="animate-pulse w-4xl">
      {/* Header shimmer */}
      <div className="grid grid-cols-6 border-b border-gray-200 bg-white">
        <div className="p-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="p-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="p-3">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="p-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="p-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="p-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
      
      {/* Row shimmers */}
      {[...Array(6)].map((_, index) => (
        <div key={index} className="grid grid-cols-6 border-b border-gray-200">
          <div className="p-3">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="p-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="p-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="p-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="p-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="p-3">
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
      <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
      <p className="text-gray-500 text-center max-w-sm">
        There are currently no ticket listings available for this match.
      </p>
    </div>
  );
};

const ListingsMarketplace = ({ show, onClose, matchInfo }) => {
  const [listValueData, setListvalueData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getInsightsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await getmarketingInsights("", {
        match_id: matchInfo?.match_id,
      });
      
      console.log(res, "res");
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

  const matchDetails = {
    title: matchInfo?.match_name || "Match Details",
    date: matchInfo?.match_date || "Date TBD",
    venue: `${matchInfo?.stadium_name || "Stadium"}, ${
      matchInfo?.city_name || "City"
    }, ${matchInfo?.country_name || "Country"}`,
  };

  const filterOptions = [
    { value: "all", label: "All Sections" },
    { value: "vip", label: "VIP" },
    { value: "standard", label: "Standard" },
  ];

  const venueOptions = [
    { value: "all", label: "All Venue Areas" },
    { value: "home", label: "Home" },
    { value: "away", label: "Away" },
  ];

  const quantityOptions = [
    { value: "all", label: "All Quantities" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "4", label: "4" },
  ];

  // Function to handle price edit initialization
  const startEditPrice = (ticketId, currentPrice) => {
    setEditingRow(ticketId);
    setEditPrices({
      ...editPrices,
      [ticketId]: currentPrice?.replace(/[^0-9.]/g, "") || "", // Safe replace with null check
    });
  };

  // Function to handle price input change
  const handlePriceChange = (ticketId, value) => {
    setEditPrices({
      ...editPrices,
      [ticketId]: value,
    });
  };

  // Function to save price and trigger callback
  const savePrice = async (item) => {
    if (!item?.ticket_id) return;
    
    try {
      const updatedPrice = editPrices[item.ticket_id];
      const updatedItem = {
        ...item,
        price: `$ ${updatedPrice}`,
      };

      // Trigger callback function with updated data
      if (onPriceUpdate) {
        onPriceUpdate(updatedItem, updatedPrice);
      }

      console.log("Updated item:", updatedItem);
      console.log("Updated price:", updatedPrice);
      
      const response = await updateTicketsPrice("", "", {
        ticket_id: item.ticket_id,
        new_price: updatedPrice,
      });
      
      console.log(response, "response");
      setEditingRow(null);
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
    if (!ticketDetails || !Array.isArray(ticketDetails) || ticketDetails.length === 0) {
      return "No benefits";
    }
    return ticketDetails
      .slice(0, 2)
      .filter(detail => detail?.name) // Filter out null/undefined names
      .map((detail) => detail.name)
      .join(", ") || "No benefits";
  };

  // Callback function that can be passed as prop
  const onPriceUpdate = (updatedItem, newPrice) => {
    // This function will be called when price is updated
    console.log("Price updated for item:", updatedItem);
    console.log("New price:", newPrice);
  };

  return (
    <div className="p-4">
      <CustomModal show={show} onClose={() => onClose()}>
        <div className="bg-white w-full max-w-4xl rounded-md">
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

          <div className="p-4 max-h-[500px] overflow-auto">
            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-400 mb-4">
                  <X className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-gray-500 text-center max-w-sm mb-4">{error}</p>
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
            {!isLoading && !error && listingsArray.length === 0 && <EmptyState />}

            {/* Data State */}
            {!isLoading && !error && listingsArray.length > 0 && (
              <>
                {/* Table header */}
                <div className="grid grid-cols-6 border-b border-gray-200 bg-white">
                  <div className="p-3 text-sm font-medium text-[#323A70]">
                    Section/Block
                  </div>
                  <div className="p-3 text-sm font-medium text-[#323A70]">Row</div>
                  <div className="p-3 text-sm font-medium text-[#323A70]">
                    Quantity
                  </div>
                  <div className="p-3 text-sm font-medium text-[#323A70]">
                    Category
                  </div>
                  <div className="p-3 text-sm font-medium text-[#323A70] flex items-center">
                    Payout Price <ChevronDown className="ml-1 w-4 h-4" />
                  </div>
                  <div className="p-3 text-sm font-medium text-[#323A70]">
                    Benefits & Restrictions
                  </div>
                </div>

                {/* Table rows - Loop through data */}
                {listingsArray.map((item, index) => {
                  // Null check for item
                  if (!item) return null;
                  
                  return (
                    <div
                      key={item.ticket_id || index}
                      className={`grid grid-cols-6 border-b border-gray-200 hover:bg-gray-50 ${
                        item.flag === 1 ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="p-3 text-sm">{item.block_id || "-"}</div>
                      <div className="p-3 text-sm">-</div>
                      <div className="p-3 text-sm">{item.quantity || "-"}</div>
                      <div className="p-3 text-sm">{item.ticket_category || "-"}</div>
                      <div className="p-3 text-sm">
                        {editingRow === item.ticket_id ? (
                          <div className="flex items-center">
                            <span className="mr-1">$</span>
                            <input
                              type="text"
                              value={editPrices[item.ticket_id] || ""}
                              onChange={(e) =>
                                handlePriceChange(item.ticket_id, e.target.value)
                              }
                              className="border border-blue-500 rounded w-16 px-2 py-1 text-sm"
                            />
                            <div className="flex ml-2">
                              <button
                                onClick={() => savePrice(item)}
                                className="bg-blue-600 text-white rounded p-1 mr-1"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="bg-gray-200 text-gray-700 rounded p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span
                              className={item.flag === 1 ? "cursor-pointer" : ""}
                              onClick={() =>
                                item.flag === 1 &&
                                startEditPrice(item.ticket_id, item.price)
                              }
                            >
                              {item.price || "-"}
                            </span>
                            {item.flag === 1 && (
                              <button
                                onClick={() => savePrice(item)}
                                className="ml-2 bg-green-600 text-white rounded p-1"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-sm flex items-center justify-between">
                        <span>{getBenefitsText(item.ticket_details)}</span>
                        <button className="text-gray-400">
                          <IconStore.document />
                        </button>
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