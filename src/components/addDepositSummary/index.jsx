import React, { useEffect, useState } from "react";
import Button from "@/components/commonComponents/button";
import FormFields from "@/components/formFieldsComponent";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import {
  accountReference,
  getCurrencyDetails,
  sendDepositRequest,
} from "@/utils/apiHandler/request";
import { toast } from "react-toastify";
import TopPopupModal from "../walletPage/components/topPopupModal";
import FooterButton from "../footerButton";
import { useRouter } from "next/router";

const AddDepositSummary = ({ onClose } = {}) => {
  const [loader, setLoader] = useState(false);
  const [isLoadingAccountDetails, setIsLoadingAccountDetails] = useState(true);
  const [currencyDetails, setCurrencyDetails] = useState([]);
  const [bankAccountDetails, setBankAccountDetails] = useState();
  const [formFieldValues, setFormFieldValues] = useState({
    deposit_amount: "",
    currency: "",
    payment_transfer_by: "",
    proof: "",
    notes: "",
  });

  const handleChange = (e, key, type) => {
    const selectType = type === "select";
    let value;
    if (selectType) {
      value = e;
    } else {
      value = e.target.value;
    }

    setFormFieldValues({ ...formFieldValues, [key]: value });
  };

  const fetchCurrencies = async () => {
    const response = await getCurrencyDetails();
    const options = response?.map((item) => ({
      label: item?.code,
      value: item?.code,
    }));
    setCurrencyDetails(options);
  };

  const fetchAccountDetails = async () => {
    try {
      setIsLoadingAccountDetails(true);
      const response = await accountReference();
      setBankAccountDetails(response?.data);
    } catch (error) {
      console.error("Error fetching account details:", error);
      toast.error("Error loading account details");
    } finally {
      setIsLoadingAccountDetails(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
    fetchAccountDetails();
  }, []);

  const isFormValid = () => {
    const requiredFields = [
      "deposit_amount",
      "currency",
      "payment_transfer_by",
    ];
    return requiredFields.every((field) => formFieldValues[field]);
  };

  const fieldStyle =
    "w-full rounded-md border border-gray-200 p-3 text-gray-700 transition-all duration-200";

  const depositFormFields = [
    [
      {
        label: "Deposit Amount",
        type: "number",
        id: "deposit_amount",
        name: "deposit_amount",
        mandatory: true,
        value: formFieldValues?.deposit_amount,
        onChange: handleChange,
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "font-medium text-gray-500 mb-1",
        placeholder: "Enter Your Deposit Amount",
      },
      {
        label: "Deposit Currency",
        type: "select",
        id: "currency",
        name: "currency",
        mandatory: true,
        value: formFieldValues?.currency,
        onChange: handleChange,
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "font-medium text-gray-500 mb-1",
        options: currencyDetails,
      },
    ],
    [
      {
        label: "Transfer By",
        type: "select",
        id: "payment_transfer_by",
        name: "payment_transfer_by",
        mandatory: true,
        value: formFieldValues?.payment_transfer_by,
        onChange: handleChange,
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "font-medium text-gray-500 mb-1",
        options: [
          { value: "ONLINE", label: "ONLINE" },
          { value: "CASH", label: "CASH" },
          { value: "CHEQUE", label: "CHEQUE" },
        ],
      },
      {
        label: "Proof",
        type: "file",
        id: "proof",
        name: "proof",
        value: formFieldValues?.proof,
        onChange: handleChange,
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "font-medium text-gray-500 mb-1",
        buttonText: "Upload Proof File",
        accept: ".pdf,.jpg,.jpeg,.png",
        allowedFileTypes: ["pdf", "jpg", "jpeg", "png"],
        maxFileSize: 10, // 10MB
      },
      {
        label: "Deposit Notes",
        type: "text",
        id: "notes",
        name: "notes",
        value: formFieldValues?.notes,
        onChange: handleChange,
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "font-medium text-gray-500 mb-1",
        placeholder: "Notes",
      },
    ],
  ];

  const router = useRouter();

  const handleRefresh = () => {
    router.reload();
  };

  const handleSubmit = async () => {
    setLoader(true);
    const payload = new FormData();
    Object.entries(formFieldValues).forEach(([key, value]) => {
      if (key === "proof" && value instanceof File) {
        payload.append(key, value);
      } else if (key !== "proof") {
        payload.append(key, value);
      }
    });

    try {
      await sendDepositRequest(payload);
      toast.success("Your deposit request has been submitted and is now pending admin approval.");
      onClose();
      handleRefresh?.();
    } catch (error) {
      console.error("Error saving deposit details", error);
      toast.error("Unable to save deposit request. Please try again or reach out to support if the issue persists.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-lg relative bg-white flex flex-col h-full sm:h-[100vh] min-h-screen sm:min-h-0">
      {/* Header - Responsive padding and text sizes */}
      <div className="flex px-4 sm:px-5 py-3 sm:py-3 justify-between border-b-[1px] border-gray-200 items-center rounded-t-lg shrink-0">
        <h2 className="text-lg sm:text-lg md:text-[20px] text-[#343432] font-semibold leading-tight pr-2">
          Top up your SB pay Account
        </h2>
        <button
          onClick={onClose}
          className="p-2 sm:p-1.5 rounded-full cursor-pointer bg-white/10 hover:bg-white/20 transition-colors duration-200 shrink-0"
          aria-label="Close"
        >
          <IconStore.close className="size-5 sm:size-5" />
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex flex-col gap-1 overflow-y-auto flex-grow">
        {/* TopPopupModal - Pass loading state */}
        <TopPopupModal 
          bankAccountDetails={bankAccountDetails} 
          isLoading={isLoadingAccountDetails}
        />

        {/* Form Content - Enhanced mobile spacing */}
        <div className="flex flex-col gap-4 sm:gap-4 p-4 sm:px-6 sm:pb-6 pb-4">
          <p className="text-base sm:text-base font-medium text-[#343432]">Add Deposit</p>
          
          <div className="flex flex-col gap-4 sm:gap-4">
            {/* First row - Stack on mobile, side by side on desktop */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-4">
              {depositFormFields[0].map((field, index) => (
                <div key={index} className="w-full">
                  <FormFields formFields={[field]} />
                </div>
              ))}
            </div>
            
            {/* Second row - Always stacked */}
            <div className="flex flex-col gap-4">
              {depositFormFields[1].map((field, index) => (
                <div key={index} className="w-full">
                  <FormFields formFields={[field]} />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Spacer to push footer down */}
        <div className="flex-grow min-h-4"></div>
      </div>

      {/* Footer - Sticky at bottom on mobile */}
      <div className="w-full mt-auto shrink-0 sticky bottom-0 sm:relative bg-white border-t sm:border-t-0 border-gray-100">
        <FooterButton
          isFormValid={isFormValid}
          onClose={onClose}
          handleSubmit={handleSubmit}
          loader={loader}
        />
      </div>
    </div>
  );
};

export default AddDepositSummary;