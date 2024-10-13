"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db, storage, isUserMFAEnrolled } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import LabelInput from "@/components/ui/LabelInput";
import { Edit, Loader2, Save, Upload } from "lucide-react";
import UploadProductImage from "@/components/dashboard/inventory/add-product/UploadProductImage";
import Image from "next/image";
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-google-places-autocomplete";
import { z } from "zod";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const detailsSchema = z.object({
  ownerName: z.string().min(1, { message: "This field has to be filled" }),
  businessDescription: z
    .string()
    .min(20, { message: "This field has to be filled" })
    .max(40),
});

const SettingsPage = () => {
  const [ownerName, setOwnerName] = React.useState<string>("");
  const [businessDescription, setBusinessDescription] =
    React.useState<string>("");
  const [editEnabled, setEditEnabled] = React.useState<boolean>(false);
  const [mapData, setMapData] = React.useState<any>(null);
  const user = auth.currentUser;
  const merchantDocRef = doc(db, "merchants", user!.uid);
  const [businessImageUrl, setBusinessImageUrl] = useState<any>(null);

  const storageRef = ref(
    storage,
    `businessImages/${businessImageUrl?.name}-${user?.uid}`
  );
  const queryClient = useQueryClient();

  const { data: merchantData, isLoading } = useQuery({
    queryKey: ["merchantData"],
    queryFn: async () => {
      const merchantDoc = (await getDoc(merchantDocRef)).data();
      return merchantDoc;
    },
  });

  useEffect(() => {
    setOwnerName((prev: any) => merchantData?.ownerName);
    setBusinessDescription((prev: any) => merchantData?.businessDescription);
  }, [merchantData]);

  const handleProductImageUrl = (file: any) => {
    // setProductImageUrl((prev: any) => file);
    setBusinessImageUrl((prev: any) => file);
  };

  const handleSave = async () => {
    try {
      let url;
      console.log(merchantData);
      if (businessImageUrl) {
        //delete the old image
        const oldImageRef = ref(storage, merchantData?.businessImageUrl);
        await deleteObject(oldImageRef);

        // create an upload task for the selected Image
        const snapshot = await uploadBytes(storageRef, businessImageUrl);
        url = await getDownloadURL(snapshot.ref);

        console.log(url);
      } else {
        url = merchantData?.businessImageUrl;
      }

      const result = detailsSchema.safeParse({
        ownerName,
        businessDescription,
      });
      if (!result.success) {
        let errorMessage = "";
        result.error.issues.forEach((issue) => {
          errorMessage =
            errorMessage + issue.path[0] + ": " + issue.message + ". \n";
        });
        toast.error(errorMessage, { duration: 7000 });
        return;
      }

      //saving merchant details
      toast.promise(
        updateDoc(merchantDocRef, {
          ...merchantData,
          businessImageUrl: url,
          businessAddress: mapData ?? merchantData?.businessAddress,
          businessDescription,

          ownerName,
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const { mutate: saveDetails } = useMutation({
    mutationFn: handleSave,
    onError: (error) => {
      toast.error("Error saving details");
    },

    onSettled: () => {
      queryClient.refetchQueries({ queryKey: ["merchantData"], type: "all" });
      toast.success("Details saved successfully");
    },
  });

  return (
    <section className="flex flex-col gap-6 my-10">
      <h1 className="text-3xl font-bold my-3">Settings</h1>
      <Card>
        <CardHeader className="w-full flex flex-row  justify-between">
          <CardTitle className="">Edit Details</CardTitle>
          <button
            className="w-fit active:scale-95 hover:scale-105 flex items-center gap-2"
            onClick={() => {
              setEditEnabled(!editEnabled);
              if (editEnabled) saveDetails();
            }}
          >
            {editEnabled ? (
              <>
                <Save height={20} width={20} /> Save
              </>
            ) : (
              <>
                <Edit height={20} width={20} /> Edit
              </>
            )}
          </button>
        </CardHeader>
      </Card>
      <div className="flex gap-6 max-md:flex-col-reverse">
        <div className="flex flex-col gap-6 md:basis-[50%] ">
          <Card className="py-5 w-full h-fit">
            <CardContent className="flex flex-col gap-4 w-full">
              <LabelInput
                label="Owner Name"
                value={ownerName}
                isDisabled={!editEnabled}
                handleChange={setOwnerName}
                isLoading={isLoading}
              />

              <LabelInput
                label="Email"
                value={user?.email ?? ""}
                isDisabled={true}
                message="verification required"
                handleChange={() => {}}
                isLoading={isLoading}
              />

              <LabelInput
                label="Phone Number"
                value={merchantData?.phoneNumber}
                isDisabled={true}
                message="verification required"
                handleChange={() => {}}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
          <Card className="max-w-full p-5 flex flex-col gap-5">
            <LabelInput
              label="Business Name"
              value={merchantData?.businessName}
              isDisabled={true}
              handleChange={() => {}}
              isLoading={isLoading}
            />
            <LabelInput
              label="Business Description"
              value={businessDescription}
              isDisabled={!editEnabled}
              valueClassName="max-w-[300px]"
              handleChange={setBusinessDescription}
              isLoading={isLoading}
            />
            {editEnabled ? (
              <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Business Address</h1>
                <GooglePlacesAutocomplete
                  apiKey={process.env.GOOGLE_PLACES_AUTOCOMPLETE_API_KEY}
                  selectProps={{
                    placeholder: "Business address",
                    onChange: (e) => {
                      if (!e) return;
                      geocodeByAddress(e.label).then((results) => {
                        setMapData((prev: any) => {
                          return {
                            ...prev,
                            description: results[0].formatted_address,
                          };
                        });
                      });

                      geocodeByAddress(e.label)
                        .then((results) => getLatLng(results[0]))
                        .then(({ lat, lng }) =>
                          setMapData((prev: any) => {
                            return {
                              ...prev,
                              location: {
                                lat: lat,
                                lng: lng,
                              },
                            };
                          })
                        );
                    },

                    styles: {
                      input: (provided) => ({
                        ...provided,
                        //   backgroundColor: "#d1d5db", // bg-gray-300 equivalent
                        borderRadius: "0.375rem", // rounded-md equivalent
                        borderColor: "#cbd5e0", // border-gray-400 equivalent
                        boxShadow: "none", // Remove the box shadow
                        outline: "none", // Remove the outline
                        margin: "0", // Remove margin
                        color: "#1a202c", // text color
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: "#1a202c", // text color
                        fontSize: "0.875rem", // text size
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "#d1d5db", // bg-gray-300 equivalent
                        borderRadius: "0.375rem", // rounded-md equivalent
                        padding: "0", // Ensure no extra padding
                        border: "none", // Remove the border
                        boxShadow: "none", // Remove the box shadow
                        outline: "none", // Remove the outline
                        margin: "0", // Remove margin
                      }),
                      container: (provided) => ({
                        ...provided,
                        padding: "0", // Ensure no extra padding
                        margin: "0", // Ensure no extra margin
                      }),
                      dropdownIndicator: (provided) => ({
                        ...provided,
                        display: "none", // Optionally hide the dropdown indicator
                      }),
                      indicatorsContainer: (provided) => ({
                        ...provided,
                        display: "none", // Optionally hide the indicators container
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: "#68748B", // Placeholder color for better visibility
                        fontSize: "0.875rem", // Placeholder font size
                      }),
                    },
                  }}
                />
              </div>
            ) : (
              <LabelInput
                label="Business Address"
                value={merchantData?.businessAddress?.description}
                isDisabled={true}
                handleChange={() => {}}
                isLoading={isLoading}
              />
            )}
          </Card>
        </div>
        <Card className="p-4 w-full flex justify-center items-center md:basis-[50%]">
          <CardContent className="w-full flex justify-center items-center pt-[unset]">
            {isLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin" />
              </div>
            ) : editEnabled ? (
              <UploadProductImage
                handleProductImageUrl={handleProductImageUrl}
                size="large"
              />
            ) : (
              <Image
                src={merchantData?.businessImageUrl}
                alt="Business Image"
                width={80}
                height={80}
                className="rounded-xl aspect-square object-cover w-full h-full"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SettingsPage;
