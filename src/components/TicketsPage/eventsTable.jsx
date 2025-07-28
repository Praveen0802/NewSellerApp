import React, { useState, useEffect } from "react";

const EventsTable = ({ events, headers, selectedRows, setSelectedRows }) => {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedStadium, setSelectedStadium] = useState(null);

  // Reset selections when events change
  useEffect(() => {
    setSelectedRows([]);
    setSelectedTeamId(null);
    setSelectedStadium(null);
  }, [events]);

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
        `Can only select events from team ${selectedTeamId} at ${selectedStadium}`
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

  // Check if a row is selectable
  const isRowSelectable = (event) => {
    return (
      (selectedTeamId === null && selectedStadium === null) ||
      (event.team_1 === selectedTeamId && event.stadium === selectedStadium)
    );
  };

  // Check if a row should appear disabled
  const isRowDisabled = (event) => {
    return (
      (selectedTeamId !== null || selectedStadium !== null) &&
      (event.team_1 !== selectedTeamId || event.stadium !== selectedStadium)
    );
  };

  const selectableEvents = getSelectableEvents();

  return (
    <div className="w-full h-full">
      {/* Show selected team and stadium info */}
      {(selectedTeamId || selectedStadium) && selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-2 mb-2 rounded text-sm">
          <span className="text-blue-800">
            Selected: <strong>Team {selectedTeamId}</strong> at{" "}
            <strong>{selectedStadium}</strong>
            <span className="ml-2">
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
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Clear Selection
          </button>
        </div>
      )}

      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b border-[#DADBE5]">
            <th className="px-2 py-2 border-r-[1px] cursor-pointer border-[#DADBE5] w-10">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  selectedRows.length === selectableEvents.length &&
                  selectableEvents.length > 0
                }
                indeterminate={
                  selectedRows.length > 0 &&
                  selectedRows.length < selectableEvents.length
                }
                className="h-3.5 w-3.5"
              />
            </th>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 text-left text-[#323A70] font-medium text-sm whitespace-nowrap"
              >
                {header.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="overflow-y-auto">
          {events.map((event, rowIndex) => {
            const isSelected = selectedRows.includes(event.m_id);
            const isDisabled = isRowDisabled(event);
            const isSelectable = isRowSelectable(event);

            return (
              <tr
                key={event.m_id}
                onClick={() => isSelectable && handleRowSelection(event.m_id)}
                className={`border-b border-[#DADBE5] ${
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
                    className={`px-4 py-2 text-[12px] font-normal text-sm ${
                      isDisabled ? "text-gray-400" : ""
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
                        Team {event[header.key]}
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
                    ) : (
                      event[header.key]
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EventsTable;
