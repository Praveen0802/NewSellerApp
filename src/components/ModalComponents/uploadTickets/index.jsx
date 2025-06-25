import React, { useState, useRef } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Eye,
  X,
  Trash2,
  ChevronUp,
} from "lucide-react";
import CustomModal from "@/components/commonComponents/customModal";
import uploadImage from "../../../../public/uploadView.svg";
import Image from "next/image";
import Button from "@/components/commonComponents/button";
import RightViewContainer from "@/components/dashboardPage/reportViewContainer/rightViewContainer";
import RightViewModal from "@/components/commonComponents/rightViewModal";

// Mock CustomModal component

const UploadTickets = ({ show, onClose,showInstruction=true }) => {
  const [showAssigned, setShowAssigned] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: "SN_077.pdf", assigned: false },
    { id: 2, name: "SN_078.pdf", assigned: false },
  ]);
  const [assignedFiles, setAssignedFiles] = useState([
    { id: 1, ticketNumber: 1, fileName: "SN_076.pdf" },
  ]);

  const fileInputRef = useRef(null);

  const handleBrowseFiles = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((file, index) => ({
        id: uploadedFiles.length + index + 1,
        name: file.name,
        assigned: false,
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleDelete = (id) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
  };

  const handleAssignFile = (ticketNumber, fileName) => {
    setAssignedFiles([
      ...assignedFiles,
      { id: assignedFiles.length + 1, ticketNumber, fileName },
    ]);
  };

  const handleRemoveAssigned = (ticketNumber) => {
    setAssignedFiles(
      assignedFiles.filter((file) => file.ticketNumber !== ticketNumber)
    );
  };

  // Generate ticket rows (1-10)
  const renderTicketRows = () => {
    const rows = [];
    for (let i = 1; i <= 10; i++) {
      const assignedFile = assignedFiles.find(
        (file) => file.ticketNumber === i
      );

      rows.push(
        <div
          key={i}
          className="grid grid-cols-2 items-center border-b border-gray-200"
        >
          <div className="px-3 py-2 text-xs text-[#323A70]">Ticket {i}</div>
          <div className="px-3 py-2 flex items-center">
            {assignedFile ? (
              <div className="flex bg-gray-100 rounded px-2 py-1 items-center justify-between w-full">
                <span className="text-xs text-gray-700">
                  {assignedFile.fileName}
                </span>
                <div className="flex items-center">
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700"
                    onClick={() => handleRemoveAssigned(i)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 w-full border-[1px] border-dashed border-[#E0E1EA] bg-white rounded-md px-2 py-0.5">
                Drag file here
              </div>
            )}
          </div>
        </div>
      );
    }
    return rows;
  };

  const instructions = [
    "Use this window to upload individual tickets for each e-ticket order (PDF format)",
    "Drag and drop each file - ensuring any designated seat matches the ticket",
    "Confirm all tickets are uploaded by clicking the green 'confirm' button",
  ];

  return (
    <div>
      <RightViewModal className="!w-[70vw]" show={show} onClose={() => onClose()}>
        <div className="w-full max-w-5xl border bg-white border-[#E0E1EA] rounded-lg ">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-[#E0E1EA]">
            <h2 className="text-lg font-medium text-[#323A70]">
              Upload Tickets
            </h2>
            <button onClick={() => onClose()} className="text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex">
            {/* Left panel - File upload area */}
            {}
            <div className="w-1/2 p-3 m-4 border-r border-[#E0E1EA] flex flex-col gap-4">
              {/* Drag and drop area */}
              <div className="border-1 bg-[#F9F9FB] border-dashed border-[#130061] rounded-lg p-4 flex flex-col gap-1 items-center justify-center h-44">
                <Image src={uploadImage} width={42} height={42} />
                <p className="text-xs text-[#323A70] mb-1">
                  Drag your file(s) to start uploading
                </p>
                <p className="text-xs text-gray-500">OR</p>
                <Button
                  onClick={handleBrowseFiles}
                  classNames={{
                    root: "py-2 border-1 border-[#0137D5] rounded-sm ",
                    label_: "text-[12px] font-medium !text-[#0137D5]",
                  }}
                >
                  Browse Files
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
              </div>
              {showInstruction && (
                <div className="border-[1px] border-[#E0E1EA] rounded-[6px] ">
                  <p className="p-[10px] text-[#323A70] text-[16px] font-semibold border-b-[1px] border-[#E0E1EA]">
                    E-ticket Delivery Instructions
                  </p>
                  <ul className="p-[10px] list-decimal pl-[30px] flex flex-col gap-1">
                    {instructions?.map((item, index) => (
                      <li className="text-[12px] text-[#323A70]" key={index}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Uploaded files list */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{uploadedFiles.length}</span>{" "}
                    file{uploadedFiles.length !== 1 ? "s" : ""} uploaded
                    <span className="font-medium ml-1">
                      {assignedFiles.length}
                    </span>{" "}
                    assigned
                  </p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">
                      Show assigned
                    </span>
                    <button
                      onClick={() => setShowAssigned(!showAssigned)}
                      className={`relative w-10 h-5 transition-colors duration-200 ease-in-out rounded-full ${
                        showAssigned ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                          showAssigned ? "transform translate-x-5" : ""
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>

                {/* File list */}
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex justify-between items-center p-2 border border-gray-200 rounded"
                    >
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <div className="flex items-center">
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel - Match details and ticket assignments */}
            <div className="w-1/2 m-4">
              {/* Match info header */}
              <div className="bg-[#1E0065] text-xs py-3 rounded-t-md text-white px-4 flex items-center justify-between">
                <h3 className="font-medium">Chelsea vs Arsenal</h3>
                <div className="flex items-center gap-2 justify-center">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Sun, 10 Nov 2024</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">16:30</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">Stamford Bridge...</span>
                </div>
                <button className="ml-2">
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>

              {/* Ticket details */}
              <div className="border-[1px] border-[#E0E1EA] rounded-b-md">
                <div className="grid grid-cols-4 bg-gray-100 px-3 py-2 border-b border-gray-200">
                  <div className="text-xs font-medium text-[#323A70]">
                    Listing ID
                  </div>
                  <div className="text-xs font-medium text-[#323A70]">
                    Quantity
                  </div>
                  <div className="text-xs font-medium text-[#323A70]">
                    Ticket Details
                  </div>
                  <div className="text-xs font-medium text-[#323A70]">
                    Row (Seat)
                  </div>
                </div>

                <div className="grid grid-cols-4 bg-[#F9F9FB] py-2 px-3 border-b border-gray-200">
                  <div className="text-xs truncate">1021864323</div>
                  <div className="text-xs truncate">10</div>
                  <div className="text-xs truncate">
                    Golden Circle, Golden Circle
                  </div>
                  <div className="text-xs truncate flex gap-5 items-center justify-end">
                    <span>0 (0)</span>
                    <button className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ticket assignment rows */}
                <div className="overflow-y-auto hideScrollbar ">
                  {renderTicketRows()}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex absolute bottom-0 w-full justify-between items-center p-3 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </RightViewModal>
    </div>
  );
};

export default UploadTickets;
