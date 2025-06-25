import React, { useEffect, useState } from "react";
import Button from "@/components/commonComponents/button";
import FormFields from "@/components/formFieldsComponent";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import {
  fetchCityBasedonCountry,
  fetchUserDetails,
  getDialingCode,
} from "@/utils/apiHandler/request";
import { toast } from "react-toastify";
import FooterButton from "@/components/footerButton";
import { InfoIcon } from "lucide-react";

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
    mobile_number = "",
    phone_code = 91,
    address = "",
    city_id = "",
    zip_code = "",
    country_id = "",
    user_roles = [],
  } = userDetails;

  const editType = type === "edit";
  const [loader, setLoader] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [phoneCodeOptions, setPhoneCodeOptions] = useState([]);

  const [formFieldValues, setFormFieldValues] = useState({
    first_name: first_name,
    last_name: last_name,
    email: email,
    mobile_number: mobile_number,
    phone_code: phone_code,
    address: address,
    country: country_id,
    city: city_id,
    zipCode: zip_code,
    userRoles: user_roles,
  });

  const handleChange = (e, key, type) => {
    const selectType = type === "select";
    const value = selectType ? e : e.target.value;
    setFormFieldValues({ ...formFieldValues, [key]: value });
  };

  const fetchCityDetails = async (id) => {
    if (!id) return;
    try {
      const response = await fetchCityBasedonCountry("", { country_id: id });
      const cityField =
        response?.length > 0
          ? response?.map((list) => {
              return { value: list?.id, label: list?.name };
            })
          : [];
      setCityOptions(cityField);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to load cities");
    }
  };

  useEffect(() => {
    if (formFieldValues?.country) {
      fetchCityDetails(formFieldValues?.country);
    }
  }, [formFieldValues?.country]);

  const fetchPhoneCodeOptions = async () => {
    const response = await getDialingCode();
    const phoneCodeField = response?.data?.map((item) => {
      return {
        value: item?.phone_code,
        label: `${item?.country_short_name} ${item?.country_code}`,
      };
    });
    setPhoneCodeOptions(phoneCodeField);
  };

  useEffect(() => {
    fetchPhoneCodeOptions();
  }, []);

  const isFormValid = () => {
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "mobile_number",
      "country",
      "city",
      "zipCode",
    ];
    return requiredFields.every((field) => formFieldValues[field]);
  };

  // Prepare country and city lists for dropdown
  const countryList = fetchCountries?.map((list) => ({
    value: list?.id,
    label: list?.name,
  }));

  // Updated field styling to match AddEditAddress component
  const fieldStyle =
    "w-full rounded-md border border-gray-300 p-3 text-gray-700 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all duration-200";

  // Form fields configuration - now with city and zipcode included
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
            <div className="w-1/4">
              <FormFields
                formFields={[
                  {
                    type: "select",
                    id: "phone_code",
                    name: "phone_code",
                    value: formFieldValues?.phone_code,
                    onChange: (e) => handleChange(e, "phone_code", "select"),
                    className: `!py-2 !px-4 ${fieldStyle}`,
                    searchable: true,
                    options: phoneCodeOptions,
                  },
                ]}
              />
            </div>
            <div className="w-3/4">
              <FormFields
                formFields={[
                  {
                    type: "text",
                    id: "mobile_number",
                    label: "Phone Number",
                    name: "mobile_number",
                    value: formFieldValues?.mobile_number,
                    onChange: (e) => handleChange(e, "mobile_number"),
                    className: `!py-2 !px-4 ${fieldStyle}`,
                    placeholder: "Enter mobile number",
                    rightIcon: formFieldValues?.mobile_number
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
        label: "Address",
        type: "text",
        id: "address",
        name: "address",
        value: formFieldValues?.address,
        onChange: (e) => handleChange(e, "address"),
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        placeholder: "Enter address",
        rightIcon: formFieldValues?.address
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
        label: "Country",
        type: "select",
        searchable: true,
        mandatory: true,
        id: "country",
        name: "country",
        value: formFieldValues?.country,
        onChange: (e) => handleChange(e, "country", "select"),
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        options: countryList?.length
          ? countryList
          : [{ value: "", label: "Select Country" }],
      },
    ],
    [
      {
        label: "City",
        type: "select",
        id: "city",
        name: "city",
        searchable: true,
        mandatory: true,
        value: formFieldValues?.city,
        onChange: (e) => handleChange(e, "city", "select"),
        disabled: !formFieldValues?.country,
        className: `!py-2 !px-4 ${fieldStyle} ${
          !formFieldValues?.country ? "opacity-60" : ""
        }`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        options: cityOptions,
        rightIcon: formFieldValues?.city
          ? () => (
              <span className="text-green-500">
                <IconStore.circleTick className="size-5" />
              </span>
            )
          : null,
      },
      {
        label: "Zip Code",
        type: "text",
        mandatory: true,
        id: "zipCode",
        name: "zipCode",
        value: formFieldValues?.zipCode,
        onChange: (e) => handleChange(e, "zipCode"),
        className: `!py-2 !px-4 ${fieldStyle}`,
        labelClassName: "text-sm text-gray-600 mb-1 block",
        placeholder: "Enter postal code",
        rightIcon: formFieldValues?.zipCode
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
        type: "checkbox",
        name: "userRoles",
        label: "Select the roles you wish to be granted to the user",
        multiselect: true,
        value: formFieldValues?.userRoles,
        mandatory: true,
        options: [
          {
            value: "admin_users",
            label: "Administrate users",
          },
          {
            value: "admin_inventory",
            label: "Administrate inventory",
          },
          {
            value: "admin_sales",
            label: "Administrate sales",
          },
          {
            value: "view_reports",
            label: "View reports",
          },
          {
            value: "admin_tx_pay",
            label: "Administrate tx pay",
          },
          {
            value: "admin_tx_trade",
            label: "Administrate tx trade",
          },
          {
            value: "admin_settings",
            label: "Administrate settings",
          },
          {
            value: "order_email",
            label: "Order email",
          },
          {
            value: "user_specific_data",
            label: "User specific data",
          },
          {
            value: "virtual_cards",
            label: "Virtual cards",
          },
        ],
        onChange: (e, keyValue) => {
          // Fix: Use e.target.value which contains the updated array
          console.log("Multi checkbox changed:", e.target.value, keyValue);
          setFormFieldValues({
            ...formFieldValues,
            userRoles: e.target.value, // Use e.target.value instead of keyValue
          });
        },
      },
    ],
  ];

  const handleSubmit = async () => {
    setLoader(true);
    const payload = {
      first_name: formFieldValues.first_name,
      last_name: formFieldValues.last_name,
      email: formFieldValues.email,
      mobile_number: formFieldValues.mobile_number,
      phone_code: formFieldValues.phone_code,
      address: formFieldValues.address,
      city: formFieldValues.city,
      zip_code: formFieldValues.zipCode,
      country: formFieldValues.country,
    };

    try {
      const response = await fetchUserDetails(
        "",
        editType ? id : "",
        editType ? "PUT" : "POST",
        payload
      );
      toast.success(`User ${editType ? "updated" : "added"} successfully`);
      onClose({ submit: true });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFields formFields={[userFormFields[0][0]]} />
          <FormFields formFields={[userFormFields[1][0]]} />
        </div>

        <div className="w-full">
          <FormFields formFields={[userFormFields[2][0]]} />
        </div>

        <div className="w-full">
          <FormFields formFields={[userFormFields[3][0]]} />
        </div>

        <div className="w-full">
          <FormFields formFields={[userFormFields[4][0]]} />
        </div>

        <div className="w-full">
          <FormFields formFields={[userFormFields[5][0]]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFields formFields={[userFormFields[6][0]]} />
          <FormFields formFields={[userFormFields[6][1]]} />
        </div>
        <div className="grid grid-cols-1  gap-4">
          <FormFields formFields={[userFormFields[7][0]]} />
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
