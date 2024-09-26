import React from "react";
import InputOTPComponent from "./InputOTPComponent";
import { User } from "firebase/auth";

const CodeSignUp = ({
  currentUser,
  verificationCodeId,
}: {
  currentUser: User;
  verificationCodeId: string;
}) => {
  const getCode = (code: string) => {
    console.log(code);
  };
  return (
    <div className="flex flex-col gap-4">
      <InputOTPComponent getCode={getCode} />
    </div>
  );
};

export default CodeSignUp;
