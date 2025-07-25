import Button from "@/components/commonComponents/button";
import CustomModal from "@/components/commonComponents/customModal";
import FormFields from "@/components/formFieldsComponent";
import { fetchBankAccountDetails, updateBankAccount } from "@/utils/apiHandler/request";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AddPayOutPopup = ({ show, onClose, item = {}, countriesList }) => {
  const [formData, setFormData] = useState(() => {
    // Use direct item properties to ensure correct initialization
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
  }, [item]);

  const [submitLoader, setSubmitLoader] = useState(false);

  const countryList = countriesList?.map((list) => ({
    value: list?.id,
    label: list?.name,
  }));

  const handleChange = (e, key, type) => {
    const selectType = type === "select";
    const value = selectType ? e : e.target.value;
    setFormData({ ...formData, [key]: value });
  };

  const formFields = [
    {
      id: "account_number",
      name: "account_number",
      label: "Account Number",
      value: formData?.account_number,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
    },
    {
      id: "bank_name",
      name: "bank_name",
      label: "Bank Name",
      value: formData?.bank_name,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
    },
    {
      id: "bank_address",
      name: "bank_address",
      label: "Bank Address",
      value: formData?.bank_address,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
    },

    {
      id: "iban_number",
      name: "iban_number",
      label: "IBAN Number",
      value: formData?.iban_number,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
    },
    {
      id: "swift_code",
      name: "swift_code",
      label: "Swift Code",
      value: formData?.swift_code,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
    },
    {
      id: "sort_code",
      name: "sort_code",
      label: "Sort Code",
      value: formData?.sort_code,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
    },
    {
      id: "beneficiary_name",
      name: "beneficiary_name",
      label: "Beneficiary Name",
      value: formData?.beneficiary_name,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
    },
    {
      id: "beneficiary_address",
      name: "beneficiary_address",
      label: "Beneficiary Address",
      value: formData?.beneficiary_address,
      onChange: handleChange,
      type: "text",
      className: "!py-[6px] !px-[12px]",
      autoComplete: "off",
    },
    {
      label: "Country",
      type: "select",
      name: "country",
      options: countryList,
      value: formData?.country,
      searchable: true,
      onChange: handleChange,
      className: "!py-[6px] !px-[12px]",
    },
    {
      label: "Currency",
      type: "text",
      disabled: true,
      value: formData?.currency,
      onSelect: handleChange,
      className: "!py-[6px] !px-[12px]",
    },
  ];

  const handleSubmit = async () => {
    setSubmitLoader(true);
    const bankId = item?.bank_id ? item?.bank_id : "";
    const response = await updateBankAccount(
      "",
      bankId,
      bankId ? "PUT" : "POST",
      formData
    );
    toast.success("Payout Account Added Successfully");
    setSubmitLoader(false);
    onClose();
  };
  return (
    <CustomModal show={show} onClose={onClose} outSideClickClose={false}>
      <div className="bg-white rounded-lg w-fullmax-md:w-[320px]  md:w-[600px] max-w-full">
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
      </div>
    </CustomModal>
  );
};

export default AddPayOutPopup;
