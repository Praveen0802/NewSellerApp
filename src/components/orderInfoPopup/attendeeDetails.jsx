import React from "react";

const AttendeeDetails = ({
  attendee_details = [],
  mySalesPage,
  expandedVersion,
}) => {
  if (!attendee_details || attendee_details.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-[16px] font-medium text-[#323A70] mb-3">
          Attendee Details
        </h3>
        <p className="text-sm text-gray-500">No attendee details available</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString;
  };

  const getTicketStatusLabel = (status) => {
    switch (status) {
      case 1:
        return { label: "Active", color: "bg-green-100 text-green-800" };
      case 0:
        return { label: "Inactive", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-[16px] font-medium text-[#323A70] mb-4">
        Attendee Details ({attendee_details.length}{" "}
        {attendee_details.length === 1 ? "Attendee" : "Attendees"})
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 font-medium text-gray-700">
                Name
              </th>
              <th className="text-left py-2 px-2 font-medium text-gray-700">
                Date of Birth
              </th>
              <th className="text-left py-2 px-2 font-medium text-gray-700">
                Nationality
              </th>
              <th className="text-left py-2 px-2 font-medium text-gray-700">
                City
              </th>
              {expandedVersion && (
                <th className="text-left py-2 px-2 font-medium text-gray-700">
                  Status
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {attendee_details.map((attendee, index) => {
              const statusInfo = getTicketStatusLabel(attendee.ticket_status);
              const fullName =
                `${attendee.first_name || ""} ${
                  attendee.last_name || ""
                }`.trim() || "-";

              return (
                <tr
                  key={attendee.id || index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-2 text-gray-900 font-medium">
                    {fullName}
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    {attendee.dob || "-"}
                  </td>

                  <td className="py-3 px-2 text-gray-600 text-xs">
                    {attendee.nationality || "-"}
                  </td>
                  <td className="py-3 px-2 text-gray-600 text-xs">
                    {attendee.city || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Additional attendee info in cards for mobile view */}
      <div className="md:hidden mt-4">
        {attendee_details.map((attendee, index) => {
          const statusInfo = getTicketStatusLabel(attendee.ticket_status);
          const fullName =
            `${attendee.first_name || ""} ${attendee.last_name || ""}`.trim() ||
            "-";

          return (
            <div
              key={attendee.id || index}
              className="border border-gray-200 rounded-lg p-3 mb-3 last:mb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{fullName}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Serial:</span>{" "}
                  {attendee.serial || index + 1}
                </div>
                <div>
                  <span className="font-medium">Ticket ID:</span>{" "}
                  {attendee.ticketid || "-"}
                </div>
                <div>
                  <span className="font-medium">Nationality:</span>{" "}
                  {attendee.nationality || "-"}
                </div>
                <div>
                  <span className="font-medium">DOB:</span>{" "}
                  {formatDate(attendee.dob)}
                </div>
                <div>
                  <span className="font-medium">Upload Date:</span>{" "}
                  {attendee.ticket_upload_date
                    ? new Date(attendee.ticket_upload_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )
                    : "-"}
                </div>
                <div>
                  <span className="font-medium">Download Date:</span>{" "}
                  {attendee.ticket_download_date
                    ? new Date(
                        attendee.ticket_download_date
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendeeDetails;
