import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import FormFields from "../formFieldsComponent";
import { useDispatch } from "react-redux";

// Individual listing row component
const ListingRow = ({ listing, isExpanded, onToggle }) => {
  const [hoveredTicketIndex, setHoveredTicketIndex] = useState(null);

  const handleTicketMouseEnter = (index) => {
    setHoveredTicketIndex(index);
  };

  const handleTicketMouseLeave = () => {
    setHoveredTicketIndex(null);
  };

  return (
    <div className="border-b border-gray-200">
      {/* Main listing header - Dark purple background like in image */}
      <div 
        className="bg-[#2D1B69] text-white p-4 cursor-pointer hover:bg-[#3D2B79] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Event name and date */}
            <div className="flex-1">
              <div className="text-sm font-medium">
                {listing.eventName}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-300 mt-1">
                <span>📅 {listing.eventDate}</span>
                <span>⏰ {listing.time}</span>
                <span>📍 {listing.venue}</span>
              </div>
            </div>

            {/* Stats section */}
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-blue-300">{listing.totalListings}</span>
                <span>📊</span>
                <span className="text-blue-300">{listing.soldTickets}</span>
                <span>🎫</span>
                <span className="text-orange-300">{listing.availableTickets}</span>
              </div>
              <button className="text-blue-300 hover:text-blue-200 underline">
                Market Insights
              </button>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="bg-white">
          {/* Table headers */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600">
              <div className="col-span-1 flex items-center">
                <input type="checkbox" className="rounded" />
              </div>
              <div className="col-span-1">Listing ID</div>
              <div className="col-span-1">Ticket type</div>
              <div className="col-span-1">Quantity</div>
              <div className="col-span-1">Sold</div>
              <div className="col-span-1">Split type</div>
              <div className="col-span-1">Category</div>
              <div className="col-span-1">Section/block</div>
              <div className="col-span-1">Row</div>
              <div className="col-span-3 text-center">Actions</div>
            </div>
          </div>

          {/* Table rows */}
          <div className="max-h-80 overflow-y-auto">
            {listing.tickets?.map((ticket, index) => {
              const isHovered = hoveredTicketIndex === index;
              
              return (
                <div
                  key={ticket.id || index}
                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  onMouseEnter={() => handleTicketMouseEnter(index)}
                  onMouseLeave={handleTicketMouseLeave}
                >
                  <div className="grid grid-cols-12 gap-2 items-center text-xs">
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input type="checkbox" className="rounded" />
                    </div>
                    
                    {/* Listing ID */}
                    <div className="col-span-1 text-gray-900 font-medium">
                      {ticket.listingId}
                    </div>
                    
                    {/* Ticket Type */}
                    <div className="col-span-1">
                      {isHovered ? (
                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="external_transfer">External Transfer</option>
                          <option value="mobile_transfer">Mobile Transfer</option>
                          <option value="paper_ticket">Paper Ticket</option>
                        </select>
                      ) : (
                        <span className="text-gray-600">{ticket.ticketType}</span>
                      )}
                    </div>
                    
                    {/* Quantity */}
                    <div className="col-span-1 text-gray-900 font-medium">
                      {ticket.quantity}
                    </div>
                    
                    {/* Sold */}
                    <div className="col-span-1 text-gray-600">
                      {ticket.sold}
                    </div>
                    
                    {/* Split Type */}
                    <div className="col-span-1">
                      {isHovered ? (
                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="none">None</option>
                          <option value="split">Split</option>
                        </select>
                      ) : (
                        <span className="text-gray-600">{ticket.splitType}</span>
                      )}
                    </div>
                    
                    {/* Category */}
                    <div className="col-span-1">
                      {isHovered ? (
                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="category1">Category 1</option>
                          <option value="category2">Category 2</option>
                          <option value="category3">Category 3</option>
                        </select>
                      ) : (
                        <span className="text-gray-600">{ticket.category}</span>
                      )}
                    </div>
                    
                    {/* Section/Block */}
                    <div className="col-span-1">
                      {isHovered ? (
                        <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value={ticket.section}>{ticket.section}</option>
                        </select>
                      ) : (
                        <span className="text-gray-600">{ticket.section}</span>
                      )}
                    </div>
                    
                    {/* Row */}
                    <div className="col-span-1">
                      {isHovered ? (
                        <input 
                          type="text" 
                          value={ticket.row}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-600">{ticket.row}</span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-blue-100 rounded transition-colors" title="View">
                          <span className="text-blue-600">👁️</span>
                        </button>
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-purple-100 rounded transition-colors" title="Mobile">
                          <span className="text-purple-600">📱</span>
                        </button>
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors" title="Document">
                          <span className="text-gray-600">📄</span>
                        </button>
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-pink-100 rounded transition-colors" title="Design">
                          <span className="text-pink-600">🎨</span>
                        </button>
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-green-100 rounded transition-colors" title="Analytics">
                          <span className="text-green-600">📊</span>
                        </button>
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-green-100 rounded transition-colors" title="Approve">
                          <span className="text-green-600">✅</span>
                        </button>
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-blue-100 rounded transition-colors" title="Refresh">
                          <span className="text-blue-600">🔄</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Main BulkTicketsListing component
const BulkTicketsListing = ({ events }) => {
  const [expandedListings, setExpandedListings] = useState(new Set());

  // Transform the flat events data into grouped listings with tickets
  const transformedListings = events.reduce((acc, event, index) => {
    const key = `${event.event_name}-${event.event_date_time}-${event.venue_name}`;
    
    if (!acc[key]) {
      acc[key] = {
        id: key,
        eventName: event.event_name,
        eventDate: event.event_date_time?.split(',')[0], // Extract date part
        time: event.event_date_time?.split(',')[2]?.trim(), // Extract time part
        venue: event.venue_name,
        tournament: event.tournament,
        priceRange: event.price_range,
        ticketsAvailable: event.ticket_available,
        totalListings: 8,
        soldTickets: 8,
        availableTickets: 40,
        tickets: []
      };
    }

    // Add ticket data (mock data for demonstration)
    acc[key].tickets.push({
      id: `ticket-${index}`,
      listingId: `${3014729873 + index}`,
      ticketType: "External Transfer",
      quantity: 5,
      sold: 0,
      splitType: "None",
      category: `Category ${Math.floor(Math.random() * 3) + 1}`,
      section: `Category ${Math.floor(Math.random() * 3) + 1}`,
      row: `R${Math.floor(Math.random() * 20) + 1}`
    });

    return acc;
  }, {});

  const listings = Object.values(transformedListings);

  const toggleExpanded = (listingId) => {
    const newExpanded = new Set(expandedListings);
    if (newExpanded.has(listingId)) {
      newExpanded.delete(listingId);
    } else {
      newExpanded.add(listingId);
    }
    setExpandedListings(newExpanded);
  };

  return (
    <div className="bg-white rounded">
      {listings.map((listing, index) => (
        <ListingRow
          key={listing.id}
          listing={listing}
          isExpanded={expandedListings.has(listing.id)}
          onToggle={() => toggleExpanded(listing.id)}
        />
      ))}
    </div>
  );
};

// Updated TicketsPage component
const TicketsPage = () => {
  const dispatch = useDispatch();
  const handleOpenAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: true,
      })
    );
  };

  // Filter form fields using your existing FormFields structure
  const filterFields = [
    {
      type: "text",
      name: "searchMatch",
      label: "Search event or listing ID",
      className: "!py-[7px] !px-[12px] !text-[#323A70] !text-sm",
      parentClassName: "flex-1"
    },
    {
      type: "select",
      name: "ticketType",
      label: "Ticket type",
      options: [
        { value: "", label: "Ticket type" },
        { value: "external_transfer", label: "External Transfer" },
        { value: "mobile_transfer", label: "Mobile Transfer" }
      ],
      className: "!py-[7px] !px-[12px] !text-sm w-full"
    },
    {
      type: "date",
      name: "eventDate",
      label: "Event date",
      className: "!py-[7px] !px-[12px] !text-sm",
      singleDateMode: true
    },
    {
      type: "select",
      name: "ticketStatus",
      label: "Ticket status",
      options: [
        { value: "", label: "1 selected" },
        { value: "available", label: "Available" },
        { value: "sold", label: "Sold" }
      ],
      className: "!py-[7px] !px-[12px] !text-sm w-full"
    },
    {
      type: "select",
      name: "listingStatus",
      label: "Listing status",
      options: [
        { value: "", label: "Listing status" }
      ],
      className: "!py-[7px] !px-[12px] !text-sm w-full"
    },
    {
      type: "select",
      name: "listingQuality",
      label: "Listing quality",
      options: [
        { value: "", label: "Listing quality" }
      ],
      className: "!py-[7px] !px-[12px] !text-sm w-full"
    }
  ];

  // Sample event data that matches the UI
  const eventListViews = [
    {
      event_name: "Formula 1 Abu Dhabi Grand Prix 2025 - 3-Day Pass",
      event_date_time: "Fri, 05 Dec 2025, 09:59",
      tournament: "Formula 1",
      venue_name: "Yas Marina Circuit, Abu Dhabi, United Arab Emirates",
      price_range: "$200-$800",
      ticket_available: "290",
    },
    {
      event_name: "Fifa World Cup Match 1 - Group A Mexico",
      event_date_time: "Thu, 11 Jun 2026, 14:00",
      tournament: "FIFA World Cup",
      venue_name: "Estadio Azteca, Ciudad de México, Mexico",
      price_range: "$150-$600",
      ticket_available: "40",
    },
    {
      event_name: "Fifa World Cup Match 2 - Group A",
      event_date_time: "Thu, 11 Jun 2026, 15:00",
      tournament: "FIFA World Cup",
      venue_name: "Estadio Guadalajara, Zapopan, Mexico",
      price_range: "$120-$500",
      ticket_available: "4",
    },
    {
      event_name: "Fifa World Cup Match 3 - Group B Toronto Stadium",
      event_date_time: "Fri, 12 Jun 2026, 15:00",
      tournament: "FIFA World Cup",
      venue_name: "Toronto Stadium, Toronto, Canada",
      price_range: "$180-$700",
      ticket_available: "4",
    },
    {
      event_name: "Fifa World Cup Match 5 - Group C Boston Stadium",
      event_date_time: "Sat, 13 Jun 2026, 15:00",
      tournament: "FIFA World Cup",
      venue_name: "Boston Stadium, Massachusetts, United States",
      price_range: "$160-$650",
      ticket_available: "4",
    }
  ];

  return (
    <div className="bg-[#F5F7FA] w-full h-full">
      {/* Top bar with filter and add deposit button */}
      <div className="flex bg-white items-center py-2 md:py-2 justify-between px-4 md:px-6 border-b border-[#eaeaf1]">
        <p className="text-sm text-gray-600">Filter</p>
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
          onClick={() => {
            handleOpenAddWalletPopup();
          }}
        >
          + Add Deposit
        </button>
      </div>
      
      {/* Filter section */}
      <div className="bg-white border-b border-[#DADBE5] p-4">
        <div className="flex gap-3 items-center">
          <FormFields formFields={filterFields} />
        </div>
        
        {/* Clear filters section */}
        <div className="flex items-center gap-2 mt-3">
          <button className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800">
            <span className="w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">×</span>
            Clear filters
          </button>
          <span className="text-xs text-gray-500">Amir Khan</span>
          <button className="text-xs text-gray-400 hover:text-gray-600">×</button>
        </div>
      </div>
      
      {/* Events count and view controls */}
      <div className="bg-white border-b border-[#DADBE5] flex items-center justify-between px-4 py-3">
        <p className="text-sm text-[#323A70] font-medium">
          {eventListViews.length} Events
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>View</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-xs">
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="p-6">
        <BulkTicketsListing events={eventListViews} />
      </div>
    </div>
  );
};

export default TicketsPage;