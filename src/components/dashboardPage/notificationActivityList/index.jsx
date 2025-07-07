import { formatDate, formatDateValue } from "@/utils/helperFunctions";
import React, { useState, useEffect } from "react";

const NotificationActivityList = ({ 
  notificationsList, 
  activities, 
  handleScrollEnd, 
  loader 
}) => {
  const heading = [
    { name: "Notifications", key: "notifications" },
    { name: "Activity", key: "activity" },
  ];

  const [activeTab, setActiveTab] = useState("notifications");

  const displayedValues =
    activeTab === "notifications"
      ? notificationsList?.notification_list?.map((item) => ({
          id: item?.id,
          name: item?.description,
          time: formatDateValue(item?.created_at),
        }))
      : activities?.activity_list?.map((item) => ({
          id: item?.id,
          name: item?.description,
          time: formatDateValue(item?.created_at),
        }));

  // Handle scroll to detect when user reaches bottom
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Check if user has scrolled to the bottom (with some tolerance)
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      // Call handleScrollEnd for the active tab
      if (activeTab === "notifications") {
        handleScrollEnd("notifications");
      } else if (activeTab === "activity") {
        handleScrollEnd("activity");
      }
    }
  };

  return (
    <div className="border-[1px] border-[#eaeaf1] rounded-md bg-white">
      <div className="flex gap-4 sm:gap-[30px] items-center px-4 pt-4 border-b-[1px] border-[#eaeaf1]">
        {heading.map((item, index) => (
          <p
            key={index}
            onClick={() => {
              setActiveTab(item.key);
            }}
            className={`${
              item?.key == activeTab
                ? "text-[#343432] font-semibold border-b-[1px] border-[#0137D5]"
                : "text-[#7D82A4] font-normal"
            } text-[14px] sm:text-[16px] pb-4 cursor-pointer`}
          >
            {item.name}
          </p>
        ))}
      </div>
      <div 
        className="max-h-[300px] overflow-auto"
        onScroll={handleScroll}
      >
        {displayedValues?.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-[10px] border-b-[1px] border-[#F0F0F5]"
          >
            <p className="text-[#343432] text-[13px] font-normal mb-1 sm:mb-0 sm:mr-2 sm:flex-1">
              {item?.name}
            </p>
            <p className="text-[#03BA8A] text-[13px] font-normal whitespace-nowrap">
              {item?.time}
            </p>
          </div>
        ))}
        
        {/* Loading indicator for pagination */}
        {(loader?.notifications && activeTab === "notifications") || 
         (loader?.activity && activeTab === "activity") ? (
          <div className="flex justify-center py-4">
            <div className="text-[#7D82A4] text-[13px]">Loading...</div>
          </div>
        ) : null}
        
        {/* No more data indicator */}
        {activeTab === "notifications" && 
         notificationsList?.meta?.current_page === notificationsList?.meta?.last_page && 
         notificationsList?.meta?.last_page > 1 && (
          <div className="flex justify-center py-4">
            <div className="text-[#7D82A4] text-[13px]">No more notifications</div>
          </div>
        )}
        
        {activeTab === "activity" && 
         activities?.meta?.current_page === activities?.meta?.last_page && 
         activities?.meta?.last_page > 1 && (
          <div className="flex justify-center py-4">
            <div className="text-[#7D82A4] text-[13px]">No more activities</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationActivityList;