import Button from "@/components/commonComponents/button";
import CustomModal from "@/components/commonComponents/customModal";
import FormFields from "@/components/formFieldsComponent";
import {
  fetchBankAccountDetails,
  updateBankAccount,
} from "@/utils/apiHandler/request";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AddPayOutPopup = ({
  show,
  onClose,
  item = {},
  countriesList,
  showShimmer = false,
}) => {
  const [formData, setFormData] = useState(() => {
    return {
      beneficiary_name: item.beneficiary_name || "",
      bank_name: item.bank_name || "",
      iban_number: item.iban_number || "",
      beneficiary_address: item.beneficiary_address || "",
      bank_address: item.bank_address || "",
      account_number: item.account_number || "",
      swift_code: item.swift_code || "",
      sort_code: item.sort_code || "",
      currency: item.currency || "",
      country: item.country_id || "",
    };
  });

  const [errors, setErrors] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);

  const editType = item?.account_number;

  useEffect(() => {
    setFormData({
      beneficiary_name: item.beneficiary_name || "",
      bank_name: item.bank_name || "",
      iban_number: item.iban_number || "",
      beneficiary_address: item.beneficiary_address || "",
      bank_address: item.bank_address || "",
      account_number: item.account_number || "",
      swift_code: item.swift_code || "",
      sort_code: item.sort_code || "",
      currency: item.currency || "",
      country: item.country_id || "",
    });
    // Clear errors when item changes
    setErrors({});
  }, [item]);

  const countryList = countriesList?.map((list) => ({
    value: list?.id,
    label: list?.name,
  }));

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "account_number",
      "bank_name",
      "bank_address",
      "iban_number",
      "swift_code",
      "sort_code",
      "beneficiary_name",
      "beneficiary_address",
      "country",
      "currency",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e, key, type) => {
    const selectType = type === "select";
    const value = selectType ? e : e.target.value;

    setFormData({ ...formData, [key]: value });

    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }
  };

  const formFields = [
    {
      id: "account_number",
      name: "account_number",
      label: "Account Number *",
      value: formData?.account_number,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
      error: errors.account_number,
      required: true,
    },
    {
      id: "bank_name",
      name: "bank_name",
      label: "Bank Name *",
      value: formData?.bank_name,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
      error: errors.bank_name,
      required: true,
    },
    {
      id: "bank_address",
      name: "bank_address",
      label: "Bank Address *",
      value: formData?.bank_address,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
      error: errors.bank_address,
      required: true,
    },
    {
      id: "iban_number",
      name: "iban_number",
      label: "IBAN Number *",
      value: formData?.iban_number,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
      error: errors.iban_number,
      required: true,
    },
    {
      id: "swift_code",
      name: "swift_code",
      label: "Swift Code *",
      value: formData?.swift_code,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
      error: errors.swift_code,
      required: true,
    },
    {
      id: "sort_code",
      name: "sort_code",
      label: "Sort Code *",
      value: formData?.sort_code,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
      error: errors.sort_code,
      required: true,
    },
    {
      id: "beneficiary_name",
      name: "beneficiary_name",
      label: "Beneficiary Name *",
      value: formData?.beneficiary_name,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
      error: errors.beneficiary_name,
      required: true,
    },
    {
      id: "beneficiary_address",
      name: "beneficiary_address",
      label: "Beneficiary Address *",
      value: formData?.beneficiary_address,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
      error: errors.beneficiary_address,
      required: true,
    },
    {
      label: "Country *",
      type: "select",
      name: "country",
      options: countryList,
      value: formData?.country,
      searchable: true,
      onChange: handleChange,
      className: "!py-[6px] !px-[12px]",
      error: errors.country,
      required: true,
    },
    {
      label: "Currency *",
      type: "text",
      name: "currency",
      disabled: true,
      value: formData?.currency,
      onChange: handleChange,
      className: "!py-[6px] !px-[12px]",
      error: errors.currency,
      required: true,
    },
  ];

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setSubmitLoader(true);
    try {
      const bankId = item?.bank_id ? item?.bank_id : "";
      const response = await updateBankAccount(
        "",
        bankId,
        bankId ? "PUT" : "POST",
        formData
      );
      toast.success("Payout Account Added Successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save payout account. Please try again.");
    } finally {
      setSubmitLoader(false);
    }
  };

  // Shimmer loading component
  const ShimmerLoader = () => (
    <div className="animate-pulse">
      {/* Header shimmer */}
      <div className="flex px-4 md:px-[24px] py-3 md:py-[16px] border-b-[1px] border-[#E0E1EA] justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-32"></div>
        <div className="h-5 w-5 bg-gray-200 rounded"></div>
      </div>

      {/* Form shimmer */}
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Buttons shimmer */}
        <div className="flex gap-3 md:gap-4 items-center justify-end">
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );

  return (
    <CustomModal show={show} onClose={onClose} outSideClickClose={false}>
      <div className="bg-white rounded-lg w-full max-md:w-[320px] md:w-[600px] max-w-full">
        {showShimmer ? (
          <ShimmerLoader />
        ) : (
          <>
            <div className="flex px-4 md:px-[24px] py-3 md:py-[16px] border-b-[1px] border-[#E0E1EA] justify-between items-center">
              <p className="text-[16px] md:text-[18px] text-[#343432] font-semibold">
                {editType ? "Update" : "Add"} Accounts
              </p>
              <div onClick={onClose} className="cursor-pointer">
                <IconStore.close className="size-5 stroke-[#323A70]" />
              </div>
            </div>
            <div className="flex flex-col gap-4 p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFields formFields={formFields} />
              </div>

              <div className="flex gap-3 md:gap-4 items-center justify-end">
                <Button
                  type="secondary"
                  label="Cancel"
                  onClick={onClose}
                  classNames={{
                    root: "px-[10px] justify-center w-[80px] py-[8px]",
                  }}
                />
                <Button
                  type="primary"
                  label={editType ? "Update" : "Add"}
                  loading={submitLoader}
                  onClick={handleSubmit}
                  classNames={{
                    root: "w-[80px] justify-center py-[8px] bg-[#0137D5]",
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
};

export default AddPayOutPopup;
