"use client";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const StoreStatus = () => {
  const user = auth.currentUser;
  const queryClient = useQueryClient();
  const merchantDocRef = doc(db, "merchants", user!.uid);
  const [storeStatus, setStoreStatus] = React.useState<boolean>(false);

  const {
    data: merchantData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["merchantData"],
    queryFn: async () => {
      const merchantDoc = (await getDoc(merchantDocRef)).data();
      if (!merchantDoc) {
        throw new Error("Merchant not found");
      }
      setStoreStatus((prev: any) => merchantDoc.isStoreAvailable);
      return merchantDoc;
    },
  });

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      await updateDoc(merchantDocRef, {
        isStoreAvailable: !merchantData?.isStoreAvailable,
      });
    },
    onMutate: async () => {
      // cancel any ongoing queries
      await queryClient.cancelQueries({
        queryKey: ["merchantData"],
        type: "all",
      });

      // get the previous data
      const previousData: any = queryClient.getQueryData(["merchantData"]);

      // setting new query data
      queryClient.setQueryData(["merchantData"], () => {
        const newData = {
          ...previousData,
          isStoreAvailable: !merchantData?.isStoreAvailable,
        };

        return newData;
      });

      // otherwise return the previous data
      return previousData;
    },
    onSuccess: (data) => {
      // update the cached data
      toast.success("Store status updated successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occurred while updating the store status");
    },
    onSettled: () => {
      queryClient.refetchQueries(
        {
          queryKey: ["merchantData"],
          type: "all",
        },
        {
          throwOnError: true,
        }
      );
    },
  });

  if (error) {
    console.log(error);
    return <div>Some error occured, kindly reload the page.</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <h3 className="font-semibold text-sm">
        Store{" "}
        {merchantData?.isStoreAvailable ? (
          <span className="text-green-500 bg-green-200 p-1 rounded-md">
            Open
          </span>
        ) : (
          <span className="text-red-500 bg-red-200 p-1 rounded-md">Closed</span>
        )}
      </h3>
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Switch
          className=""
          checked={merchantData?.isStoreAvailable}
          onClick={() => mutate()}
        />
      )}
    </div>
  );
};

export default StoreStatus;
