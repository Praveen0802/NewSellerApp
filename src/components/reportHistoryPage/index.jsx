import { useState, useCallback, useRef } from "react";
import TabbedLayout from "../tabbedLayout";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import StickyDataTable from "../tradePage/components/stickyDataTable";
import Button from "../commonComponents/button";
import OrderInfo from "../orderInfoPopup";
import LogDetailsModal from "../ModalComponents/LogDetailsModal";
import { convertKeyToDisplayName } from "@/utils/helperFunctions";
import { downloadReports, reportEventSearch, reportHistory } from "@/utils/apiHandler/request";

const RportHistory = (props) => {
  const [filtersApplied, setFiltersApplied] = useState({
    page: 1,
  });

  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoader,setExportLoader] = useState(false);
  const [overViewData, setOverViewData] = useState(
    props?.response?.reportsOverviewData?.value
  );
  const [searchMatches, setSearchMatches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [staticReportsData, setStaticReportsData] = useState(
    props?.response?.reportHistoryData?.value
  );

  // Debounce timer ref
  const debounceTimer = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(async (query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(async () => {
      if (query.trim()) {
        try {
          const response = await reportEventSearch("", { query: query });
          setSearchMatches(response?.events || []);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchMatches([]);
          setShowSearchDropdown(false);
        }
      } else {
        setSearchMatches([]);
        setShowSearchDropdown(false);
      }
    }, 300); // 300ms debounce delay
  }, []);

  const searchMatchDropDown = () => {
    if (!showSearchDropdown || searchMatches.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
        {searchMatches.map((item, index) => (
          <div
            key={item.match_id || index}
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={() => {
              setSearchValue(item.match_name);
              setShowSearchDropdown(false);
              handleSearchMatchChange(item.match_name);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">
                  {item.match_name}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">
                    {item.tournament_name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <IconStore.calendar className="size-3" />
                    <span>
                      {new Date(item.match_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <IconStore.clock className="size-3" />
                    <span>{item.match_time}</span>
                  </div>
                </div>
                {item.stadium && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <IconStore.location className="size-3" />
                    <span>{item.stadium}</span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <IconStore.search className="size-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Define table headers based on your UI screenshot
  const headers = [
    { key: "order_id", label: "Order ID" },
    { key: "order_date", label: "Order Date" },
    { key: "order_value", label: "Order Value" },
    { key: "event", label: "Event" },
    { key: "venue", label: "Venue" },
    { key: "event_date", label: "Event Date" },
    { key: "ticket_details", label: "Ticket Details" },
    { key: "quantity", label: "Qty" },
    { key: "ticket_type", label: "Ticket Type" },
    { key: "order_status_label", label: "Order Status Label" },
    { key: "order_status", label: "Order Status" },
    { key: "payment_status", label: "Payment Status" },
  ];

  // Transform data for the table
  const transformedData = staticReportsData?.reports_history?.map((item) => ({
    ...item,
  }));

  // Create right sticky columns with action buttons
  const rightStickyColumns = staticReportsData?.reports_history?.map((item) => [
    {
      icon: (
        <IconStore.clock
          onClick={() => setShowLogDetailsModal(true)}
          className="size-5"
        />
      ),
      className: " cursor-pointer",
    },
    {
      icon: (
        <IconStore.eye
          onClick={() => setShowInfoPopup(true)}
          className="size-5"
        />
      ),
      className: " cursor-pointer",
    },
  ]);

  // Configuration for list items (stats cards)
  const listItemsConfig = {
    reports: Object.entries(overViewData).reduce(
      (acc, [key, value]) => {
        acc.push({ name: convertKeyToDisplayName(key), value });
        return acc;
      },
      [] // Keep the array, but use push() instead of assignment
    ),
  };

  const handleSearchMatchChange = async (value) => {
    const updatedFilters = {
      ...filtersApplied,
      searchMatch: value,
      page: 1, // Reset to first page on new search
    };
    
    try {
      const response = await reportHistory("", updatedFilters);
      setStaticReportsData(response);
      setFiltersApplied(updatedFilters);
    } catch (error) {
      console.error("Report history error:", error);
    }
  };

  // Configuration for filters
  const filterConfig = {
    reports: [
      {
        type: "text",
        name: "searchMatch",
        label: "Search event or order ID",
        value: searchValue,
        onchange: (value) => {
          setSearchValue(value);
          debouncedSearch(value);
        },
        showDropdown: true,
        dropDownComponent: searchMatchDropDown(),
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
        onFocus: () => {
          if (searchMatches.length > 0) {
            setShowSearchDropdown(true);
          }
        },
        onBlur: () => {
          // Delay hiding dropdown to allow click events
          setTimeout(() => setShowSearchDropdown(false), 200);
        },
      },
      {
        type: "select",
        name: "venue",
        label: "Venue",
        options: [
          { value: "all", label: "All Venues" },
          { value: "dubai_tennis", label: "Dubai Tennis Stadium" },
          { value: "saadiyat_island", label: "Saadiyat Island" },
          { value: "the_venue", label: "The Venue" },
          { value: "zayed_stadium", label: "Zayed Sports City Stadium" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "team_members",
        label: "Team Members",
        options: [
          { value: "1_selected", label: "1 selected" },
          { value: "amir_khan", label: "Amir Khan" },
          { value: "mark_johnson", label: "Mark Johnson" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "category",
        label: "Category",
        options: [
          { value: "all", label: "All Categories" },
          { value: "sports", label: "Sports" },
          { value: "concert", label: "Concert" },
          { value: "theatre", label: "Theatre" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "performer",
        label: "Performer",
        options: [
          { value: "all", label: "All Performers" },
          { value: "christina_aguilera", label: "Christina Aguilera" },
          { value: "coldplay", label: "Coldplay" },
          { value: "tennis_tournament", label: "Tennis Tournament" },
          { value: "ufc", label: "UFC" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
    ],
  };

  const handleScrollEnd = async () => {
    if (filtersApplied.page >= staticReportsData.meta.total_pages) return;
    setIsLoading(true);
    const updatedFilter = {
      ...filtersApplied,
      page: filtersApplied.page + 1,
    };
    
    try {
      const response = await reportHistory("", updatedFilter);
      setStaticReportsData({
        reports_history: [
          ...staticReportsData.reports_history,
          ...response.reports_history,
        ],
        meta: response.meta,
      });
      setFiltersApplied(updatedFilter);
    } catch (error) {
      console.error("Scroll end error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (
    filterKey,
    value,
    allFilters,
    currentTab
  ) => {
    const updatedFilters = {
      ...filtersApplied,
      [filterKey]: value,
      page: 1, // Reset to first page on filter change
    };
    
    // Handle search match separately with debounce
    if (filterKey === "searchMatch") {
      debouncedSearch(value);
    } else {
      // For other filters, apply immediately
      try {
        const response = await reportHistory("", updatedFilters);
        setStaticReportsData(response);
        setFiltersApplied(updatedFilters);
      } catch (error) {
        console.error("Filter change error:", error);
      }
    }
  };

  const handleExportCSV = async () => {
    setExportLoader(true);
    
    try {
      const response = await downloadReports("");
      // Check if response is successful
      if (response ) {
        // Create a blob from the response data
        const blob = new Blob([response], { 
          type: 'text/csv;charset=utf-8;' 
        });
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = url;
        
        // Set the filename (you can customize this)
        const filename = `export_${new Date().toISOString().slice(0, 10)}.csv`;
        link.download = filename;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        window.URL.revokeObjectURL(url);
        
        // Optional: Show success message
        console.log('CSV downloaded successfully');
        
      } else {
        console.error('No data received from server');
      }
      
    } catch (error) {
      console.error('Error downloading CSV:', error);
      // Handle error (show toast, alert, etc.)
    } finally {
      setExportLoader(false);
    }
  };

  // Cleanup debounce timer on unmount
  const cleanup = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TabbedLayout
        initialTab="reports"
        listItemsConfig={listItemsConfig}
        filterConfig={filterConfig}
        onTabChange={() => {}}
        onFilterChange={handleFilterChange}
        onCheckboxToggle={() => {}}
      />
      <LogDetailsModal
        show={showLogDetailsModal}
        onClose={() => setShowLogDetailsModal(false)}
      />
      <OrderInfo show={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      {/* StickyDataTable section */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold">Reports</h2>
            <Button
              onClick={handleExportCSV}
              loading={exportLoader}
              classNames={{
                label_: "text-xs",
                root: "flex gap-2 !px-2 items-center bg-[#F3F4F6] hover:bg-gray-200",
              }}
            >
              <IconStore.download className="size-4" />
              <span className="text-xs">Export CSV</span>
            </Button>
          </div>

          {/* StickyDataTable */}
          <div className="max-h-[calc(100vh-370px)] overflow-auto">
            <StickyDataTable
              headers={headers}
              data={transformedData}
              rightStickyColumns={rightStickyColumns}
              loading={isLoading}
              onScrollEnd={() => {
                handleScrollEnd();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RportHistory;