import CustomSelect from "@/components/commonComponents/customSelect";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const ViewContainer = ({
  title,
  options,
  listValues,
  onChange,
  selectedOption,
  displayValues,
  loader,
  handleScrollEnd,
  keyValue,
  meta, // Add meta prop to get pagination info
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);

  console.log("displayValues", displayValues);

  // Update hasMore when meta changes
  useEffect(() => {
    if (meta) {
      setHasMore(meta.current_page < meta.last_page);
    }
  }, [meta]);

  const handleScroll = async () => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isNearBottom && handleScrollEnd) {
      setIsLoadingMore(true);
      try {
        await handleScrollEnd(keyValue);
      } catch (error) {
        console.error("Error loading more data:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // Shimmer component for loading state
  const ShimmerItem = () => (
    <div className="flex items-center p-2 border-b border-[#eaeaf1] justify-between animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  );

  return (
    <div className="bg-white flex flex-col gap-3 md:gap-4 w-full rounded-md p-3 md:p-5">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="text-[#343432] text-sm md:text-base whitespace-nowrap">
          {title}
        </p>
        <CustomSelect
          selectedValue={selectedOption}
          options={options}
          onSelect={onChange}
          textSize="text-xs md:text-sm w-[200px]"
          buttonPadding="px-2 md:px-3 py-1 md:py-1.5"
          dropdownItemPadding="py-1 pl-2 pr-4 md:pr-6"
        />
      </div>
      
      <div className="border border-[#eaeaf1] rounded-md">
        <div className="grid md:grid-cols-2 p-3 gap-3 md:p-4">
          {listValues?.map((listItem, listIndex) => {
            return (
              <div
                className="flex items-center border-1 p-2 rounded-md border-[#eaeaf1] justify-between"
                key={listIndex}
              >
                <div className="flex gap-2 items-center">
                  <div className="bg-[#F2F5FD] p-1.5 md:p-2 rounded-md">
                    <Image
                      src={listItem?.image}
                      width={16}
                      height={16}
                      alt="image"
                      className="w-4 h-4"
                    />
                  </div>
                  <p className="text-[#343432] text-xs md:text-sm">
                    {listItem?.text}
                  </p>
                </div>
                <p className="text-[#343432] text-sm md:text-base font-semibold">
                  {listItem?.count}
                </p>
              </div>
            );
          })}
        </div>
        
        {displayValues?.length > 0 ? (
          <div className="border-t border-[#eaeaf1]">
            <div className="flex items-center p-2 border-b border-[#eaeaf1] justify-between bg-gray-50">
              <p className="text-gray-400 font-medium text-xs">
                Event Description
              </p>
              <p className="text-gray-400 font-medium text-xs">Revenue</p>
            </div>
            
            <div
              ref={scrollContainerRef}
              className="max-h-[150px] overflow-auto"
              onScroll={handleScroll}
            >
              {displayValues?.map((listItem, listIndex) => {
                return (
                  <div
                    className="flex items-center p-2 border-b border-[#eaeaf1] justify-between"
                    key={`${listItem?.matchId}-${listItem?.bookingId}-${listIndex}`}
                  >
                    <p className="text-[#343432] text-xs">
                      {listItem?.displayName}
                    </p>
                    <p className="text-[#343432] text-xs font-medium">
                      {listItem?.count}
                    </p>
                  </div>
                );
              })}
              
              {/* Loading shimmer for pagination */}
              {isLoadingMore && (
                <div className="border-t border-[#eaeaf1]">
                  {[...Array(3)].map((_, index) => (
                    <ShimmerItem key={`shimmer-${index}`} />
                  ))}
                </div>
              )}
              
              {/* End of data indicator */}
              {!hasMore && displayValues?.length > 0 && (
                <div className="p-3 text-center">
                  <p className="text-gray-400 text-xs">No more data to load</p>
                </div>
              )}
            </div>
          </div>
        ) : loader ? (
          // Initial loading state
          <div className="border-t border-[#eaeaf1]">
            <div className="flex items-center p-2 border-b border-[#eaeaf1] justify-between bg-gray-50">
              <p className="text-gray-400 font-medium text-xs">
                Event Description
              </p>
              <p className="text-gray-400 font-medium text-xs">Revenue</p>
            </div>
            <div className="max-h-[150px] overflow-auto">
              {[...Array(5)].map((_, index) => (
                <ShimmerItem key={`initial-shimmer-${index}`} />
              ))}
            </div>
          </div>
        ) : (
          <div className="border-t max-h-[150px] overflow-auto p-4 h-full border-[#eaeaf1]">
            <p className="text-base text-[#343432] font-normal text-center">
              No Data Found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewContainer;