import React, { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "./ui/button";

const InputOTPComponent = ({
  getCode,
}: {
  getCode: (code: string) => void;
}) => {
  const [code, setCode] = useState("");
  return (
    <div className="">
      <InputOTP maxLength={6} value={code} onChange={setCode}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <Button onClick={() => getCode(code)}>Submit</Button>
    </div>
  );
};

export default InputOTPComponent;
