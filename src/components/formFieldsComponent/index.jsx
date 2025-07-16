import React, { Fragment } from "react";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import FloatingLabelInput from "../floatinginputFields";
import FloatingFileUpload from "../floatinginputFields/floatingFIleUpload";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import FloatingCheckbox from "../floatinginputFields/floatingCheckBox";
import SearchableDropdown from "../floatinginputFields/searchableDropdown";

const FormFields = ({ formFields }) => {
  return (
    <>
      {formFields?.map((field, index) => {
        const {
          type = "",
          label,
          hideLabel = false,
          id,
          name,
          value,
          onChange,
          className,
          labelClassName,
          mandatory,
          disabled,
          readOnly,
          options,
          searchable,
          hideCalendarIcon = false,
          onBlur,
          placeholder,
          error,
          rightIcon,
          accept,
          buttonText,
          allowedFileTypes,
          maxFileSize,
          render,
          customComponent,
          parentClassName = "",
          singleDateMode = false,
          beforeIcon,
          afterIcon,
          checked,
          showDropdown,
          dropDownComponent,
          icon,
          count,
          multiselect = false,
          onKeyDown = () => {},
        } = field;

        const keyValue = field?.name || field?.key || id;

        return (
          <Fragment key={`${keyValue || index}`}>
            {type === "select" ? (
              <FloatingSelect
                label={label}
                id={id}
                name={name}
                keyValue={keyValue}
                options={options || []}
                mandatory={mandatory}
                selectedValue={value}
                multiselect={multiselect}
                labelClassName={labelClassName}
                searchable={searchable}
                disabled={disabled}
                onSelect={onChange}
                placeholder={placeholder}
                error={error}
                paddingClassName={className}
                hideLabel={hideLabel}
                className={parentClassName}
              />
            ) : type === "checkbox" ? (
              <FloatingCheckbox
                id={id}
                name={name}
                keyValue={keyValue}
                label={label}
                checked={checked || value}
                onChange={onChange}
                className={className}
                labelClassName={labelClassName}
                parentClassName={parentClassName}
                disabled={disabled}
                beforeIcon={beforeIcon}
                afterIcon={afterIcon}
                count={count}
                options={options || []}
                multiselect={multiselect}
                value={value}
                error={error}
                mandatory={mandatory}
              />
            ) : type === "text" || type === "password" || type === "email" ? (
              <FloatingLabelInput
                id={id}
                name={name}
                keyValue={keyValue}
                type={type}
                onBlur={onBlur}
                label={label}
                showDropdown={showDropdown}
                labelClassName={labelClassName}
                hideLabel={hideLabel}
                mandatory={mandatory}
                dropDownComponent={dropDownComponent}
                readOnly={readOnly || disabled}
                className={className}
                value={value}
                onChange={onChange}
                autoComplete="off"
                required={mandatory}
                placeholder={placeholder}
                error={error}
                rightIcon={rightIcon}
                onKeyDown={onKeyDown}
              />
            ) : type === "file" ? (
              <FloatingFileUpload
                id={id}
                name={name}
                keyValue={keyValue}
                label={label}
                labelClassName={labelClassName}
                mandatory={mandatory}
                disabled={disabled}
                className={className}
                value={value}
                onChange={onChange}
                accept={accept}
                buttonText={buttonText || "Upload File"}
                allowedFileTypes={allowedFileTypes}
                maxFileSize={maxFileSize || 5}
                error={error}
              />
            ) : type === "date" ? (
              <FloatingDateRange
                id={name}
                name={name}
                keyValue={name}
                parentClassName={parentClassName}
                label={label}
                className={className}
                hideLabel={hideLabel}
                value={value}
                hideCalendarIcon={hideCalendarIcon}
                labelClassName={labelClassName}
                onChange={onChange}
                singleDateMode={singleDateMode}
              />
            ) : type === "custom" && customComponent ? (
              <div className="w-full">{customComponent}</div>
            ) : render ? (
              render()
            ) : (
              <></>
            )}
          </Fragment>
        );
      })}
    </>
  );
};

export default FormFields;
