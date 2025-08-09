import Button from "@/components/commonComponents/button";
import CustomModal from "@/components/commonComponents/customModal";
import FormFields from "@/components/formFieldsComponent";
import { X } from "lucide-react";
import React, { useState } from "react";

const RequestEvent = ({ show, onClose }) => {
  const [values, setvalues] = useState({
    matchName: "",
    matchLocation: "",
    eventDate: "",
  });

  const fields = [
    {
      type: "text",
      name: "matchName",
      value: values?.matchName,
      onChange: (e) => setvalues({ ...values, matchName: e.target.value }),
      label: "Event Name",
      className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
    },
    {
      type: "text",
      value: values?.matchLocation,
      onChange: (e) => setvalues({ ...values, matchLocation: e.target.value }),
      name: "matchLocation",
      label: "Event Location",
      className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
    },
    {
      type: "date",
      value: values?.eventDate,
      onChange: (e) => setvalues({ ...values, eventDate: e }),
      name: "eventDate",
      label: "Event Date",
      className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
    },
  ];

  const handleSubmitClick = () =>{
    onClose()
  }

  return (
    <CustomModal show={show} onClose={onClose}>
      <div className="w-[400px] rounded-lg bg-white">
        <div className="py-4 px-[24px] flex justify-between border-b-[1px] border-[#E0E1EA]">
          <p className="text-[#323A70] text-[18px] font-semibold">Request an Event</p>
          <X className="w-5 h-5 cursor-pointer" onClick={onClose} />
        </div>
        <div className="p-4 flex flex-col gap-4">
          <FormFields formFields={fields} />
        </div>
        <div className="w-full border-t-[1px] border-[#E0E1EA] flex items-center gap-4 justify-end py-4 px-[24px]">
          <Button classNames={{root:'!px-3 !py-1',label_:'!text-[13px]'}} onClick={onClose} type="secondary">Cancel </Button>
          <Button classNames={{root:'!px-3 !py-1',label_:'!text-[13px]'}} onClick={handleSubmitClick} type="primary">Confirm </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default RequestEvent;
