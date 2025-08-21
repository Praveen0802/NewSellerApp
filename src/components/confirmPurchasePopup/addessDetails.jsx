import React, { useState } from "react";
import FormFields from "../formFieldsComponent";
import { IconStore } from "@/utils/helperFunctions/iconStore";

const AddressDetails = ({
  addressDetails,
  selectedAddress,
  handleAddressChange,
  formFieldValues,
  handleChange,
  countryList,
  cityOptions,
  phoneCodeOptions,
}) => {
  const fieldStyle =
    "w-full border rounded-md focus:ring-1 focus:ring-blue-500 outline-none";

  const handleOtherAddressSelect = () => {
    handleAddressChange("other");
  };

  // This will be used to render the form fields for the "Other" option
  const userFormFields = [
    [
      {
        label: "First Name",
        type: "text",
        id: "first_name",
        mandatory: true,
        name: "first_name",
        value: formFieldValues?.first_name,
        onChange: (e) => handleChange(e, "first_name"),
        className: `!py-[4px] !px-4 ${fieldStyle}`,
        labelClassName: "!text-[12px] text-gray-600  block",
        placeholder: "Enter first name",
        rightIcon: formFieldValues?.first_name
          ? () => (
              <span className="text-green-500">
                <IconStore.circleTick className="size-5" />
              </span>
            )
          : null,
      },
    ],
    [
      {
        label: "Last Name",
        type: "text",
        id: "last_name",
        mandatory: true,
        name: "last_name",
        value: formFieldValues?.last_name,
        onChange: (e) => handleChange(e, "last_name"),
        className: `!py-[4px] !px-4 ${fieldStyle}`,
        labelClassName: "!text-[12px] text-gray-600  block",
        placeholder: "Enter last name",
        rightIcon: formFieldValues?.last_name
          ? () => (
              <span className="text-green-500">
                <IconStore.circleTick className="size-5" />
              </span>
            )
          : null,
      },
    ],
    [
      {
        label: "Email",
        type: "email",
        id: "email",
        mandatory: true,
        name: "email",
        value: formFieldValues?.email,
        onChange: (e) => handleChange(e, "email"),
        className: `!py-[4px] !px-4 ${fieldStyle}`,
        labelClassName: "!text-[12px] text-gray-600  block",
        placeholder: "Enter email address",
        rightIcon: formFieldValues?.email
          ? () => (
              <span className="text-green-500">
                <IconStore.circleTick className="size-5" />
              </span>
            )
          : null,
      },
    ],
    [
      {
        label: "Phone",
        type: "custom",
        id: "phone_section",
        customComponent: (
          <div className="flex space-x-2 w-full">
            <div className="w-1/4">
              <FormFields
                formFields={[
                  {
                    type: "select",
                    id: "dialing_code",
                    name: "dialing_code",
                    value: formFieldValues?.dialing_code,
                    onChange: (e) => handleChange(e, "dialing_code", "select"),
                    className: `!py-[4px] !px-4 ${fieldStyle}`,
                    searchable: true,
                    options: phoneCodeOptions,
                  },
                ]}
              />
            </div>
            <div className="w-3/4">
              <FormFields
                formFields={[
                  {
                    type: "number",
                    id: "mobile_no",
                    label: "Phone Number",
                    name: "mobile_no",
                    value: formFieldValues?.mobile_no,
                    onChange: (e) => handleChange(e, "mobile_no"),
                    className: `!py-[4px] !px-4 ${fieldStyle}`,
                    placeholder: "Enter mobile number",
                    rightIcon: formFieldValues?.mobile_no
                      ? () => (
                          <span className="text-green-500">
                            <IconStore.circleTick className="size-5" />
                          </span>
                        )
                      : null,
                  },
                ]}
              />
            </div>
          </div>
        ),
      },
    ],
    [
      {
        label: "Address",
        type: "text",
        mandatory: true,
        id: "address",
        name: "address",
        value: formFieldValues?.address,
        onChange: (e) => handleChange(e, "address"),
        className: `!py-[4px] !px-4 ${fieldStyle}`,
        labelClassName: "!text-[12px] text-gray-600  block",
      },
    ],
    [
      {
        label: "Country",
        type: "select",
        searchable: true,
        mandatory: true,
        id: "country",
        name: "country",
        value: formFieldValues?.country,
        onChange: (e) => handleChange(e, "country", "select"),
        className: `!py-[4px] !px-4 ${fieldStyle}`,
        labelClassName: "!text-[12px] text-gray-600  block",
        options: countryList?.length
          ? countryList
          : [{ value: "", label: "Select Country" }],
      },
    ],
    [
      {
        label: "City",
        type: "select",
        id: "city",
        name: "city",
        searchable: true,
        mandatory: true,
        value: formFieldValues?.city,
        onChange: (e) => handleChange(e, "city", "select"),
        disabled: !formFieldValues?.country,
        className: `!py-[4px] !px-4 ${fieldStyle} ${
          !formFieldValues?.country ? "opacity-60" : ""
        }`,
        labelClassName: "!text-[12px] text-gray-600  block",
        options: cityOptions,
        rightIcon: formFieldValues?.city
          ? () => (
              <span className="text-green-500">
                <IconStore.circleTick className="size-5" />
              </span>
            )
          : null,
      },
    ],
  ];

  return (
    <div className="border border-gray-200 rounded-md">
      <p className="px-4 py-2 border-b border-gray-200 text-[14px] font-medium">
        Shipping Address
      </p>
      <div>
        {addressDetails?.map((field, index) => {
          // if (!field?.address_type && !field?.address_line1) return null;
          return (
            <label
              key={index}
              className={`flex items-center justify-between border-b border-gray-200 px-4 py-2 cursor-pointer `}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="addressSelection"
                  className="w-3 h-3 text-gray-600 cursor-pointer"
                  checked={selectedAddress == index}
                  onChange={() => {
                    handleAddressChange(index, field);
                  }}
                />
                <div className="ml-3 flex items-center">
                  <p className="text-gray-700 text-[13px] font-medium">
                    {field?.first_name}
                    {field?.address_type
                      ? ` - ${field?.address_type}`
                      : ""}{" "}
                    {field?.address ? ` - ${field?.address}` : ""}
                  </p>
                </div>
              </div>
            </label>
          );
        })}

        {/* Other address option */}
        <label
          className={`flex items-center justify-between px-4 py-2 cursor-pointer ${
            selectedAddress === "other" ? "" : "border-b border-gray-200"
          }`}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="addressSelection"
              className="w-3 h-3 text-gray-600 cursor-pointer"
              checked={selectedAddress === "other"}
              onChange={handleOtherAddressSelect}
            />
            <div className="ml-3 flex items-center">
              <p className="text-gray-700 text-[13px] font-medium">
                other address
              </p>
            </div>
          </div>
        </label>

        {/* Form for "Other" option */}
        {selectedAddress === "other" && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col gap-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFields formFields={[userFormFields[0][0]]} />
                <FormFields formFields={[userFormFields[1][0]]} />
              </div>

              <div className="w-full">
                <FormFields formFields={[userFormFields[2][0]]} />
              </div>

              <div className="w-full">
                <FormFields formFields={[userFormFields[3][0]]} />
              </div>

              <div className="w-full">
                <FormFields formFields={[userFormFields[4][0]]} />
              </div>

              <div className="w-full">
                <FormFields formFields={[userFormFields[5][0]]} />
              </div>
              <div className="w-full">
                <FormFields formFields={[userFormFields[6][0]]} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressDetails;
