import React, { useState } from "react";
import FormFields from "../formFieldsComponent";
import { IconStore } from "@/utils/helperFunctions/iconStore";

const GuestDetails = ({
  guestDetails,
  formFieldValues,
  setFormFieldValues,
}) => {
  // Mock data - replace with your actual data
  const countryList = [
    { value: "us", label: "United States" },
    { value: "ae", label: "United Arab Emirates" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
  ];

  console.log("Guest Details:", formFieldValues);

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const fieldStyle =
    "border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  // Updated handleChange to store data in array format
  const handleChange = (e, fieldName, guestIndex, type) => {
    const selectType = type === "select";
    console.log(type, "type");
    const value =
      type == "date" ? e?.startDate : selectType ? e : e?.target?.value;

    // Create a copy of current form field values
    const updatedValues = { ...formFieldValues };

    // Initialize array for field if it doesn't exist
    if (!updatedValues[fieldName]) {
      updatedValues[fieldName] = [];
    }

    // Ensure array has enough slots for this guest index
    while (updatedValues[fieldName].length <= guestIndex) {
      updatedValues[fieldName].push("");
    }

    // Update the specific guest's value
    updatedValues[fieldName][guestIndex] = value;

    setFormFieldValues(updatedValues);
  };

  // Helper function to get field value for a specific guest
  const getFieldValue = (fieldName, guestIndex) => {
    return formFieldValues[fieldName] && formFieldValues[fieldName][guestIndex]
      ? formFieldValues[fieldName][guestIndex]
      : "";
  };

  // Generate JSON fields for FormFields component
  const generateFormFields = (guestIndex, requiredFields) => {
    const fieldConfigs = {
      first_name: {
        label: "First Name",
        type: "text",
        placeholder: "Enter first name",
        mandatory: true,
      },
      last_name: {
        label: "Last Name",
        type: "text",
        placeholder: "Enter last name",
        mandatory: true,
      },
      contact_email: {
        label: "Email",
        type: "email",
        placeholder: "Enter email address",
        mandatory: true,
      },
      contact_phone: {
        label: "Phone Number",
        type: "tel",
        placeholder: "Enter phone number",
        mandatory: true,
      },
      date_of_birth: {
        label: "Date of Birth",
        type: "date",
        mandatory: true,
        singleDateMode: true,
      },
      passport_number: {
        label: "Passport Number",
        type: "text",
        placeholder: "Enter passport number",
        mandatory: true,
      },
      gender: {
        label: "Gender",
        type: "select",
        searchable: false,
        options: genderOptions,
        mandatory: true,
      },
      country_of_residence: {
        label: "Country of Residence",
        type: "select",
        searchable: true,
        options: countryList,
        mandatory: true,
      },
      street_name: {
        label: "Street Address",
        type: "text",
        placeholder: "Enter street address",
        mandatory: true,
      },
      additional_street_name: {
        label: "Additional Street Info",
        type: "text",
        placeholder: "Apartment, suite, etc. (optional)",
        mandatory: false,
      },
      province: {
        label: "Province/State",
        type: "text",
        placeholder: "Enter province or state",
        mandatory: true,
      },
      city: {
        label: "City",
        type: "text",
        placeholder: "Enter city",
        mandatory: true,
      },
      zip: {
        label: "ZIP/Postal Code",
        type: "text",
        placeholder: "Enter ZIP or postal code",
        mandatory: true,
      },
    };

    return requiredFields.map((fieldName) => {
      const config = fieldConfigs[fieldName] || {
        label: fieldName
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        type: "text",
        placeholder: `Enter ${fieldName.replace(/_/g, " ")}`,
        mandatory: true,
      };

      const fieldKey = `guest_${guestIndex}_${fieldName}`;
      const fieldValue = getFieldValue(fieldName, guestIndex);

      const baseField = {
        label: config.label,
        type: config.type,
        id: fieldKey,
        name: fieldKey,
        mandatory: config.mandatory,
        value:
          config.type == "date" && fieldValue
            ? { startDate: fieldValue, endDate: fieldValue }
            : fieldValue,
        onChange: (e) => handleChange(e, fieldName, guestIndex, config.type),
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        singleDateMode: true,
      };

      // Add type-specific properties
      if (config.type === "select") {
        return {
          ...baseField,
          searchable: config.searchable,
          options: config.options?.length
            ? config.options
            : [{ value: "", label: `Select ${config.label}` }],
        };
      } else {
        return {
          ...baseField,
          placeholder: config.placeholder,
        };
      }
    });
  };

  const renderGuestForm = (guest, index) => {
    const formFields = generateFormFields(index, guest.required_fields);

    return (
      <div
        key={index}
        className="p-4 border border-gray-200 rounded-lg bg-white"
      >
        <h3 className="text-[14px] font-medium mb-4">
          Guest {index + 1} Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFields formFields={formFields} />
        </div>
      </div>
    );
  };

  // Default guest data structure if none provided
  const defaultGuestDetails = {
    guest_data: [
      {
        index: 0,
        required_fields: [
          "date_of_birth",
          "passport_number",
          "gender",
          "country_of_residence",
          "street_name",
          "additional_street_name",
          "province",
          "city",
          "zip",
        ],
      },
      {
        index: 1,
        required_fields: [
          "date_of_birth",
          "passport_number",
          "gender",
          "country_of_residence",
          "street_name",
          "additional_street_name",
          "province",
          "city",
          "zip",
        ],
      },
    ],
  };
  return (
    <div className="flex flex-col gap-4">
      {guestDetails?.map((guest, index) => renderGuestForm(guest, index))}
    </div>
  );
};

export default GuestDetails;
