import React, { useEffect, useState } from "react";
import Button from "@/components/commonComponents/button";
import FormFields from "@/components/formFieldsComponent";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import {
  addTeamMembers,
  fetchCityBasedonCountry,
  fetchUserDetails,
  getAllPermissions,
  getDialingCode,
  updateTeamMembers,
} from "@/utils/apiHandler/request";
import { toast } from "react-toastify";
import FooterButton from "@/components/footerButton";
import { InfoIcon } from "lucide-react";
import useCountryCodes from "@/Hooks/useCountryCodes";

const AddEditUser = ({
  onClose,
  type,
  userDetails = {},
  fetchCountries = [],
}) => {
  const {
    id = "",
    first_name = "",
    last_name = "",
    email = "",
    phone_number = "",
    country_code = "+91",
    permissions = "",
  } = userDetails;

  const editType = type === "edit";
  const [loader, setLoader] = useState(false);
  const [phoneCodeOptions, setPhoneCodeOptions] = useState([]);
  const [permissionValues, setPermissionValues] = useState([]);

  // Convert existing permissions string to array for edit mode
  const existingPermissions = permissions;
  // editType && permissions
  //   ? permissions.split(",").map((p) => parseInt(p.trim()))
  //   : [];
  console.log(
    existingPermissions,
    permissions,
    country_code,
    "existingPermissionsexistingPermissions",
    userDetails
  );
  const [formFieldValues, setFormFieldValues] = useState({
    first_name: first_name,
    last_name: last_name,
    email: email,
    phone_number: phone_number,
    country_code: country_code,
    password: "",
    confirm_password: "",
    permissions: existingPermissions,
  });

  const handleChange = (e, key, type) => {
    const selectType = type === "select";
    const value = selectType ? e : e.target.value;
    setFormFieldValues({ ...formFieldValues, [key]: value });
  };

  // Special handler for permissions checkbox
  const handlePermissionChange = (e, key) => {
    const selectedPermissions = e.target.value; // This will be an array from checkbox component
    setFormFieldValues({ ...formFieldValues, [key]: selectedPermissions });
  };

  const getPermission = async () => {
    try {
      const permission = await getAllPermissions();
      const permissionKeys = permission?.permissions?.map((item) => {
        return {
          value: item?.id,
          label: item?.description,
        };
      });
      setPermissionValues(permissionKeys || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    }
  };

  const fetchPhoneCodeOptions = async () => {
    const { allCountryCodeOptions } = useCountryCodes();
    setPhoneCodeOptions(allCountryCodeOptions);
  };

  useEffect(() => {
    fetchPhoneCodeOptions();
    getPermission();
  }, []);

  const isFormValid = () => {
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "country_code",
      "password",
      "confirm_password",
    ];

    // Check if all required fields are filled
    const fieldsValid = requiredFields.every((field) => formFieldValues[field]);

    // Check password validations
    const passwordMinLength =
      formFieldValues.password && formFieldValues.password.length >= 8;
    const passwordsMatch =
      formFieldValues.password === formFieldValues.confirm_password;

    return fieldsValid && passwordMinLength && passwordsMatch;
  };

  // Helper function to get password error message
  const getPasswordError = () => {
    if (!formFieldValues.password) return "";
    if (formFieldValues.password.length < 8)
      return "Password must be at least 8 characters";
    return "";
  };

  // Helper function to get confirm password error message
  const getConfirmPasswordError = () => {
    if (!formFieldValues.confirm_password) return "";
    if (formFieldValues.password !== formFieldValues.confirm_password)
      return "Passwords do not match";
    return "";
  };

  // Updated field styling
  const fieldStyle =
    "w-full rounded-md border border-gray-300 p-3 text-gray-700 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all duration-200";

  // Form fields configuration - only required fields
  const userFormFields = [
    [
      {
        label: "First Name",
        type: "text",
        id: "first_name",
        mandatory: true,
        name: "first_name",
        value: formFieldValues?.first_name,
        onChange: (e) => handleChange(e, "first_name"),
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        placeholder: "Enter first name",
        rightIcon: formFieldValues?.first_name
          ? () => (
              <span className="text-green-500">
                <IconStore.circleTick className="size-5" />
              </span>
            )
          : null,
      },
    ],
    [
      {
        label: "Last Name",
        type: "text",
        id: "last_name",
        mandatory: true,
        name: "last_name",
        value: formFieldValues?.last_name,
        onChange: (e) => handleChange(e, "last_name"),
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        placeholder: "Enter last name",
        rightIcon: formFieldValues?.last_name
          ? () => (
              <span className="text-green-500">
                <IconStore.circleTick className="size-5" />
              </span>
            )
          : null,
      },
    ],
    [
      {
        label: "Email",
        type: "email",
        id: "email",
        mandatory: true,
        name: "email",
        value: formFieldValues?.email,
        onChange: (e) => handleChange(e, "email"),
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        placeholder: "Enter email address",
        rightIcon: formFieldValues?.email
          ? () => (
              <span className="text-green-500">
                <IconStore.circleTick className="size-5" />
              </span>
            )
          : null,
      },
    ],
    [
      {
        label: "Phone",
        type: "custom",
        id: "phone_section",
        customComponent: (
          <div className="flex space-x-2 w-full">
            <div className="w-1/3">
              <label className="text-sm text-gray-600 mb-1 block">
                Country Code
              </label>
              <FormFields
                formFields={[
                  {
                    type: "select",
                    id: "country_code",
                    name: "country_code",
                    value: formFieldValues?.country_code,
                    onChange: (e) => handleChange(e, "country_code", "select"),
                    className: `!py-2 !px-4 ${fieldStyle}`,
                    searchable: true,
                    options: phoneCodeOptions,
                  },
                ]}
              />
            </div>
            <div className="w-2/3">
              <label className="text-sm text-gray-600 mb-1 block">
                Phone Number
              </label>
              <FormFields
                formFields={[
                  {
                    type: "number",
                    id: "phone_number",
                    name: "phone_number",
                    value: formFieldValues?.phone_number,
                    onChange: (e) => handleChange(e, "phone_number"),
                    className: `!py-2 !px-4 ${fieldStyle}`,
                    placeholder: "Enter phone number",
                    rightIcon: formFieldValues?.phone_number
                      ? () => (
                          <span className="text-green-500">
                            <IconStore.circleTick className="size-5" />
                          </span>
                        )
                      : null,
                  },
                ]}
              />
            </div>
          </div>
        ),
      },
    ],
    [
      {
        label: "Password",
        type: "password",
        id: "password",
        mandatory: true,
        name: "password",
        value: formFieldValues?.password,
        onChange: (e) => handleChange(e, "password"),
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        placeholder: "Enter password (min 8 characters)",
        error: getPasswordError(),
        rightIcon:
          formFieldValues?.password && formFieldValues?.password.length >= 8
            ? () => (
                <span className="text-green-500">
                  <IconStore.circleTick className="size-5" />
                </span>
              )
            : null,
      },
    ],
    [
      {
        label: "Confirm Password",
        type: "password",
        id: "confirm_password",
        mandatory: true,
        name: "confirm_password",
        value: formFieldValues?.confirm_password,
        onChange: (e) => handleChange(e, "confirm_password"),
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        placeholder: "Confirm password",
        error: getConfirmPasswordError(),
        rightIcon:
          formFieldValues?.confirm_password &&
          formFieldValues?.password === formFieldValues?.confirm_password &&
          formFieldValues?.password.length >= 8
            ? () => (
                <span className="text-green-500">
                  <IconStore.circleTick className="size-5" />
                </span>
              )
            : null,
      },
    ],
    // Permissions checkbox field
    [
      {
        label: "Permissions",
        type: "checkbox",
        id: "permissions",
        name: "permissions",
        multiselect: true,
        value: formFieldValues?.permissions || [],
        onChange: handlePermissionChange,
        options: permissionValues,
        className: "border border-gray-300 rounded-md",
        labelClassName: "text-sm text-gray-600 mb-2 block font-medium",
        parentClassName: "w-full",
      },
    ],
  ];

  const handleSubmit = async () => {
    setLoader(true);

    // Convert permissions array to comma-separated string
    const permissionsString = Array.isArray(formFieldValues.permissions)
      ? formFieldValues.permissions.join(",")
      : "";

    const payload = {
      ...(editType && { user_id: id }),
      first_name: formFieldValues.first_name,
      last_name: formFieldValues.last_name,
      email: formFieldValues.email,
      country_code: formFieldValues.country_code,
      phone_number: parseInt(formFieldValues.phone_number),
      password: formFieldValues.password,
      confirm_password: formFieldValues.confirm_password,
      permissions: permissionsString,
    };

    try {
      if (!editType) {
        const response = await addTeamMembers("", "", "POST", payload);
        if (response?.success) {
          toast.success("User added successfully");
          onClose({ submit: true });
        } else {
          if (response?.message?.email) {
            toast.error(
              response?.message?.email?.[0] || "Error in adding user"
            );
          } else {
            toast.error("Error in adding user");
          }
        }
      } else {
        const response = await updateTeamMembers("", "", "PUT", payload);
        toast.success(`User ${editType ? "updated" : "added"} successfully`);
        onClose({ submit: true });
      }

    
    } catch (error) {
      toast.error(`Error in ${editType ? "updating" : "adding"} user`);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-2 h-full mx-auto rounded-lg relative bg-white shadow-lg">
      <div className="flex px-4 py-2 border-b border-gray-200 justify-between items-center">
        <h2 className="text-[15px] font-semibold text-gray-800">
          {editType ? "Edit User" : "Add New User"}
        </h2>
        <button
          onClick={() => onClose({ submit: false })}
          className="p-1 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200"
          aria-label="Close"
        >
          <IconStore.close className="size-5 text-gray-600" />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full">
        {/* First Name and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFields formFields={[userFormFields[0][0]]} />
          <FormFields formFields={[userFormFields[1][0]]} />
        </div>

        {/* Email */}
        <div className="w-full">
          <FormFields formFields={[userFormFields[2][0]]} />
        </div>

        {/* Phone Section */}
        <div className="w-full">
          <FormFields formFields={[userFormFields[3][0]]} />
        </div>

        {/* Password and Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFields formFields={[userFormFields[4][0]]} />
          <FormFields formFields={[userFormFields[5][0]]} />
        </div>

        {/* Permissions */}
        <div className="w-full">
          <FormFields formFields={[userFormFields[6][0]]} />
        </div>
      </div>

      <FooterButton
        isFormValid={isFormValid}
        onClose={() => onClose({ submit: false })}
        handleSubmit={handleSubmit}
        loader={loader}
      />
    </div>
  );
};

export default AddEditUser;
