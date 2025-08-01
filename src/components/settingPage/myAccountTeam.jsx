import {
  fetchProfileDetails,
  updateProfileDetails,
} from "@/utils/apiHandler/request";
import { useState, useCallback } from "react";
import Button from "../commonComponents/button";
import AccounInfoForm from "./components/accounInfoForm";
import { toast } from "react-toastify";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import { getAuthToken } from "@/utils/helperFunctions";
import useCountryCodes from "@/Hooks/useCountryCodes";
import { updateCurrentUser } from "@/utils/redux/currentUser/action";
import { useDispatch } from "react-redux";

const MyAccountTeam = (props) => {
  const { profileDetails } = props;
  console.log(profileDetails, "profileDetailsprofileDetailsprofileDetails");
  const initialValues = {
    firstName: profileDetails?.first_name,
    lastName: profileDetails?.last_name,
    email: profileDetails?.email,
    phoneNumber: profileDetails?.phone_number,
  };

  // const countryCodeValues = props?.dialingCode?.data?.map((item) => {
  //   return {
  //     value: `${item?.country_code}`,
  //     label: `${item?.country_short_name} ${item?.country_code}`,
  //   };
  // });

  const { allCountryCodeOptions } = useCountryCodes();

  const dispatch = useDispatch()

  const [formData, setFormData] = useState(initialValues);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [edit, setEdit] = useState(false);

  const handleChange = (e, key) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [countryCode, setCountryCode] = useState(
    `+${profileDetails?.country_code}`
  );

  const handleCountryCodeChange = (code) => {
    setCountryCode(code);
  };

  const updateProfileDetailsSubmit = async () => {
    setSubmitLoader(true);
    const payload = {
      first_name: formData?.firstName,
      last_name: formData?.lastName,
      email: formData?.email,
      phone_number: formData?.phoneNumber,
      country_code: countryCode?.replace("+", ""),
    };
    try {
      const response = await updateProfileDetails(
        getAuthToken(),
        "PUT",
        payload
      );
      console.log(response,'responseresponse')
      dispatch(updateCurrentUser(response));
      toast.success("Account information updated successfully.");
      setEdit(false); // Close edit mode after successful update
    } catch (error) {
      console.log("ERROR in updateProfileDetailsSubmit", error);
      toast.error("Failed to update account information");
    } finally {
      setSubmitLoader(false);
    }
  };

  const handleEditClick = () => {
    setEdit(true);
  };

  return (
    <div className="h-[90%] max-w-full">
      <p className="pb-4 text-base sm:text-lg md:text-xl p-3 md:p-4 font-medium">
        My Account
      </p>
      <div className="bg-white border-[1px] border-[#eaeaf1] h-full">
        <div className="p-3 md:p-6 border-b-[1px] border-[#eaeaf1]">
          <h3 className="text-base md:text-lg font-medium mb-3 md:mb-5">
            Account information
          </h3>
          <div className="flex flex-col gap-4 md:gap-6">
            <AccounInfoForm
              formData={formData}
              handleChange={handleChange}
              countryCode={countryCode}
              handleCountryCodeChange={handleCountryCodeChange}
              countryCodeValues={allCountryCodeOptions}
              disabled={!edit}
            />
            <div className="flex max-md:w-[50%] gap-3 items-center">
              {edit ? (
                <>
                  <Button
                    type="secondary"
                    label="Cancel"
                    onClick={() => {
                      setEdit(false);
                      setFormData(initialValues);
                    }}
                    classNames={{
                      root: "w-full sm:w-auto border-[1px] justify-center border-[#022B50] py-1 px-3 md:px-[14px]",
                      label_: "text-xs md:text-sm text-center font-medium",
                    }}
                  />
                  <Button
                    label="Submit"
                    onClick={updateProfileDetailsSubmit}
                    loading={submitLoader}
                    classNames={{
                      root: "w-full sm:w-auto bg-[#343432] justify-center py-1 px-3 md:px-[14px] sm:mt-0",
                      label_:
                        "text-xs md:text-sm text-center text-white font-normal",
                    }}
                  />
                </>
              ) : (
                <Button
                  label="Edit"
                  onClick={() => {
                    handleEditClick();
                  }}
                  // iconBefore={<IconStore.pencilEdit className="stroke-white" />}
                  loading={submitLoader}
                  classNames={{
                    root: "w-full sm:w-auto bg-[#343432] justify-center py-1 px-3 md:px-[14px] sm:mt-0",
                    label_:
                      "text-xs md:text-sm text-center text-white font-normal",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountTeam;
