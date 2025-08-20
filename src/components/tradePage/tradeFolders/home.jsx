import React, { useState, useEffect } from "react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import EventListView from "./eventListView";
import {
  desiredFormatDate,
  formatDate,
  formatDateTime,
} from "@/utils/helperFunctions";
import { fetchRecentlyViewedList } from "@/utils/apiHandler/request";
import { useRouter } from "next/router";

const TradeHome = (props) => {
  console.log("TradeHome props", props);
  const { profile, response = {}, showEventSearch } = props;
  const {
    hotEvents = {},
    lastMinuteEvents = [],
    recentlyViewedEvents,
  } = response;

  // State to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Check if on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const constructViewDataType = (array) => {
    return (
      Array.isArray(array) &&
      array?.map((item) => {
        return {
          id: item?.m_id,
          name: item?.match_name,
          date: desiredFormatDate(item?.match_date),
          time: item?.match_time,
          listing: item?.listings,
          league: item?.tournament_name || item?.othereventCategory_name,
          availableTickets: item?.available_tickets,
          priceFrom: item?.price_start_from_with_currency,
        };
      })
    );
  };

  const sections = [
    {
      name: "Recently Viewed Events",
      icon: "eye",
      events: constructViewDataType(recentlyViewedEvents?.value),
    },
    {
      name: "Hot Events",
      icon: "flame",
      events: constructViewDataType(hotEvents?.value?.top_matchs),
    },
    {
      name: "Last-minute Events",
      icon: "clock",
      events: constructViewDataType(lastMinuteEvents?.value),
    },
  ];

  const [expandedSections, setExpandedSections] = useState(() => {
    // On mobile, only expand the first section by default
    // On desktop, expand all sections
    return sections.map((_, index) => (isMobile ? index === 0 : true));
  });

  // Update expanded sections when screen size changes
  useEffect(() => {
    setExpandedSections(
      sections.map((_, index) => (isMobile ? index === 0 : true))
    );
  }, [isMobile, sections.length]);

  const toggleSection = (index) => {
    setExpandedSections((currentExpandedSections) => {
      const newExpandedSections = [...currentExpandedSections];
      newExpandedSections[index] = !newExpandedSections[index];
      return newExpandedSections;
    });
  };

  const router = useRouter();

  const handleEventClick = async (event) => {
    const { id } = event;
    await fetchRecentlyViewedList("", "POST", "", {
      m_id: id,
    });
    router.push(`/trade/inventory/${id}`);
  };

  return (
    <div className="w-full bg-gray-100 md:p-4 p-2 h-full">
      {isMobile && (
        <div className="flex overflow-x-auto pb-2 mb-2 gap-2 sticky top-0 bg-gray-100 z-10 -mx-2 px-2 pt-2">
          {sections.map((section, index) => {
            if (section?.events?.length == 0) {
              return null;
            }
            return (
              <div
                key={`tab-${index}`}
                onClick={() => toggleSection(index)}
                className={`flex-shrink-0 py-2 px-3 rounded-full flex items-center gap-1 cursor-pointer ${
                  expandedSections[index]
                    ? "bg-[#343432] text-white"
                    : "bg-white text-[#130061] border border-[#130061]"
                }`}
              >
                <IconStore.eye className="size-4" />
                <span className="text-xs whitespace-nowrap font-medium">
                  {section.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {sections.map((section, index) => {
          if (section?.events?.length == 0) {
            return null;
          }
          return (
            <div
              key={index}
              className={`transition-all duration-300 ease-in-out ${
                isMobile ? "mb-2" : "mb-4"
              }`}
            >
              {/* Section header */}
              <div
                className={`flex items-center justify-between bg-[#343432] text-white px-4 py-[14px] ${
                  expandedSections[index] ? "rounded-t-[6px]" : "rounded-[6px]"
                } cursor-pointer`}
                onClick={() => toggleSection(index)}
              >
                <div className="flex gap-3 items-center">
                  <IconStore.eye className="size-4" />
                  <span className="text-[14px] font-medium">
                    {section.name}
                  </span>
                </div>
                <div className="flex items-center bg-[#FFFFFF26] p-1 rounded-full">
                  {expandedSections[index] ? (
                    <IconStore.chevronUp className="size-4" />
                  ) : (
                    <IconStore.chevronDown className="size-4" />
                  )}
                </div>
              </div>

              {/* Section content */}
              <div
                className={`bg-white rounded-b shadow overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections[index]
                    ? "max-h-[500px] md:max-h-[400px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="overflow-y-auto max-h-[500px] md:max-h-[400px]">
                  {section?.events?.length > 0 ? (
                    section.events.map((event, eventIndex) => (
                      <EventListView
                        key={eventIndex}
                        showEventSearch={showEventSearch}
                        event={event}
                        onClick={() => handleEventClick(event)}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 flex flex-col items-center">
                      <p>No events available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradeHome;
