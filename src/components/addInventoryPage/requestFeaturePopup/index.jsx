import Button from "@/components/commonComponents/button";
import CustomModal from "@/components/commonComponents/customModal";
import FormFields from "@/components/formFieldsComponent";
import { requestMatchEvent } from "@/utils/apiHandler/request";
import { X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

const RequestEvent = ({ show, onClose }) => {
  const [values, setValues] = useState({
    matchName: "",
    matchLocation: "",
    eventDate: "",
  });
  const [loader, setLoader] = useState(false);
  const [errors, setErrors] = useState({});

  const fields = [
    {
      type: "text",
      name: "matchName",
      value: values?.matchName,
      onChange: (e) => {
        setValues({ ...values, matchName: e.target.value });
        // Clear error when user starts typing
        if (errors.matchName) {
          setErrors({ ...errors, matchName: "" });
        }
      },
      label: "Event Name",
      className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      error: errors.matchName,
    },
    {
      type: "text",
      value: values?.matchLocation,
      onChange: (e) => {
        setValues({ ...values, matchLocation: e.target.value });
        // Clear error when user starts typing
        if (errors.matchLocation) {
          setErrors({ ...errors, matchLocation: "" });
        }
      },
      name: "matchLocation",
      label: "Event Location",
      className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      error: errors.matchLocation,
    },
    {
      type: "date",
      value: values?.eventDate,
      singleDateMode: true,
      onChange: (e) => {
        setValues({ ...values, eventDate: e });
        // Clear error when user selects date
        if (errors.eventDate) {
          setErrors({ ...errors, eventDate: "" });
        }
      },
      name: "eventDate",
      label: "Event Date",
      className: "!py-[10px] !px-[12px] !text-[#343432] !text-[14px]",
      error: errors.eventDate,
    },
  ];

  // Validation function
  const validateFields = () => {
    const newErrors = {};

    if (!values.matchName?.trim()) {
      newErrors.matchName = "Event name is required";
    }

    if (!values.matchLocation?.trim()) {
      newErrors.matchLocation = "Event location is required";
    }

    if (!values.eventDate) {
      newErrors.eventDate = "Event date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if all fields are filled (for button state)
  const isFormValid = () => {
    return (
      values.matchName?.trim() &&
      values.matchLocation?.trim() &&
      values.eventDate
    );
  };

  const handleSubmitClick = async () => {
    if (!validateFields()) {
      toast.error("Please fill in all required fields", {
        position: "top-center",
      });
      return;
    }

    try {
      setLoader(true);
      const payload = {
        event_name: values?.matchName,
        event_date: values?.eventDate?.startDate,
        event_location: values?.matchLocation,
      };

      const response = await requestMatchEvent("", payload);
      toast.success("Event request submitted successfully!", {
        position: "top-center",
      });

      // Reset form after successful submission
      setValues({
        matchName: "",
        matchLocation: "",
        eventDate: "",
      });
      setErrors({});

      onClose();
    } catch (error) {
      toast.error("Failed to submit event request. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoader(false);
    }
  };

  return (
    <CustomModal show={show} onClose={onClose}>
      <div className="w-[400px] rounded-lg bg-white">
        <div className="py-4 px-[24px] flex justify-between border-b-[1px] border-[#E0E1EA]">
          <p className="text-[#323A70] text-[18px] font-semibold">
            Request an Event
          </p>
          <X className="w-5 h-5 cursor-pointer" onClick={onClose} />
        </div>
        <div className="p-4 flex flex-col gap-4">
          <FormFields formFields={fields} />
        </div>
        <div className="w-full border-t-[1px] border-[#E0E1EA] flex items-center gap-4 justify-end py-4 px-[24px]">
          <Button
            classNames={{ root: "!px-3 !py-1", label_: "!text-[13px]" }}
            onClick={onClose}
            type="secondary"
          >
            Cancel
          </Button>
          <Button
            classNames={{ root: "!px-3 !py-1", label_: "!text-[13px]" }}
            onClick={handleSubmitClick}
            type="primary"
            disabled={!isFormValid() || loader}
            loading={loader}
          >
            {loader ? "Submitting..." : "Confirm"}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default RequestEvent;
