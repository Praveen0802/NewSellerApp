import React, { useState } from "react";
import Button from "../commonComponents/button";
import { changePasswordRequest } from "@/utils/apiHandler/request";
import FormFields from "../formFieldsComponent";
import { toast } from "react-toastify";
import { getAuthToken } from "@/utils/helperFunctions";

const ChangePassword = (props) => {
  const { profileDetails } = props;
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e, key) => {
    const value = e.target.value;
    setError("");
    setPasswordData({ ...passwordData, [key]: value });
  };

  const handleSubmit = async () => {
    if (passwordData?.newPassword != passwordData?.confirmPassword) {
      setError("Password and confirm password does not match");
      return;
    }
    setError("");
    setIsSubmitting(true);
    const payload = {
      // email: profileDetails?.email,
      password: passwordData?.newPassword,
      confirm_password: passwordData?.confirmPassword,
    };
    await changePasswordRequest(getAuthToken(), payload);
    toast.success("Password Changed Successfully");
    setPasswordData({ newPassword: "", confirmPassword: "" });
  };

  const formFields = [
    {
      className: "!py-[6px] !px-[10px] !text-[#343432] !text-[13px]", // Added w-full for mobile
      autoComplete: "new-password",
      id: "newPassword",
      name: "newPassword",
      type: "password",
      label: "Password",
      value: passwordData?.newPassword,
      onChange: handleChange,
      placeholder: "Enter new password",
    },
    {
      className: "!py-[6px] !px-[10px] !text-[#343432] !text-[13px]", // Added w-full for mobile
      autoComplete: "new-password",
      id: "confirmPassword",
      name: "confirmPassword",
      type: "password",
      label: "Confirm Password",
      value: passwordData?.confirmPassword,
      onChange: handleChange,
      placeholder: "Confirm your new password",
    },
  ];

  const enabled =
    passwordData?.newPassword &&
    passwordData?.confirmPassword &&
    !isSubmitting &&
    passwordData?.newPassword === passwordData?.confirmPassword;

  return (
    <div className="h-[90%] max-w-full">
      <p className="pb-4 text-base sm:text-lg md:text-xl p-3 md:p-4 font-semibold">
        Change Password
      </p>
      <div className="bg-white border-[1px] border-[#eaeaf1] h-full">
        <div className="p-3 md:p-6 flex flex-col gap-4 md:gap-6 border-[1px] border-[#eaeaf1]">
          <h3 className="text-base md:text-lg font-medium">Account password</h3>
          <p className="text-gray-600 font-medium text-sm md:text-base">
            Change your account password
          </p>
          <div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-[60%]">
              <FormFields formFields={formFields} className="w-full" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>

          <Button
            label="Submit"
            type="primary"
            onClick={handleSubmit}
            classNames={{
              root: `py-1 px-3 md:px-[14px] w-fit transition-all duration-200 ${"bg-[#343432] hover:bg-[#0f0053]"}`,
              label_: `text-xs md:text-sm font-normal ${"text-white"}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
