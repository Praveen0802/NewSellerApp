import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState, useEffect } from "react";
import CustomSelect from "../commonComponents/customSelect";
import Button from "../commonComponents/button";
import TableView from "./components/tableView";
import RightViewModal from "../commonComponents/rightViewModal";
import AddEditUser from "./components/addEditUser";
import { fetchUserDetails } from "@/utils/apiHandler/request";
import DeleteConfirmation from "../commonComponents/deleteConfirmation";
import { toast } from "react-toastify";

const MyTeamView = (props) => {
  const { userDetails, fetchCountries } = props;
  const { travel_Customers = [], meta = {} } = userDetails || {};
console.log(props,'ppppppp')
  const [metaDetails, setMetaDetails] = useState(meta);

  const [travelCustomerValues, setTravelCustomerValues] =
    useState(travel_Customers);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [userViewPopup, setUserViewPopup] = useState({
    show: false,
    type: "",
  });
  const [editUserValues, setEditUserValues] = useState("");
  const [searchText, setSearchText] = useState("");

  const [currentPage, setCurrentPage] = useState(metaDetails?.current_page);
  const [itemsPerPage, setItemsPerPage] = useState(metaDetails?.per_page);
  const [totalPages, setTotalPages] = useState(metaDetails?.last_page);
  const [deleteConfirmPopup, setDeleteConfirmPopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const viewOptions = {
    options: [
      { value: "10", label: "10" },
      { value: "20", label: "20" },
      { value: "50", label: "50" },
    ],
    selectedOption: itemsPerPage?.toString(),
    onChange: (value) => {
      setItemsPerPage(parseInt(value));
      setCurrentPage(1);
    },
  };

  const handleApiCAll = async (params) => {
    setIsLoading(true);
    const response = await fetchUserDetails("", "", "GET", "", params);
    setTravelCustomerValues(response?.travel_Customers);
    setMetaDetails(response?.meta);
    setIsLoading(false);
  };

  useEffect(() => {
    setTotalPages(metaDetails?.last_page);
    setCurrentPage(metaDetails?.current_page);
  }, [metaDetails?.last_page, metaDetails?.current_page]);

  useEffect(() => {
    if (currentPage) {
      handleApiCAll({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchText,
      });
    }
  }, [currentPage, itemsPerPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // API call will be triggered by the useEffect
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // API call will be triggered by the useEffect
    }
  };

  const handlePageInputChange = (e) => {
    const page = parseInt(e.target.value) || 1;
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      // API call will be triggered by the useEffect
    } else if (page > totalPages) {
      setCurrentPage(totalPages);
      // API call will be triggered by the useEffect
    } else {
      setCurrentPage(1);
      // API call will be triggered by the useEffect
    }
  };

  const handleClosePopup = async (submit) => {
    if (submit?.submit) {
      handleApiCAll({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchText,
      });
    }
    setUserViewPopup({ show: false, type: "" });
    setEditUserValues();
  };

  const handleEditClick = async (item) => {
    setIsLoading(true);
    const response = await fetchUserDetails("", "", "GET", "", {
      id: item?.id,
    });
    setEditUserValues({ id: item?.id, ...response?.travel_Customers[0] });
    setUserViewPopup({
      show: true,
      type: "edit",
    });
    setIsLoading(false);
  };

  const handleInputBlurOrEnter = (e, isBlur = false) => {
    if (isBlur || e.key === "Enter") {
      handleApiCAll({ page: 1, per_page: itemsPerPage, search: searchText });
      setCurrentPage(1);
    }
  };

  const handleDeleteClick = async (item) => {
    setDeleteId(item?.id);
    setDeleteConfirmPopup(true);
  };

  const handleDeleteCall = async () => {
    setDeleteLoader(true);
    await fetchUserDetails("", deleteId, "DELETE");
    toast.success("User deleted successfully");
    handleApiCAll({
      page: currentPage,
      per_page: itemsPerPage,
      search: searchText,
    });
    setDeleteConfirmPopup(false);
    setDeleteLoader(false);
  };

  const headerClassName =
    "px-2 sm:px-4 py-2 border-b border-r border-[#eaeaf1] text-xs sm:text-sm font-medium text-[#343432]";

  const rowClassName =
    "px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border-b border-r border-[#eaeaf1]";

  return (
    <div className="w-full min-h-screen flex flex-col">
      <p className="pb-2 sm:pb-4 text-base sm:text-lg md:text-xl p-3 sm:p-4 font-semibold">
        My Team
      </p>
      <div className="bg-white p-3 sm:p-4 border-[1px] flex flex-col gap-3 sm:gap-4 border-[#eaeaf1] w-full flex-grow overflow-hidden">
        <div className="border-[1px] border-[#eaeaf1] rounded-md">
          {/* Search and filter area */}
          <div className="p-3 sm:p-4 border-b-[1px] border-[#eaeaf1] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="border-[1px] flex gap-2 items-center px-1 py-[4px] w-full sm:w-[40%] border-[#eaeaf1] rounded-md">
              <IconStore.search className="size-4 stroke-[#343432] stroke-4" />
              <input
                type="text"
                placeholder="search by customer name or phone number"
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                onBlur={(e) => handleInputBlurOrEnter(e, true)}
                onKeyPress={(e) => handleInputBlurOrEnter(e)}
                className="outline-none  placeholder:font-[300] placeholder:opacity-50 text-xs sm:text-sm w-full"
              />
            </div>
          </div>

          {/* User count and pagination controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <p className="p-3 sm:p-4 text-xs sm:text-sm text-[#343432] border-b-[1px] sm:border-b-0 sm:border-r-[1px] border-[#eaeaf1] font-medium w-full sm:w-auto">
              {metaDetails?.total} users
            </p>

            <div className="flex flex-wrap sm:flex-nowrap justify-between w-full sm:w-auto border-t-[1px] sm:border-t-0 sm:border-l-[1px] p-3 sm:pl-4 border-[#eaeaf1] items-center text-[#343432] text-xs sm:text-sm">
              <div className="flex items-center mb-2 sm:mb-0 mr-0 sm:mr-4">
                <span className="mr-2">View</span>
                <CustomSelect
                  selectedValue={viewOptions.selectedOption}
                  options={viewOptions.options}
                  onSelect={viewOptions.onChange}
                  textSize="text-xs sm:text-sm"
                  buttonPadding="px-[10px] py-[4px]"
                  dropdownItemPadding="py-1 pl-2 pr-6"
                />
              </div>

              <div className="flex items-center mb-2 sm:mb-0 mr-0 sm:mr-4">
                <span className="mr-2">Page</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={handlePageInputChange}
                  className="w-8 h-8 text-center border border-[#eaeaf1] rounded mx-1"
                />
                <span>of {totalPages}</span>
              </div>

              <div className="flex items-center sm:border-l border-[#eaeaf1] sm:pl-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-1 ${
                    currentPage === 1 ? "text-gray-300" : "hover:bg-gray-100"
                  }`}
                >
                  <IconStore.chevronLeft />
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-1 ${
                    currentPage === totalPages
                      ? "text-gray-300"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <IconStore.chevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:gap-4 flex-grow max-md:pb-10 overflow-auto">
          <div className="min-h-0 overflow-auto">
            <TableView
              headerClassName={headerClassName}
              rowClassName={rowClassName}
              currentUsers={travelCustomerValues}
              handleEditClick={handleEditClick}
              handleDeleteClick={handleDeleteClick}
              loading={isLoading}
            />
          </div>
          <Button
            label="+ Add Users"
            onClick={() => {
              setUserViewPopup({
                show: true,
                type: "add",
              });
            }}
            classNames={{
              root: "bg-[#343432] text-white w-fit px-4 py-2 text-xs sm:text-sm",
            }}
          />
        </div>
      </div>
      <RightViewModal
        show={userViewPopup?.show}
        onClose={handleClosePopup}
        className={"md:!w-[600px]"}
        outSideClickClose={false}
      >
        <AddEditUser
          type={userViewPopup?.type}
          userDetails={editUserValues}
          onClose={handleClosePopup}
          fetchCountries={fetchCountries}
        />
      </RightViewModal>

      {deleteConfirmPopup && (
        <DeleteConfirmation
          content="Are you sure you want to delete this user"
          handleClose={() => setDeleteConfirmPopup(false)}
          handleDelete={() => handleDeleteCall()}
          loader={deleteLoader}
        />
      )}
    </div>
  );
};

export default MyTeamView;
