import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const LabelInput = ({
  label,
  value,
  isDisabled,
  message,
  valueClassName,
  handleChange,
}: {
  label: string;
  value: string;
  isDisabled: boolean;
  message?: string;
  valueClassName?: string;
  handleChange: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="flex flex-col ">
      <label
        className="block mb-2 text-xl font-bold text-gray-900 dark:text-gray-300"
        htmlFor={label}
      >
        {label}
      </label>
      {isDisabled ? (
        value && (
          <div
            className={cn(
              "truncate overflow-x-hidden max-w-full",
              valueClassName
            )}
          >
            {value}
          </div>
        )
      ) : (
        <input
          id={label}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
      )}
      {message && !isDisabled && (
        <p className="text-xs text-gray-500 p-3">*{message}</p>
      )}
    </div>
  );
};

export default LabelInput;
