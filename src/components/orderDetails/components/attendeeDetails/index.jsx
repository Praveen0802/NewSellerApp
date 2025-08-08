import FormFields from "@/components/formFieldsComponent";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  PlusCircle,
  X,
  Edit,
  Save,
} from "lucide-react";
import { purchaseAttendeeDetails } from "@/utils/apiHandler/request";

const AttendeeDetails = ({ attendee_details = [], bookingId }) => {
  const total = attendee_details?.length || 5;
  const [attendees, setAttendees] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize attendees from provided data on component mount
  useEffect(() => {
    if (attendee_details && attendee_details.length > 0) {
      const initialAttendees = attendee_details.map((detail, index) => {
        return {
          id: detail.id || index + 1,
          atteneCount: index + 1,
          formData: {
            first_name: detail.first_name || "",
            last_name: detail.last_name || "",
            email: detail.email || "",
            phone: detail.phone || "",
            dob_day: detail.dob ? detail.dob.split("-")[2] : "",
            dob_month: detail.dob ? detail.dob.split("-")[1] : "",
            dob_year: detail.dob ? detail.dob.split("-")[0] : "",
            seat: detail.seat || "",
            gender: detail.gender || "",
            nationality: detail.nationality || "",
            passport: detail.passport || "",
            ticket_id: detail.ticket_id || "",
          },
        };
      });
      setAttendees(initialAttendees);
    } else {
      // Create a default attendee if no data provided
      setAttendees([{ id: 1, formData: {} }]);
    }
  }, [attendee_details]);

  const fieldStyle =
    "border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

  console.log(attendees, "aaaaaaaaaaa");

  const handleChange = (e, field, attendeeId, type = "input") => {
    // Stop event propagation to prevent triggering the accordion toggle
    e.stopPropagation && e.stopPropagation();

    // Use functional update pattern to ensure we're working with latest state
    setAttendees((prevAttendees) => {
      return prevAttendees.map((attendee) => {
        if (attendee.id === attendeeId) {
          return {
            ...attendee,
            formData: {
              ...attendee.formData,
              [field]: type === "select" ? e.value : e.target.value,
            },
          };
        }
        return attendee;
      });
    });
  };
  const handleRadioChange = (value, field, attendeeId) => {
    setAttendees((prevAttendees) => {
      return prevAttendees.map((attendee) => {
        if (attendee.id === attendeeId) {
          return {
            ...attendee,
            formData: {
              ...attendee.formData,
              [field]: value,
            },
          };
        }
        return attendee;
      });
    });
  };

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  console.log(attendees, "attendeesattendees");
  const saveAttendeeDetails = async () => {
    toggleEditMode();

    const formattedData = {
      tickets: attendees.map((attendee) => ({
        id: attendee.id,
        first_name: attendee.formData.first_name,
        last_name: attendee.formData.last_name,
        email: attendee.formData.email,
        nationality: attendee.formData.nationality,
        dob:
          attendee.formData.dob_year &&
          attendee.formData.dob_month &&
          attendee.formData.dob_day
            ? `${attendee.formData.dob_year}-${attendee.formData.dob_month}-${attendee.formData.dob_day}`
            : null,
        phone: attendee.formData.phone,
        passport: attendee.formData.passport,
        gender: attendee.formData.gender,
        seat: attendee.formData.seat,
      })),
    };
    try {
      const response = await purchaseAttendeeDetails(
        "",
        bookingId,
        formattedData
      );
      console.log(response, "responseresponse");
    } catch (error) {
      console.error("Error saving attendee details:", error);
    }
  };

  const generateAttendeeFormFields = useCallback(
    (attendeeId, attendeeData, isEditable = true) => {
      const readOnlyProps = isEditable
        ? {}
        : { readOnly: true, disabled: true };

      return [
        // First Name
        [
          {
            label: "First Name",
            type: "text",
            id: `first_name_${attendeeId}`,
            mandatory: true,
            name: `first_name_${attendeeId}`,
            value: attendeeData.first_name || "",
            onChange: (e) => handleChange(e, "first_name", attendeeId),
            className: `!py-2 !px-4 ${fieldStyle} ${
              !isEditable ? "bg-gray-100" : ""
            }`,
            labelClassName: "!text-[12px] text-gray-600 block",
            placeholder: isEditable ? "Enter first name" : "Not provided",
            rightIcon: attendeeData.first_name
              ? () => (
                  <span className="text-green-500">
                    <IconStore.circleTick className="size-5" />
                  </span>
                )
              : null,
            ...readOnlyProps,
          },
        ],
        // Last Name
        [
          {
            label: "Last Name",
            type: "text",
            id: `last_name_${attendeeId}`,
            mandatory: true,
            name: `last_name_${attendeeId}`,
            value: attendeeData.last_name || "",
            onChange: (e) => handleChange(e, "last_name", attendeeId),
            className: `!py-2 !px-4 ${fieldStyle} ${
              !isEditable ? "bg-gray-100" : ""
            }`,
            labelClassName: "!text-[12px] text-gray-600 block",
            placeholder: isEditable ? "Enter last name" : "Not provided",
            rightIcon: attendeeData.last_name
              ? () => (
                  <span className="text-green-500">
                    <IconStore.circleTick className="size-5" />
                  </span>
                )
              : null,
            ...readOnlyProps,
          },
        ],
        // Email
        [
          {
            label: "Email",
            type: "email",
            id: `email_${attendeeId}`,
            name: `email_${attendeeId}`,
            value: attendeeData.email || "",
            onChange: (e) => handleChange(e, "email", attendeeId),
            className: `!py-2 !px-4 ${fieldStyle} ${
              !isEditable ? "bg-gray-100" : ""
            }`,
            labelClassName: "!text-[12px] text-gray-600 block",
            placeholder: isEditable ? "Enter email" : "Not provided",
            ...readOnlyProps,
          },
        ],
        // Phone
        [
          {
            label: "Phone No",
            type: "text",
            id: `phone_${attendeeId}`,
            name: `phone_${attendeeId}`,
            value: attendeeData.phone || "",
            onChange: (e) => handleChange(e, "phone", attendeeId),
            className: `!py-2 !px-4 ${fieldStyle} ${
              !isEditable ? "bg-gray-100" : ""
            }`,
            labelClassName: "!text-[12px] text-gray-600 block",
            placeholder: isEditable ? "Enter phone number" : "Not provided",
            ...readOnlyProps,
          },
        ],
        // DOB
        [
          {
            label: "Date Of Birth",
            type: "custom",
            id: `dob_section_${attendeeId}`,
            customComponent: (
              <div className="flex space-x-2 w-full">
                <div className="w-1/3">
                  <FormFields
                    formFields={[
                      {
                        type: "text",
                        label: "DD",
                        id: `dob_day_${attendeeId}`,
                        name: `dob_day_${attendeeId}`,
                        value: attendeeData.dob_day || "",
                        onChange: (e) => {
                          if (!isEditable) return;
                          // Allow only numbers and limit to 2 digits
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .substring(0, 2);
                          const syntheticEvent = {
                            target: { value, name: e.target.name },
                          };
                          handleChange(syntheticEvent, "dob_day", attendeeId);
                        },
                        className: `!py-2 !px-3 ${fieldStyle} ${
                          !isEditable ? "bg-gray-100" : ""
                        }`,
                        labelClassName: "!text-[12px] text-gray-600 block",
                        placeholder: "DD",
                        ...readOnlyProps,
                      },
                    ]}
                  />
                </div>
                <div className="w-1/3">
                  <FormFields
                    formFields={[
                      {
                        type: "text",
                        id: `dob_month_${attendeeId}`,
                        label: "MM",
                        name: `dob_month_${attendeeId}`,
                        value: attendeeData.dob_month || "",
                        onChange: (e) => {
                          if (!isEditable) return;
                          // Allow only numbers and limit to 2 digits
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .substring(0, 2);
                          const syntheticEvent = {
                            target: { value, name: e.target.name },
                          };
                          handleChange(syntheticEvent, "dob_month", attendeeId);
                        },
                        className: `!py-2 !px-3 ${fieldStyle} ${
                          !isEditable ? "bg-gray-100" : ""
                        }`,
                        labelClassName: "!text-[12px] text-gray-600 block",
                        placeholder: "MM",
                        ...readOnlyProps,
                      },
                    ]}
                  />
                </div>
                <div className="w-1/3">
                  <FormFields
                    formFields={[
                      {
                        type: "text",
                        id: `dob_year_${attendeeId}`,
                        label: "YYYY",
                        name: `dob_year_${attendeeId}`,
                        value: attendeeData.dob_year || "",
                        onChange: (e) => {
                          if (!isEditable) return;
                          // Allow only numbers and limit to 4 digits
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .substring(0, 4);
                          const syntheticEvent = {
                            target: { value, name: e.target.name },
                          };
                          handleChange(syntheticEvent, "dob_year", attendeeId);
                        },
                        className: `!py-2 !px-3 ${fieldStyle} ${
                          !isEditable ? "bg-gray-100" : ""
                        }`,
                        labelClassName: "!text-[12px] text-gray-600 block",
                        placeholder: "YYYY",
                        ...readOnlyProps,
                      },
                    ]}
                  />
                </div>
              </div>
            ),
          },
        ],
        // Seat
        [
          {
            label: "Seat",
            type: "text",
            id: `seat_${attendeeId}`,
            name: `seat_${attendeeId}`,
            value: attendeeData.seat || "",
            onChange: (e) => handleChange(e, "seat", attendeeId),
            className: `!py-2 !px-4 ${fieldStyle} ${
              !isEditable ? "bg-gray-100" : ""
            }`,
            labelClassName: "!text-[12px] text-gray-600 block",
            placeholder: isEditable ? "Enter seat number" : "Not provided",
            ...readOnlyProps,
          },
        ],
        // Gender
        [
          {
            label: "Gender",
            type: "custom",
            id: `gender_section_${attendeeId}`,
            customComponent: (
              <div className="flex space-x-4 py-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`gender_${attendeeId}`}
                    value="male"
                    checked={attendeeData.gender === "male"}
                    onChange={() =>
                      isEditable &&
                      handleRadioChange("male", "gender", attendeeId)
                    }
                    className="form-radio h-4 w-4 text-gray-600"
                    disabled={!isEditable}
                  />
                  <span className="ml-2 text-sm text-gray-700">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`gender_${attendeeId}`}
                    value="female"
                    checked={attendeeData.gender === "female"}
                    onChange={() =>
                      isEditable &&
                      handleRadioChange("female", "gender", attendeeId)
                    }
                    className="form-radio h-4 w-4 text-gray-600"
                    disabled={!isEditable}
                  />
                  <span className="ml-2 text-sm text-gray-700">Female</span>
                </label>
              </div>
            ),
          },
        ],
        // Nationality
        [
          {
            label: "Nationality",
            type: "text",
            id: `nationality_${attendeeId}`,
            mandatory: true,
            name: `nationality_${attendeeId}`,
            value: attendeeData.nationality || "",
            onChange: (e) => handleChange(e, "nationality", attendeeId),
            className: `!py-2 !px-4 ${fieldStyle} ${
              !isEditable ? "bg-gray-100" : ""
            }`,
            labelClassName: "!text-[12px] text-gray-600 block",
            placeholder: isEditable ? "Enter nationality" : "Not provided",
            rightIcon: attendeeData.nationality
              ? () => (
                  <span className="text-green-500">
                    <IconStore.circleTick className="size-5" />
                  </span>
                )
              : null,
            ...readOnlyProps,
          },
        ],
        // Passport
        [
          {
            label: "Passport",
            type: "text",
            id: `passport_${attendeeId}`,
            mandatory: true,
            name: `passport_${attendeeId}`,
            value: attendeeData.passport || "",
            onChange: (e) => handleChange(e, "passport", attendeeId),
            className: `!py-2 !px-4 ${fieldStyle} ${
              !isEditable ? "bg-gray-100" : ""
            }`,
            labelClassName: "!text-[12px] text-gray-600 block",
            placeholder: isEditable ? "Enter passport number" : "Not provided",
            rightIcon: attendeeData.passport
              ? () => (
                  <span className="text-green-500">
                    <IconStore.circleTick className="size-5" />
                  </span>
                )
              : null,
            ...readOnlyProps,
          },
        ],
      ];
    },
    [fieldStyle]
  );

  const completedAttendees = attendees.filter(
    (attendee) =>
      attendee.formData.first_name &&
      attendee.formData.last_name &&
      attendee.formData.nationality &&
      attendee.formData.passport &&
      attendee.formData.dob_day &&
      attendee.formData.dob_month &&
      attendee.formData.dob_year &&
      attendee.formData.gender
  ).length;

  return (
    <div className="flex flex-col">
      <div
        className={`border ${
          isEditMode ? "border-blue-300" : "border-[#E0E1EA]"
        } rounded-md overflow-hidden`}
      >
        <div
          className={`flex justify-between items-center px-3 md:px-4 py-3 cursor-pointer`}
          onClick={toggleAccordion}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm md:text-base">
              Attendee details
            </span>
          </div>
          <div className="flex items-center gap-1 md:gap-3">
            {isEditMode ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveAttendeeDetails();
                }}
                className="flex items-center gap-1 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 py-1 px-2 md:px-3 rounded-md text-xs md:text-sm"
              >
                <Save size={isMobile ? 14 : 16} />
                <span className={isMobile ? "hidden md:inline" : ""}>Save</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEditMode();
                }}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-800 bg-blue-50 hover:bg-gray-100 py-1 px-2 md:px-3 rounded-md text-xs md:text-sm"
              >
                <Edit size={isMobile ? 14 : 16} />
                <span className={isMobile ? "hidden md:inline" : ""}>Edit</span>
              </button>
            )}
            {isOpen ? (
              <ChevronUp size={isMobile ? 16 : 18} />
            ) : (
              <ChevronDown size={isMobile ? 16 : 18} />
            )}
          </div>
        </div>

        {isOpen && (
          <div className="p-3 md:p-5">
            {attendees.map((attendee, index) => {
              const attendeeFields = generateAttendeeFormFields(
                attendee.id,
                attendee.formData,
                isEditMode
              );

              const isComplete =
                attendee.formData.first_name &&
                attendee.formData.last_name &&
                attendee.formData.nationality &&
                attendee.formData.passport &&
                attendee.formData.dob_day &&
                attendee.formData.dob_month &&
                attendee.formData.dob_year &&
                attendee.formData.gender;

              return (
                <div
                  key={attendee.id}
                  className={`mb-6 pb-6 ${
                    index < attendees.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm md:text-md font-medium flex items-center gap-2">
                      Attendee {attendee.atteneCount}
                      {isComplete && (
                        <span className="text-green-500">
                          <IconStore.circleTick className="size-4 md:size-5" />
                        </span>
                      )}
                      {attendee.formData.first_name &&
                        attendee.formData.last_name && (
                          <span className="text-gray-500 text-xs md:text-sm ml-1 md:ml-2 truncate max-w-32 md:max-w-none">
                            ({attendee.formData.first_name}{" "}
                            {attendee.formData.last_name})
                          </span>
                        )}
                    </h3>
                  </div>

                  {/* Form fields layout - responsive grid */}
                  <div className="space-y-4">
                    {/* First Name and Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <FormFields formFields={[attendeeFields[0][0]]} />
                      <FormFields formFields={[attendeeFields[1][0]]} />
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <FormFields formFields={[attendeeFields[2][0]]} />
                      <FormFields formFields={[attendeeFields[3][0]]} />
                    </div>

                    {/* DOB */}
                    <div className="w-full">
                      <label className="text-xs md:text-sm text-gray-600 mb-1 block">
                        Date Of Birth
                      </label>
                      <FormFields formFields={[attendeeFields[4][0]]} />
                    </div>

                    {/* Seat */}
                    <div className="w-full">
                      <FormFields formFields={[attendeeFields[5][0]]} />
                    </div>

                    {/* Gender */}
                    <div className="w-full">
                      <label className="text-xs md:text-sm text-gray-600 mb-1 block">
                        Gender
                      </label>
                      <FormFields formFields={[attendeeFields[6][0]]} />
                    </div>

                    {/* Nationality and Passport */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <FormFields formFields={[attendeeFields[7][0]]} />
                      <FormFields formFields={[attendeeFields[8][0]]} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeDetails;
