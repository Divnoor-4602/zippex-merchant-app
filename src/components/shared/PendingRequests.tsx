"use client";

import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const PendingRequests = () => {
  // use query to fetch pending orders

  const router = useRouter();

  return (
    <>
      <Button
        className="h-[30px] text-xs"
        variant={"outline"}
        onClick={() => router.push("/dashboard/pending-requests")}
      >
        Pending orders
      </Button>
    </>
  );
};

export default PendingRequests;
