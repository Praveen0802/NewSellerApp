import React, { useState, useEffect } from "react";

// Shimmer component for loading state
const ShimmerRow = ({ headers }) => (
  <tr className="border-b border-[#DADBE5] animate-pulse">
    <td className="px-2 py-2 border-r-[1px] text-center border-[#DADBE5]">
      <div className="h-3.5 w-3.5 bg-gray-200 rounded mx-auto"></div>
    </td>
    {headers.map((_, index) => (
      <td key={index} className="px-4 py-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

// No results component
const NoResultsFound = ({ headers }) => (
  <tr>
    <td colSpan={headers.length + 1} className="px-4 py-12 text-center">
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.077-2.33M15 17.5a6.5 6.5 0 11-6.5-6.5 6.5 6.5 0 013.25-.87M19.5 10.5c0 7.142-7.153 11.25-11.25-4s4.108-11.25 11.25-4z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[#323A70] mb-2">No matches found</h3>
        <p className="text-sm text-[#7D82A4] max-w-sm">
          We couldn't find any events matching your current filters. Try adjusting your search criteria or clearing some filters.
        </p>
      </div>
    </td>
  </tr>
);

const EventsTable = ({ events, headers, selectedRows, setSelectedRows, loader }) => {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedStadium, setSelectedStadium] = useState(null);

  // Reset selections when events change OR when selectedRows is cleared externally
  useEffect(() => {
    if (selectedRows.length === 0) {
      setSelectedTeamId(null);
      setSelectedStadium(null);
    }
  }, [selectedRows]);

  // Reset selections when events change
  useEffect(() => {
    setSelectedRows([]);
    setSelectedTeamId(null);
    setSelectedStadium(null);
  }, [events]);

  // Helper function to get team name by team ID
  const getTeamNameById = (teamId) => {
    const event = events.find((event) => event.team_1 === teamId);
    if (event?.match_name) {
      // Extract team name from match_name (part before "vs")
      const teamName = event.match_name.split(' vs ')[0]?.trim();
      return teamName || `Team ${teamId}`;
    }
    return `Team ${teamId}`;
  };

  // Get the selected team name for display
  const getSelectedTeamName = () => {
    if (!selectedTeamId) return null;
    return getTeamNameById(selectedTeamId);
  };

  const handleRowSelection = (m_id) => {
    const clickedEvent = events.find((event) => event.m_id === m_id);
    const clickedTeamId = clickedEvent.team_1;
    const clickedStadium = clickedEvent.stadium;

    // If no team is selected yet, set the team_1 and stadium as the selected criteria
    if (selectedTeamId === null && selectedStadium === null) {
      setSelectedTeamId(clickedTeamId);
      setSelectedStadium(clickedStadium);
      setSelectedRows([m_id]);
      return;
    }

    // If clicking on the same row that's already selected
    if (selectedRows.includes(m_id)) {
      const newSelectedRows = selectedRows.filter(
        (selectedId) => selectedId !== m_id
      );
      setSelectedRows(newSelectedRows);

      // If no rows are selected anymore, reset the selection criteria
      if (newSelectedRows.length === 0) {
        setSelectedTeamId(null);
        setSelectedStadium(null);
      }
      return;
    }

    // If the clicked event has the same team_1 AND stadium as selected criteria, allow selection
    if (
      clickedTeamId === selectedTeamId &&
      clickedStadium === selectedStadium
    ) {
      setSelectedRows([...selectedRows, m_id]);
    }
    // If different team_1 or stadium, show some feedback (optional)
    else {
      // You can add a toast notification or visual feedback here
      console.warn(
        `Can only select events from team ${getTeamNameById(selectedTeamId)} at ${selectedStadium}`
      );
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === getSelectableEvents().length) {
      setSelectedRows([]);
      setSelectedTeamId(null);
      setSelectedStadium(null);
    } else {
      // If no team/stadium is selected, select all events from the first event's team and stadium
      if (
        selectedTeamId === null &&
        selectedStadium === null &&
        events.length > 0
      ) {
        const firstTeamId = events[0].team_1;
        const firstStadium = events[0].stadium;
        setSelectedTeamId(firstTeamId);
        setSelectedStadium(firstStadium);
        const selectableIds = events
          .filter(
            (event) =>
              event.team_1 === firstTeamId && event.stadium === firstStadium
          )
          .map((event) => event.m_id);
        setSelectedRows(selectableIds);
      } else {
        // Select all events with the current selected team and stadium
        const selectableIds = events
          .filter(
            (event) =>
              event.team_1 === selectedTeamId &&
              event.stadium === selectedStadium
          )
          .map((event) => event.m_id);
        setSelectedRows(selectableIds);
      }
    }
  };

  // Get events that can be selected based on current team and stadium selection
  const getSelectableEvents = () => {
    if (selectedTeamId === null && selectedStadium === null) return events;
    return events.filter(
      (event) =>
        event.team_1 === selectedTeamId && event.stadium === selectedStadium
    );
  };

  // Check if a row is selectable - now based on selectedRows length
  const isRowSelectable = (event) => {
    return (
      selectedRows.length === 0 ||
      (event.team_1 === selectedTeamId && event.stadium === selectedStadium)
    );
  };

  // Check if a row should appear disabled - now based on selectedRows length
  const isRowDisabled = (event) => {
    return (
      selectedRows.length > 0 &&
      (event.team_1 !== selectedTeamId || event.stadium !== selectedStadium)
    );
  };

  const selectableEvents = getSelectableEvents();

  // Render shimmer loading state
  if (loader) {
    return (
      <div className="w-full h-full">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-[#DADBE5]">
              <th className="px-2 py-2 border-r-[1px] border-[#DADBE5] w-10">
                <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </th>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left text-[#7D82A4] font-medium text-sm whitespace-nowrap"
                >
                  {header.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {/* Render 8 shimmer rows */}
            {Array.from({ length: 8 }).map((_, index) => (
              <ShimmerRow key={index} headers={headers} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Show selected team and stadium info */}
      {(selectedTeamId || selectedStadium) && selectedRows.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-2 sm:p-3 mb-2 rounded text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-green-800">
              Selected: <strong>{getSelectedTeamName()}</strong> at{" "}
              <strong>{selectedStadium}</strong>
              <span className="block sm:inline sm:ml-2">
                ({selectedRows.length} of {selectableEvents.length} events
                selected)
              </span>
            </span>
            <button
              onClick={() => {
                setSelectedRows([]);
                setSelectedTeamId(null);
                setSelectedStadium(null);
              }}
              className="self-start sm:ml-2 text-green-600 hover:text-green-800 underline text-xs sm:text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Mobile: Hide table, show card layout on small screens */}
      <div className="block sm:hidden">
        {events.length === 0 ? (
          <div className="p-4 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.077-2.33M15 17.5a6.5 6.5 0 11-6.5-6.5 6.5 6.5 0 013.25-.87M19.5 10.5c0 7.142-7.153 11.25-11.25-4s4.108-11.25 11.25-4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#323A70] mb-2">No matches found</h3>
              <p className="text-sm text-[#7D82A4] max-w-sm">
                We couldn't find any events matching your current filters. Try adjusting your search criteria or clearing some filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, rowIndex) => {
              const isSelected = selectedRows.includes(event.m_id);
              const isDisabled = isRowDisabled(event);
              const isSelectable = isRowSelectable(event);

              return (
                <div
                  key={event.m_id}
                  onClick={() => isSelectable && handleRowSelection(event.m_id)}
                  className={`border rounded-lg p-3 transition-colors duration-150 ${
                    isSelectable
                      ? "cursor-pointer border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      : "cursor-not-allowed border-gray-100"
                  } ${isSelected ? "bg-[#F2F5FD] border-blue-400" : "bg-white"} ${
                    isDisabled ? "bg-gray-50 opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        onChange={() =>
                          isSelectable && handleRowSelection(event.m_id)
                        }
                        checked={isSelected}
                        disabled={!isSelectable}
                        className="h-4 w-4 mt-0.5"
                      />
                      <div>
                        <h3 className="font-medium text-sm text-[#323A70]">
                          {event.match_name || 'Event Name'}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              event.team_1 === selectedTeamId
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {getTeamNameById(event.team_1)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              event.stadium === selectedStadium
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {event.stadium}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#7D82A4]">
                    <div>
                      <span className="font-medium">Date:</span> {new Date(event.match_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {event.match_time?.slice(0, 5)}
                    </div>
                    {headers.slice(3).map((header, idx) => (
                      <div key={idx}>
                        <span className="font-medium">{header.title}:</span> {event[header.key]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop: Show table on larger screens */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-[#DADBE5]">
              <th className="px-2 py-2 border-r-[1px] cursor-pointer border-[#DADBE5] w-10">
                {events.length > 0 && (
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedRows.length === selectableEvents.length &&
                      selectableEvents.length > 0
                    }
                    ref={(input) => {
                      if (input) {
                        input.indeterminate =
                          selectedRows.length > 0 &&
                          selectedRows.length < selectableEvents.length;
                      }
                    }}
                    className="h-3.5 w-3.5"
                  />
                )}
              </th>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-2 sm:px-4 py-2 text-left text-[#7D82A4] font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  {header.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {events.length === 0 ? (
              <NoResultsFound headers={headers} />
            ) : (
              events.map((event, rowIndex) => {
                const isSelected = selectedRows.includes(event.m_id);
                const isDisabled = isRowDisabled(event);
                const isSelectable = isRowSelectable(event);

                return (
                  <tr
                    key={event.m_id}
                    onClick={() => isSelectable && handleRowSelection(event.m_id)}
                    className={`border-b border-[#DADBE5] transition-colors duration-150 ${
                      isSelectable
                        ? "hover:bg-[#F5F7FA] cursor-pointer"
                        : "cursor-not-allowed"
                    } ${isSelected ? "bg-[#F2F5FD]" : ""} ${
                      isDisabled ? "bg-gray-50 opacity-50" : ""
                    }`}
                  >
                    <td className="px-2 py-2 border-r-[1px] text-center border-[#DADBE5]">
                      <input
                        type="checkbox"
                        onChange={() =>
                          isSelectable && handleRowSelection(event.m_id)
                        }
                        checked={isSelected}
                        disabled={!isSelectable}
                        className="h-3.5 w-3.5"
                      />
                    </td>
                    {headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-normal ${
                          isDisabled ? "text-gray-400" : "text-[#323A70]"
                        }`}
                      >
                        {header.key === "team_1" ? (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              event.team_1 === selectedTeamId
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {getTeamNameById(event.team_1)}
                          </span>
                        ) : header.key === "stadium" ? (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              event.stadium === selectedStadium
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {event[header.key]}
                          </span>
                        ) : header.key === "match_date" ? (
                          new Date(event[header.key]).toLocaleDateString()
                        ) : (
                          header.key === "match_time"
                            ? event[header.key]?.slice(0, 5) // keeps only HH:MM
                            : event[header.key]
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsTable;