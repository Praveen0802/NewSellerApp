/**
 * Complete utility functions for constructing filter options and headers from filter objects
 * Specifically designed for the Tickets Page requirements
 */

/**
 * Constructs headers specifically for TicketsPage using listingHistory data
 * @param {Array} listingHistoryData - Array of listing history objects with filters
 * @returns {Array} Array of header configurations
 */
export const constructTicketsPageHeadersFromData = (listingHistoryData) => {
    if (!listingHistoryData || !Array.isArray(listingHistoryData) || listingHistoryData.length === 0) {
      return getDefaultTicketsPageHeaders();
    }
  
    // Get all unique filters from all matches
    const allFilters = listingHistoryData.map(match => match.filter).filter(Boolean);
    
    // Define the complete structure based on your requirements
    const headers = [
      { 
        key: "match_name", 
        label: "Match Name", 
        editable: false,
        type: "text"
      },
      { 
        key: "venue", 
        label: "Venue", 
        editable: false,
        type: "text"
      },
      { 
        key: "tournament", 
        label: "Tournament", 
        editable: false,
        type: "text"
      },
      { 
        key: "match_date", 
        label: "Match Date", 
        editable: false,
        type: "text"
      },
      { 
        key: "match_time", 
        label: "Match Time", 
        editable: false,
        type: "text"
      },
      {
        key: "ticket_type_id",
        label: "Ticket Type",
        editable: true,
        type: "select",
        options: [],
        mandatory: true
      },
      {
        key: "quantity",
        label: "Quantity",
        editable: true,
        type: "select",
        options: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
        ],
        mandatory: true
      },
      {
        key: "split_type_id",
        label: "Split Type",
        editable: true,
        type: "select",
        options: []
      },
      {
        key: "home_town",
        label: "Fan Area",
        editable: true,
        type: "select",
        options: []
      },
      {
        key: "ticket_category_id",
        label: "Seating Category",
        editable: true,
        type: "select",
        increasedWidth: "!w-[180px] !min-w-[180px]",
        options: [],
        mandatory: true
      },
      {
        key: "block",
        label: "Section/Block",
        editable: true,
        type: "text"
      },
      {
        key: "row",
        label: "Row",
        editable: true,
        type: "text"
      },
      {
        key: "first_seat",
        label: "First Seat",
        editable: true,
        type: "text"
      },
      {
        key: "face_value",
        label: "Face Value",
        editable: true,
        type: "text"
      },
      {
        key: "price",
        label: "Price",
        editable: true,
        type: "text",
        mandatory: true
      },
      {
        key: "ship_date",
        label: "Date to Ship",
        editable: true,
        type: "date",
        minDate: new Date().toISOString().split("T")[0]
      },
      {
        key: "tickets_in_hand",
        label: "Tickets In Hand",
        editable: true,
        type: "checkbox",
        hideFromTable: true
      },
      {
        key: "status",
        label: "Status",
        editable: false,
        type: "text"
      },
      {
        key: "sell_date",
        label: "Listed Date",
        editable: false,
        type: "text"
      }
    ];
  
    // Populate options for select fields from filters
    if (allFilters.length > 0) {
      const optionsMap = extractOptionsFromFilters(allFilters);
      
      // Update headers with extracted options
      headers.forEach(header => {
        switch (header.key) {
          case "ticket_type_id":
            header.options = optionsMap.ticketTypes;
            break;
          case "split_type_id":
            header.options = optionsMap.splitTypes;
            break;
          case "home_town":
            header.options = optionsMap.homeTowns;
            break;
          case "ticket_category_id":
            header.options = optionsMap.ticketCategories;
            break;
        }
      });
    }
  
    return headers;
  };
  
  /**
   * Extracts and consolidates options from all match filters
   * @param {Array} allFilters - Array of filter objects from all matches
   * @returns {Object} Consolidated options object
   */
  const extractOptionsFromFilters = (allFilters) => {
    const optionsMap = {
      ticketTypes: [],
      splitTypes: [],
      homeTowns: [],
      ticketCategories: [],
      notes: [],
      restrictions: [],
      splitDetails: []
    };
  
    // Use Maps to avoid duplicates
    const ticketTypesMap = new Map();
    const splitTypesMap = new Map();
    const homeTownsMap = new Map();
    const ticketCategoriesMap = new Map();
    const notesMap = new Map();
    const restrictionsMap = new Map();
    const splitDetailsMap = new Map();
  
    allFilters.forEach(filter => {
      if (!filter) return;
  
      // Extract Ticket Types
      if (filter.ticket_types && Array.isArray(filter.ticket_types)) {
        filter.ticket_types.forEach(type => {
          if (type && type.id && type.name) {
            ticketTypesMap.set(type.id.toString(), type.name);
          }
        });
      }
  
      // Extract Split Types
      if (filter.split_types && Array.isArray(filter.split_types)) {
        filter.split_types.forEach(type => {
          if (type && type.id && type.name) {
            splitTypesMap.set(type.id.toString(), type.name);
          }
        });
      }
  
      // Extract Home Towns
      if (filter.home_town && typeof filter.home_town === 'object') {
        Object.entries(filter.home_town).forEach(([key, value]) => {
          if (key && value && key !== '0') { // Exclude "Any" option typically
            homeTownsMap.set(key, value);
          }
        });
      }
  
      // Extract Ticket Categories (Block Data)
      if (filter.block_data && typeof filter.block_data === 'object') {
        Object.entries(filter.block_data).forEach(([key, value]) => {
          if (key && value) {
            ticketCategoriesMap.set(key, value);
          }
        });
      }
  
      // Extract Notes (Benefits)
      if (filter.notes_left && Array.isArray(filter.notes_left)) {
        filter.notes_left.forEach(note => {
          if (note && note.id && note.name) {
            notesMap.set(note.id.toString(), note.name);
          }
        });
      }
      if (filter.notes_right && Array.isArray(filter.notes_right)) {
        filter.notes_right.forEach(note => {
          if (note && note.id && note.name) {
            notesMap.set(note.id.toString(), note.name);
          }
        });
      }
  
      // Extract Restrictions
      if (filter.restriction_left && Array.isArray(filter.restriction_left)) {
        filter.restriction_left.forEach(restriction => {
          if (restriction && restriction.id && restriction.name) {
            restrictionsMap.set(restriction.id.toString(), restriction.name);
          }
        });
      }
      if (filter.restriction_right && Array.isArray(filter.restriction_right)) {
        filter.restriction_right.forEach(restriction => {
          if (restriction && restriction.id && restriction.name) {
            restrictionsMap.set(restriction.id.toString(), restriction.name);
          }
        });
      }
  
      // Extract Split Details
      if (filter.split_details_left && Array.isArray(filter.split_details_left)) {
        filter.split_details_left.forEach(detail => {
          if (detail && detail.id && detail.name) {
            splitDetailsMap.set(detail.id.toString(), detail.name);
          }
        });
      }
      if (filter.split_details_right && Array.isArray(filter.split_details_right)) {
        filter.split_details_right.forEach(detail => {
          if (detail && detail.id && detail.name) {
            splitDetailsMap.set(detail.id.toString(), detail.name);
          }
        });
      }
    });
  
    // Convert Maps to arrays of options
    optionsMap.ticketTypes = Array.from(ticketTypesMap.entries()).map(([value, label]) => ({
      value,
      label
    }));
  
    optionsMap.splitTypes = Array.from(splitTypesMap.entries()).map(([value, label]) => ({
      value,
      label
    }));
  
    optionsMap.homeTowns = Array.from(homeTownsMap.entries()).map(([value, label]) => ({
      value,
      label
    }));
  
    optionsMap.ticketCategories = Array.from(ticketCategoriesMap.entries()).map(([value, label]) => ({
      value,
      label
    }));
  
    optionsMap.notes = Array.from(notesMap.entries()).map(([value, label]) => ({
      value,
      label
    }));
  
    optionsMap.restrictions = Array.from(restrictionsMap.entries()).map(([value, label]) => ({
      value,
      label
    }));
  
    optionsMap.splitDetails = Array.from(splitDetailsMap.entries()).map(([value, label]) => ({
      value,
      label
    }));
  
    return optionsMap;
  };
  
  /**
   * Returns default headers when no data is available
   * @returns {Array} Default header configurations
   */
  const getDefaultTicketsPageHeaders = () => {
    return [
      { key: "match_name", label: "Match Name", editable: false, type: "text" },
      { key: "venue", label: "Venue", editable: false, type: "text" },
      { key: "tournament", label: "Tournament", editable: false, type: "text" },
      { key: "match_date", label: "Match Date", editable: false, type: "text" },
      { key: "match_time", label: "Match Time", editable: false, type: "text" },
      { key: "ticket_type_id", label: "Ticket Type", editable: true, type: "select", options: [] },
      { key: "quantity", label: "Quantity", editable: true, type: "select", options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
      ]},
      { key: "split_type_id", label: "Split Type", editable: true, type: "select", options: [] },
      { key: "home_town", label: "Fan Area", editable: true, type: "select", options: [] },
      { key: "ticket_category_id", label: "Seating Category", editable: true, type: "select", options: [] },
      { key: "block", label: "Section/Block", editable: true, type: "text" },
      { key: "row", label: "Row", editable: true, type: "text" },
      { key: "first_seat", label: "First Seat", editable: true, type: "text" },
      { key: "face_value", label: "Face Value", editable: true, type: "text" },
      { key: "price", label: "Price", editable: true, type: "text" },
      { key: "ship_date", label: "Date to Ship", editable: true, type: "date" },
      { key: "status", label: "Status", editable: false, type: "text" },
      { key: "sell_date", label: "Listed Date", editable: false, type: "text" }
    ];
  };
  
  /**
   * Transforms ticket data to include the correct field mappings for the table
   * @param {Array} ticketsData - Raw tickets data
   * @returns {Array} Transformed tickets data with proper field mappings
   */
  export const transformTicketsDataForTable = (ticketsData) => {
    if (!ticketsData || !Array.isArray(ticketsData)) return [];
  
    return ticketsData.map(ticket => ({
      ...ticket,
      // Ensure ID fields are mapped correctly for dropdowns
      ticket_type_id: ticket.ticket_type_id || ticket.rawTicketData?.ticket_type_id?.toString() || "",
      split_type_id: ticket.split_type_id || ticket.rawTicketData?.split?.id?.toString() || "",
      ticket_category_id: ticket.ticket_category_id || ticket.rawTicketData?.ticket_category_id?.toString() || "",
      
      // Ensure boolean fields are properly handled
      tickets_in_hand: Boolean(ticket.tickets_in_hand || ticket.rawTicketData?.ticket_in_hand),
      
      // Ensure numeric fields are handled properly
      quantity: ticket.quantity || ticket.rawTicketData?.quantity || 1,
      price: ticket.price || ticket.rawTicketData?.price || 0,
      face_value: ticket.face_value || ticket.rawTicketData?.face_value || "",
      
      // Keep display values as well for backward compatibility
      ticket_type: ticket.ticket_type || ticket.rawTicketData?.ticket_type || "N/A",
      split_type: ticket.split_type || ticket.rawTicketData?.split?.name || "N/A",
      ticket_category: ticket.ticket_category || ticket.rawTicketData?.ticket_category || "N/A",
      
      // Ensure other text fields are properly mapped
      block: ticket.block || ticket.rawTicketData?.ticket_block || "N/A",
      row: ticket.row || ticket.rawTicketData?.row || "",
      first_seat: ticket.first_seat || ticket.rawTicketData?.first_seat || "",
      home_town: ticket.home_town || ticket.rawTicketData?.home_town || "",
      ship_date: ticket.ship_date || ticket.rawTicketData?.ship_date || "",
      
      // Status mappings
      status: ticket.status || getStatusLabel(ticket.rawTicketData?.status),
      sell_date: ticket.sell_date || ticket.rawTicketData?.sell_date || "N/A",
    }));
  };
  
  /**
   * Converts numeric status to readable label
   * @param {number} statusCode - Numeric status code
   * @returns {string} Human readable status
   */
  const getStatusLabel = (statusCode) => {
    switch (statusCode) {
      case 1:
        return "Active";
      case 2:
        return "Sold";
      case 0:
      default:
        return "Inactive";
    }
  };
  
  /**
   * Gets match-specific headers with options filtered for that match
   * @param {Object} matchData - Single match data with filters
   * @param {Array} globalHeaders - Global headers array
   * @returns {Array} Match-specific headers with filtered options
   */
  export const getMatchSpecificHeaders = (matchData, globalHeaders) => {
    if (!matchData?.filter || !globalHeaders) return globalHeaders;
  
    const matchFilter = matchData.filter;
    
    return globalHeaders.map(header => {
      if (header.type !== "select" || !header.options) return header;
  
      // For match-specific filtering, you might want to filter options
      // based on what's available for this specific match
      let matchSpecificOptions = [...header.options];
  
      switch (header.key) {
        case "ticket_type_id":
          if (matchFilter.ticket_types) {
            const availableIds = matchFilter.ticket_types.map(t => t.id.toString());
            matchSpecificOptions = header.options.filter(opt => 
              availableIds.includes(opt.value)
            );
          }
          break;
        case "split_type_id":
          if (matchFilter.split_types) {
            const availableIds = matchFilter.split_types.map(t => t.id.toString());
            matchSpecificOptions = header.options.filter(opt => 
              availableIds.includes(opt.value)
            );
          }
          break;
        case "home_town":
          if (matchFilter.home_town) {
            const availableKeys = Object.keys(matchFilter.home_town);
            matchSpecificOptions = header.options.filter(opt => 
              availableKeys.includes(opt.value)
            );
          }
          break;
        case "ticket_category_id":
          if (matchFilter.block_data) {
            const availableKeys = Object.keys(matchFilter.block_data);
            matchSpecificOptions = header.options.filter(opt => 
              availableKeys.includes(opt.value)
            );
          }
          break;
      }
  
      return {
        ...header,
        options: matchSpecificOptions
      };
    });
  };
  
  /**
   * Validates if a ticket row has all required fields
   * @param {Object} ticketRow - Single ticket row data
   * @param {Array} headers - Headers array with mandatory flags
   * @returns {Object} Validation result with isValid and errors
   */
  export const validateTicketRow = (ticketRow, headers) => {
    const errors = [];
    const mandatoryFields = headers.filter(h => h.mandatory);
  
    mandatoryFields.forEach(field => {
      const value = ticketRow[field.key];
      if (!value || value === "" || value === null || value === undefined) {
        errors.push(`${field.label} is required`);
      }
    });
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Formats date for input fields (YYYY-MM-DD format)
   * @param {string|Date} dateString - Date to format
   * @returns {string} Formatted date string
   */
  export const formatDateForInput = (dateString) => {
    if (!dateString) return "";
  
    try {
      let date;
  
      if (typeof dateString === "string" && dateString.match(/^\d{1,2}\s\w+\s\d{4}$/)) {
        date = new Date(dateString);
      } else if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === "string" && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }
  
      if (isNaN(date.getTime())) {
        return "";
      }
  
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };
  
  /**
   * Creates API payload from ticket row data
   * @param {Object} ticketRow - Ticket row data
   * @param {string} fieldKey - Field that was updated
   * @param {any} newValue - New value for the field
   * @returns {Object} API payload
   */
  export const createUpdatePayload = (ticketRow, fieldKey, newValue) => {
    const payload = {};
  
    // Map frontend field names to API field names if needed
    const fieldMapping = {
      ticket_type_id: 'ticket_type_id',
      split_type_id: 'split_type',
      ticket_category_id: 'ticket_category_id',
      tickets_in_hand: 'ticket_in_hand',
      // Add more mappings as needed
    };
  
    const apiFieldName = fieldMapping[fieldKey] || fieldKey;
    payload[apiFieldName] = newValue;
  
    return payload;
  };
  
  /**
   * Filters headers based on visibility settings
   * @param {Array} headers - All headers
   * @param {Object} visibilityConfig - Object with header keys as keys and boolean visibility as values
   * @returns {Array} Filtered headers array
   */
  export const filterHeadersByVisibility = (headers, visibilityConfig) => {
    if (!visibilityConfig) return headers;
    
    return headers.filter(header => visibilityConfig[header.key] !== false);
  };
  
  /**
   * Groups tickets by match for accordion display
   * @param {Array} ticketsData - Flat array of tickets
   * @param {Array} listingHistoryData - Original listing history data
   * @returns {Array} Grouped tickets by match
   */
  export const groupTicketsByMatch = (ticketsData, listingHistoryData) => {
    if (!ticketsData || !Array.isArray(ticketsData)) return [];
  
    const groupedByMatch = ticketsData.reduce((acc, ticket) => {
      const matchIndex = ticket.matchIndex;
      if (!acc[matchIndex]) {
        acc[matchIndex] = {
          matchIndex,
          matchInfo: ticket.rawMatchData,
          tickets: [],
          filters: listingHistoryData?.[matchIndex]?.filter,
        };
      }
      acc[matchIndex].tickets.push(ticket);
      return acc;
    }, {});
  
    return Object.values(groupedByMatch).map(group => ({
      ...group,
      ticketCount: group.tickets.length,
    }));
  };
  
  // Legacy function for backward compatibility - keep the original one as well
  export const constructTicketsPageHeaders = (globalFilters) => {
    if (!globalFilters) return getDefaultTicketsPageHeaders();
  
    const headers = getDefaultTicketsPageHeaders();
    
    // Update with global filter options if available
    headers.forEach(header => {
      if (header.key === "ticket_type_id" && globalFilters.ticket_types) {
        header.options = globalFilters.ticket_types.map(type => ({
          value: type.id.toString(),
          label: type.name
        }));
      }
      if (header.key === "ticket_category_id" && globalFilters.ticket_category) {
        header.options = globalFilters.ticket_category.map(category => ({
          value: category.id.toString(),
          label: category.name
        }));
      }
    });
  
    return headers;
  };