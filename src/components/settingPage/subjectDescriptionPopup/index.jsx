import RightViewModal from "@/components/commonComponents/rightViewModal";
import FloatingLabelInput from "@/components/floatinginputFields";
import FloatingLabelTextarea from "@/components/floatinginputFields/floatingTextArea";
import FooterButton from "@/components/footerButton";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";

const SubjectDescriptionPopup = ({show, onClose}) => {
  const [description, setDescription] = React.useState("");
  const handleChange = (e) => {
    setDescription(e.target.value);
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
              id="selectedMatch"
              name="selectedMatch"
              keyValue={"selectedMatch"}
              type="text"
              label="Subject"
              //   value={selectedMatch}
              className={"!py-[7px] !px-[12px] !text-[#323A70] !text-[14px] "}
              //   onChange={handleMatchSearch}
              paddingClassName=""
              autoComplete="off"
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
            />
          </div>
        </div>
        <FooterButton
          isFormValid={() => true}
          onClose={() => ({})}
          handleSubmit={() => ({})}
          loader={false}
        />
      </div>
    </RightViewModal>
  );
};

export default SubjectDescriptionPopup;
