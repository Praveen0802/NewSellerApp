import React from "react";
import FloatingLabelInput from "../../floatinginputFields";
import PhoneInputComponent from "../../commonComponents/phoneInputComponent";
import FloatingSelect from "@/components/floatinginputFields/floatingSelect";

const AccounInfoForm = ({
  formData,
  handleChange,
  countryCode,
  handleCountryCodeChange,
  countryCodeValues,
  disabled,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-[90%] lg:w-[80%]">
      <FloatingLabelInput
        id="firstName"
        name="firstName"
        type="text"
        label="First Name"
        keyValue={"firstName"}
        value={formData?.firstName}
        className="!py-[6px] !px-[10px] !text-[#343432] !text-[13px]"
        onChange={handleChange}
        readOnly={disabled}
        required
      />
      <FloatingLabelInput
        id="lastName"
        name="lastName"
        type="text"
        keyValue={"lastName"}
        label="Last Name"
        value={formData?.lastName}
        className="!py-[6px] !px-[10px] !text-[#343432] !text-[13px]"
        onChange={handleChange}
        readOnly={disabled}
        required
      />
      <FloatingLabelInput
        id="email"
        name="email"
        type="email"
        label="email address"
        keyValue={"email"}
        readOnly
        value={formData?.email}
        className="!py-[6px] !px-[10px] !text-[#343432] !text-[13px]"
        onChange={handleChange}
        required
      />

      <div className="flex gap-2 items-center">
        <div className="md:w-[140px]">
          <FloatingSelect
            id="phone_code"
            name="phone_code"
            keyValue={"phone_code"}
            type="text"
            label=""
            disabled={disabled}
            selectedValue={countryCode}
            onSelect={handleCountryCodeChange}
            searchable={true}
            options={countryCodeValues}
            paddingClassName="!py-[6px] !px-[10px] "
            placeholder="+1"
            className={" !text-[#343432] !text-[13px]"}
          />
        </div>
        <div className="w-full">
          <FloatingLabelInput
            id="phoneNumber"
            name="phoneNumber"
            keyValue={"phoneNumber"}
            type="number"
            label="Mobile Number"
            value={formData?.phoneNumber}
            onChange={handleChange}
            readOnly={disabled}
            className="!py-[6px] !px-[10px] !text-[#343432] !text-[13px]"
          />
        </div>
      </div>

      {/* <PhoneInputComponent
        value={formData?.phoneNumber}
        onChange={handleChange}
        readOnly={disabled}
        countryCode={countryCode}
        keyValue="phoneNumber"
        onCountryCodeChange={handleCountryCodeChange}
        countryCodeValues={countryCodeValues}
        placeholder="Phone number"
      /> */}
    </div>
  );
};

export default AccounInfoForm;
