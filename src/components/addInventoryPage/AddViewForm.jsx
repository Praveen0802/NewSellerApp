import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState } from "react";
import FormFields from "../formFieldsComponent";

const AddViewForm = () => {
  const [formFieldValues, setFormFieldValues] = useState({
    ticketType: "",
    quantity: "",
    splitType: "",
    seatingArrangement: "",
    maxDisplayedTickets: "",
    fanArea: "",
    category: "",
    sectionBlock: "",
    row: "",
    firstSeat: "",
    faceValue: "",
    payoutPrice: "",
    benifits: "",
    restrictions: "",
    dateToShip: "",
    ticketsInHand: false,
    uploadTickets: "",
  });

  const handleChange = (e, key, type) => {
    const selectType = type === "select";
    const dateType = type == "date";
    const checkBoxType = type == "checkbox";
    const value = checkBoxType
      ? e.target.checked
      : selectType || dateType
      ? e
      : e.target.value;
    setFormFieldValues({ ...formFieldValues, [key]: value });
  };
  const fieldStyle =
    "w-full rounded-md border border-gray-300 p-3 text-gray-700 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all duration-200";

  const formFields = [
    {
      label: "Ticket Type",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "ticketType",
      name: "ticketType",
      value: formFieldValues?.ticketType,
      onChange: (e) => handleChange(e, "ticketType", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      label: "Quantity",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "quantity",
      name: "quantity",
      value: formFieldValues?.quantity,
      onChange: (e) => handleChange(e, "quantity", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      label: "Split Type",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "splitType",
      name: "splitType",
      value: formFieldValues?.splitType,
      onChange: (e) => handleChange(e, "splitType", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      label: "Seating Arrangement",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "seatingArrangement",
      name: "seatingArrangement",
      value: formFieldValues?.seatingArrangement,
      onChange: (e) => handleChange(e, "seatingArrangement", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      label: "Max Display Quantiyu",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "maxDisplayedTickets",
      name: "maxDisplayedTickets",
      value: formFieldValues?.maxDisplayedTickets,
      onChange: (e) => handleChange(e, "maxDisplayedTickets", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      label: "Fan Area",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "fanArea",
      name: "fanArea",
      value: formFieldValues?.fanArea,
      onChange: (e) => handleChange(e, "fanArea", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      label: "Category",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "category",
      name: "category",
      value: formFieldValues?.category,
      onChange: (e) => handleChange(e, "category", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      label: "Section/lock",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "sectionBlock",
      name: "sectionBlock",
      value: formFieldValues?.sectionBlock,
      onChange: (e) => handleChange(e, "sectionBlock", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      label: "Row",
      type: "text",
      id: "row",
      mandatory: true,
      name: "row",
      value: formFieldValues?.row,
      onChange: (e) => handleChange(e, "row"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
    },
    {
      label: "First Seat",
      type: "text",
      id: "firstSeat",
      mandatory: true,
      name: "firstSeat",
      value: formFieldValues?.firstSeat,
      onChange: (e) => handleChange(e, "firstSeat"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
    },
    {
      label: "Face Value",
      type: "text",
      id: "faceValue",
      mandatory: true,
      name: "faceValue",
      value: formFieldValues?.faceValue,
      onChange: (e) => handleChange(e, "faceValue"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
    },
    {
      label: "Payout Price",
      type: "text",
      id: "payoutPrice",
      mandatory: true,
      name: "payoutPrice",
      value: formFieldValues?.payoutPrice,
      onChange: (e) => handleChange(e, "payoutPrice"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
    },
    {
      label: "Benifits",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "benifits",
      name: "benifits",
      value: formFieldValues?.benifits,
      onChange: (e) => handleChange(e, "benifits", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      label: "Restrictions",
      type: "select",
      searchable: true,
      mandatory: true,
      id: "restrictions",
      name: "restrictions",
      value: formFieldValues?.restrictions,
      onChange: (e) => handleChange(e, "restrictions", "select"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      options: [
        { label: "Option 1", value: "option 1" },
        { label: "Option 2", value: "option 2" },
        { label: "Option 3", value: "option 3" },
      ],
    },
    {
      id: "dateToShip",
      name: "dateToShip",
      type: "date",
      parentClassName: "",
      label: "Date to ship",
      className: `!py-2 !px-4 ${fieldStyle}`,
      singleDateMode: true,
      value: formFieldValues?.dateToShip,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      onChange: (e) => handleChange(e, "dateToShip", "date"),
      singleDateMode: true,
    },
    {
      id: "ticketsInHand",
      name: "ticketsInHand",
      label: "Tickets In Hand",
      checked: formFieldValues?.ticketsInHand,
      onChange: (e) => handleChange(e, "ticketsInHand", "checkbox"),
      className: `!py-2 !px-4 ${fieldStyle}`,
      labelClassName: "text-sm text-gray-600 mb-1 block",
      beforeIcon: (
        <IconStore.trash className="size-4 stroke-2 cursor-pointer stroke-[#130061]" />
      ),
      afterIcon: (
        <IconStore.trash className="size-4 stroke-2 cursor-pointer stroke-[#130061]" />
      ),
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-center">
      <FormFields formFields={formFields} />
    </div>
  );
};

export default AddViewForm;
