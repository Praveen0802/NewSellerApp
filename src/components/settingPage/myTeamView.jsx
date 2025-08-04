  import { IconStore } from "@/utils/helperFunctions/iconStore";
  import React, { useState, useEffect, useMemo } from "react";
  import CustomSelect from "../commonComponents/customSelect";
  import Button from "../commonComponents/button";
  import TableView from "./components/tableView";
  import RightViewModal from "../commonComponents/rightViewModal";
  import AddEditUser from "./components/addEditUser";
  import {
    DeleteUserDetails,
    editUserDetails,
    fetchUserDetails,
  } from "@/utils/apiHandler/request";
  import DeleteConfirmation from "../commonComponents/deleteConfirmation";
  import { toast } from "react-toastify";

  const MyTeamView = (props) => {
    const { userDetails, fetchCountries } = props;
    const { my_teams = [], meta = {} } = userDetails || {};
    const [metaDetails, setMetaDetails] = useState(meta);
    console.log(props, "my_teams", my_teams, fetchCountries);
    
    const [travelCustomerValues, setTravelCustomerValues] = useState(my_teams);
    const [deleteLoader, setDeleteLoader] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [userViewPopup, setUserViewPopup] = useState({
      show: false,
      type: "",
    });
    const [editUserValues, setEditUserValues] = useState("");
    const [searchText, setSearchText] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [deleteConfirmPopup, setDeleteConfirmPopup] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Fuzzy search implementation
    const fuzzySearchUsers = (users, searchTerm) => {
      if (!searchTerm || searchTerm.trim() === '') {
        return users;
      }

      const lowercaseSearchTerm = searchTerm.toLowerCase().trim();
      const searchWords = lowercaseSearchTerm.split(' ').filter(word => word.length > 0);
      
      return users.filter(user => {
        const searchableText = [
          user.first_name || '',
          user.last_name || '',
          user.email || '',
          user.phone_number || '',
          user.country_code || ''
        ].join(' ').toLowerCase();
        
        // Check if all search words are found in the searchable text
        return searchWords.every(word => searchableText.includes(word));
      });
    };

    // Filter users based on search
    const filteredUsers = useMemo(() => {
      return fuzzySearchUsers(travelCustomerValues, searchText);
    }, [travelCustomerValues, searchText]);

    // Calculate pagination for filtered results
    const totalFilteredUsers = filteredUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalFilteredUsers / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Update current page when search changes
    useEffect(() => {
      setCurrentPage(1);
    }, [searchText]);

    // Reset pagination when items per page changes
    useEffect(() => {
      setCurrentPage(1);
    }, [itemsPerPage]);

    const viewOptions = {
      options: [
        { value: "10", label: "10" },
        { value: "20", label: "20" },
        { value: "50", label: "50" },
      ],
      selectedOption: itemsPerPage?.toString(),
      onChange: (value) => {
        setItemsPerPage(parseInt(value));
      },
    };

    const handleApiCall = async (params) => {
      setIsLoading(true);
      const response = await fetchUserDetails("", "", "GET", "", params);
      setTravelCustomerValues(response?.my_teams);
      setMetaDetails(response?.meta);
      setIsLoading(false);
    };

    // Initial data fetch
    useEffect(() => {
      if (metaDetails?.current_page) {
        setCurrentPage(metaDetails.current_page);
      }
      if (metaDetails?.per_page) {
        setItemsPerPage(metaDetails.per_page);
      }
    }, [metaDetails?.current_page, metaDetails?.per_page]);

    const handlePrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    const handlePageInputChange = (e) => {
      const page = parseInt(e.target.value) || 1;
      if (page > 0 && page <= totalPages && totalPages > 0) {
        setCurrentPage(page);
      } else if (page > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else {
        setCurrentPage(1);
      }
    };

    const handleClosePopup = async (submit) => {
      if (submit?.submit) {
        // Refresh data after adding/editing user
        handleApiCall({
          page: 1,
          per_page: 50, // Fetch more data for better client-side search
        });
      }
      setUserViewPopup({ show: false, type: "" });
      setEditUserValues();
    };

    const handleEditClick = async (item) => {
      setIsLoading(true);
      const response = await editUserDetails("", "GET", {
        user_id: item?.id,
      });
      setEditUserValues({ id: item?.id, ...response });
      setUserViewPopup({
        show: true,
        type: "edit",
      });
      setIsLoading(false);
    };

    const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchText(value);
    };

    const handleDeleteClick = async (item) => {
      setDeleteId(item?.id);
      setDeleteConfirmPopup(true);
    };

    const handleDeleteCall = async () => {
      setDeleteLoader(true);
      await DeleteUserDetails("", deleteId, "DELETE");
      toast.success("User deleted successfully");
      
      // Remove deleted user from local state
      setTravelCustomerValues(prev => prev.filter(user => user.id !== deleteId));
      
      setDeleteConfirmPopup(false);
      setDeleteLoader(false);
    };

    const handleClearSearch = () => {
      setSearchText("");
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
              <div className="border-[1px] flex gap-2 items-center px-1 py-[4px] w-full sm:w-[40%] border-[#eaeaf1] rounded-md relative">
                <IconStore.search className="size-4 stroke-[#343432] stroke-4" />
                <input
                  type="text"
                  placeholder="Search by name, email or phone number"
                  onChange={handleSearchChange}
                  value={searchText}
                  className="outline-none placeholder:font-[300] placeholder:opacity-50 text-xs sm:text-sm w-full"
                />
                {searchText && (
                  <button
                    onClick={handleClearSearch}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchText && (
                <div className="text-xs text-gray-600">
                  {totalFilteredUsers} of {travelCustomerValues.length} users found
                </div>
              )}
            </div>

            {/* User count and pagination controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <p className="p-3 sm:p-4 text-xs sm:text-sm text-[#343432] border-b-[1px] sm:border-b-0 sm:border-r-[1px] border-[#eaeaf1] font-medium w-full sm:w-auto">
                {searchText ? `${totalFilteredUsers} filtered` : `${travelCustomerValues.length} total`} users
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

                {totalPages > 1 && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 flex-grow max-md:pb-10 overflow-auto">
            <div className="min-h-0 overflow-auto">
              {paginatedUsers.length === 0 && searchText ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No users found matching "{searchText}"</p>
                  <button
                    onClick={handleClearSearch}
                    className="text-blue-600 hover:text-blue-800 text-xs mt-2 underline"
                  >
                    Clear search to see all users
                  </button>
                </div>
              ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                <TableView
                  headerClassName={headerClassName}
                  rowClassName={rowClassName}
                  currentUsers={paginatedUsers}
                  handleEditClick={handleEditClick}
                  handleDeleteClick={handleDeleteClick}
                  loading={isLoading}
                />
              )}
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