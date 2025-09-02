import React from 'react';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import clsx from 'clsx';

/*
Props:
  value: complete phone number string including country code (without + stored)
  onChange: (dialCode, numberWithoutDialCode, fullNumberString, country) => void
  error: error message
  label: floating label text
*/
const PhoneInputField = ({
  value = '',
  onChange,
  error,
  label = 'Phone',
  required = true,
  nameCodeKey = 'phone_country_code',
  nameNumberKey = 'phone_number',
  formData,
  setFormData,
  errorRef,
  paddingClassName = 'px-3 py-[14px]',
  disabled = false,
}) => {
  // value kept as country code (dialCode) separate + phone number per existing form structure
  const handleChange = (val, country, e, formattedValue) => {
    // val is full string without + (e.g., 441234567890)
    // country.dialCode e.g., '44'
    const dialCode = country?.dialCode || '';
    const nationalNumber = val.startsWith(dialCode)
      ? val.slice(dialCode.length)
      : val;

    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        [nameCodeKey]: dialCode ? `+${dialCode}` : '',
        [nameNumberKey]: nationalNumber,
      }));
    }

    if (onChange) {
      onChange({ target: { value: `+${dialCode}` } }, nameCodeKey);
      onChange({ target: { value: nationalNumber } }, nameNumberKey);
    }
  };

  const combinedValue = (() => {
    const dial = (formData?.[nameCodeKey] || '').replace('+', '');
    const num = formData?.[nameNumberKey] || '';
    if (!dial) return num; // library will infer default country
    return `${dial}${num}`;
  })();

  return (
    <div ref={errorRef} className={clsx('w-full', disabled && 'opacity-60')}>
      {label && (
        <div className="mb-2">
          <label className="text-[14px] font-medium text-gray-800">
            {label}
          </label>
        </div>
      )}
      <div className={clsx('relative react-tel-wrapper-custom', error && 'has-error')}>
        <PhoneInput
          country={'us'}
          value={combinedValue}
          onChange={handleChange}
          disableDropdown={false}
          countryCodeEditable={false}
          disabled={disabled}
          inputClass={clsx(
            '!w-full !bg-white !border !rounded-md !outline-none !shadow-none',
            '!text-[14px] !font-normal !text-[#231F20]',
            '!pl-14 !pr-3 !h-[46px]',
            paddingClassName,
            error
              ? '!border-red-500 focus:!border-red-500'
              : '!border-[#DADBE5] focus:!border-indigo-300 focus:!ring-1 focus:!ring-indigo-300'
          )}
          buttonClass={clsx(
            '!border !border-r !border-[#DADBE5] !bg-white !rounded-l-md !rounded-r-none',
            'hover:!bg-gray-50 focus:!outline-none'
          )}
          containerClass={clsx(
            '!w-full !relative !z-40 !border-0',
            'phone-input-container'
          )}
          dropdownClass={clsx(
            '!text-sm !shadow-lg !rounded-md !border !border-gray-200 !z-[999] !bg-white',
            '!min-w-[240px] !w-auto'
          )}
          searchClass="!p-2 !text-sm"
          enableSearch={true}
          searchPlaceholder="Search"
        />
        {error && (
          <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};

export default PhoneInputField;
