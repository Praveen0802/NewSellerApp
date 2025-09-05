import React from "react";
import Button from "../commonComponents/button";
import { Download, Upload } from "lucide-react";
import useS3Download from "@/Hooks/useS3Download";

const AttendeeDetails = ({
  attendee_details = [],
  mySalesPage,
  expandedVersion,
  showAttendeeUpload,
  rowData,
  handleUploadClick,
  currentOrderObject,
}) => {
  const { downloadFile } = useS3Download();

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

  const ticketType = !isNaN(parseInt(currentOrderObject?.ticket_type_id))
    ? currentOrderObject?.ticket_type_id
    : rowData?.ticket_type;

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
  console.log(currentOrderObject, "currentOrderObjectcurrentOrderObject");
  const uploadDownLoadTicket = (attendee) => {
    return (
      <td
        align="center"
        className="py-3 px-2 flex justify-center text-gray-600 text-xs text-center"
      >
        {showAttendeeUpload ? (
          <Button
            type="primary"
            classNames={{
              root: "px-3 py-1 bg-[#343432] flex justify-center items-center",
              label_: "text-white pl-0",
            }}
            onClick={() => {
              if (showAttendeeUpload) {
                handleUploadClick(
                  {
                    ...rowData,
                    quantity: 1,
                    ticket_type: currentOrderObject?.ticket_type_id,
                    ticket_type_label: currentOrderObject?.ticket_type,
                  },
                  attendee
                );
              }
            }}
          >
            <Upload className="size-4" /> <span>Upload</span>
          </Button>
        ) : (
          <>
            {!attendee?.display_fields?.ticket_file_url ? (
              <>-</>
            ) : (
              <Button
                type="primary"
                classNames={{
                  root: "px-3 py-1 bg-[#343432] flex justify-center items-center",
                  label_: "text-white pl-0",
                }}
                onClick={() => {
                  downloadFile(
                    attendee?.display_fields?.ticket_file_url,
                    "ticket"
                  );
                }}
              >
                {showAttendeeUpload ? (
                  <>
                    <Upload className="size-4" /> <span>Upload</span>
                  </>
                ) : (
                  <>
                    <Download className="size-4" /> <span>Download</span>
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </td>
    );
  };

  // Get all available display fields from the first attendee to determine table columns
  const getAvailableFields = () => {
    const allFields = new Set();
    attendee_details.forEach((attendee) => {
      if (attendee.display_fields) {
        Object.keys(attendee.display_fields).forEach((field) => {
          if (field !== "ticket_file_url") {
            // Exclude ticket_file_url from regular columns
            allFields.add(field);
          }
        });
      }
    });
    return Array.from(allFields);
  };

  const availableFields = getAvailableFields();

  // Helper function to get field label
  const getFieldLabel = (field) => {
    const labelMap = {
      dob: "Date of Birth",
      row: "Row",
      seat: "Seat",
      nationality: "Nationality",
      city: "City",
      first_name: "First Name",
      last_name: "Last Name",
    };
    return (
      labelMap[field] ||
      field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")
    );
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
                Ticket ID
              </th>
              {availableFields.map((field) => (
                <th
                  key={field}
                  className="text-left py-2 px-2 font-medium text-gray-700"
                >
                  {getFieldLabel(field)}
                </th>
              ))}
              {mySalesPage && (
                <th className="text-center py-2 px-2 font-medium text-gray-700">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {attendee_details.map((attendee, index) => {
              const statusInfo = getTicketStatusLabel(attendee.ticket_status);

              return (
                <tr
                  key={attendee.id || index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-2 text-gray-900 font-medium">
                    {attendee.ticketid || "-"}
                  </td>
                  {availableFields.map((field) => (
                    <td key={field} className="py-3 px-2 text-gray-600 text-xs">
                      {attendee.display_fields?.[field] || "-"}
                    </td>
                  ))}
                  {mySalesPage && (
                    <>
                      {ticketType == 3 ? (
                        index == 0 ? (
                          uploadDownLoadTicket(attendee)
                        ) : (
                          <td className="py-3 px-2 text-gray-600 text-xs">-</td>
                        )
                      ) : (
                        <>{uploadDownLoadTicket(attendee)}</>
                      )}
                    </>
                  )}
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

          return (
            <div
              key={attendee.id || index}
              className="border border-gray-200 rounded-lg p-3 mb-3 last:mb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">
                  Ticket ID: {attendee.ticketid || "-"}
                </h4>
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
                {availableFields.map((field) => (
                  <div key={field}>
                    <span className="font-medium">{getFieldLabel(field)}:</span>{" "}
                    {attendee.display_fields?.[field] || "-"}
                  </div>
                ))}
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
