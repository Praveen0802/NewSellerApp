import RightViewModal from "@/components/commonComponents/rightViewModal";
import FloatingLabelInput from "@/components/floatinginputFields";
import FloatingLabelTextarea from "@/components/floatinginputFields/floatingTextArea";
import FooterButton from "@/components/footerButton";
import { requestFeature } from "@/utils/apiHandler/request";
import { getAuthToken } from "@/utils/helperFunctions";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";
import { toast } from "react-toastify";

const SubjectDescriptionPopup = ({ show, onClose }) => {
  const [description, setDescription] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) => {
    setDescription(e.target.value);
  };
  const handleMatchSearch = (e) => {
    setSubject(e.target.value);
  };

  const clearAllFields = () => {
    setDescription("");
    setSubject("");
  };

  const handleSubmit = async () => {
    const payload = {
      subject,
      description,
    };
    setLoading(true);
    const response = await requestFeature(getAuthToken(), payload);
    if (response?.success === true) {
      toast.success("Feature request submitted successfully");
      clearAllFields();
      onClose({ submit: true });
    } else {
      toast.error("Failed to submit feature request", {
        position: "top-center",
      });
    }
    setLoading(false);
  };

  return (
    <RightViewModal show={show} onClose={onClose} outSideClickClose={false}>
      <div className="w-full max-w-3xl flex flex-col gap-2 h-full mx-auto rounded-lg relative bg-white shadow-lg">
        <div>
          <div className="flex px-4 py-2 border-b border-gray-200 justify-between items-center">
            <h2 className="text-[15px] font-semibold text-gray-800">
              Request a Feature
            </h2>
            <button
              onClick={() => onClose({})}
              className="p-1 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              aria-label="Close"
            >
              <IconStore.close className="size-5 text-gray-600" />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <FloatingLabelInput
              id="subject"
              name="subject"
              keyValue={"subject"}
              type="text"
              label="Subject"
              value={subject}
              className={"!py-[7px] !px-[12px] !text-[#323A70] !text-[14px] "}
              onChange={handleMatchSearch}
              paddingClassName=""
              autoComplete="off"
              placeholder="Enter the subject of your feature request"
            />
            <FloatingLabelTextarea
              id="description"
              name="description"
              keyValue="description"
              label="Description"
              value={description}
              onChange={handleChange}
              className="!py-[7px] !px-[12px] !text-[#323A70] !text-[14px]"
              rows={5}
              maxLength={500}
              placeholder="Describe the feature you would like to request"
            />
          </div>
        </div>
        <FooterButton
          isFormValid={() => true}
          onClose={() => {
            onClose();
          }}
          handleSubmit={handleSubmit}
          loader={loading}
        />
      </div>
    </RightViewModal>
  );
};

export default SubjectDescriptionPopup;
