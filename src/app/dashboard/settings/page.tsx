"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db, storage } from "@/lib/firebase";
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
import { Edit, Save, Upload } from "lucide-react";
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

const detailsSchema = z.object({
  ownerName: z.string().min(1, { message: "This field has to be filled" }),
  email: z
    .string()
    .min(1, { message: "This field has to be filled" })
    .email()
    .max(50),
  phoneNumber: z.string().regex(/^(?:\d{10}|\d{3}-\d{3}-\d{4})$/, {
    message:
      "Invalid Canadian phone number format. Use 'XXX-XXX-XXXX' or 'XXXXXXXXXX'.",
  }),
  businessDescription: z
    .string()
    .min(20, { message: "This field has to be filled" })
    .max(40),
});

const SettingsPage = () => {
  const [ownerName, setOwnerName] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [businessDescription, setBusinessDescription] =
    React.useState<string>("");
  const [merchantData, setMerchantData] = React.useState<any>(null);
  const [editEnabled, setEditEnabled] = React.useState<boolean>(false);
  const [mapData, setMapData] = React.useState<any>(null);
  const user = auth.currentUser;
  const merchantDocRef = doc(db, "merchants", user!.uid);
  const [businessImageUrl, setBusinessImageUrl] = useState<any>(null);

  const storageRef = ref(
    storage,
    `businessImages/${businessImageUrl?.name}-${user?.uid}`
  );

  useEffect(() => {
    (async () => {
      const merchantDoc = (await getDoc(merchantDocRef)).data();
      setMerchantData(() => merchantDoc);
    })();
  }, []);

  useEffect(() => {
    setOwnerName((prev: any) => merchantData?.ownerName);
    setEmail((prev: any) => merchantData?.email);
    setPhoneNumber((prev: any) => merchantData?.phoneNumber);
    setBusinessDescription((prev: any) => merchantData?.businessDescription);
  }, [merchantData]);

  const handleProductImageUrl = (file: any) => {
    // setProductImageUrl((prev: any) => file);
    setBusinessImageUrl((prev: any) => file);
  };

  const handleSave = async () => {
    try {
      //delete the old image
      const oldImageRef = ref(storage, merchantData?.imageUrl);
      await deleteObject(oldImageRef);

      // create an upload task for the selected Image
      const snapshot = await uploadBytes(storageRef, businessImageUrl);
      const url = await getDownloadURL(snapshot.ref);

      //saving merchant details
      toast.promise(
        updateDoc(merchantDocRef, {
          ...merchantData,
          businessImageUrl: url,
          businessAddress: mapData,
          businessDescription,
          email,
          ownerName,
          phoneNumber,
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="flex flex-col gap-6 my-10">
      <h1 className="text-3xl font-bold my-3">Settings</h1>
      <Card>
        <CardHeader className="w-full flex  justify-between">
          <CardTitle className="">Edit Details</CardTitle>
          <button
            className="w-fit active:scale-95 hover:scale-105 flex items-center gap-2"
            onClick={() => {
              setEditEnabled(!editEnabled);
              if (editEnabled) handleSave();
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
              />

              <LabelInput
                label="Email"
                value={email}
                isDisabled={!editEnabled}
                message="verification required"
                handleChange={setEmail}
              />
              <LabelInput
                label="Phone Number"
                value={phoneNumber}
                isDisabled={!editEnabled}
                message="verification required"
                handleChange={setPhoneNumber}
              />
            </CardContent>
          </Card>
          <Card className="max-w-full p-5 flex flex-col gap-5">
            <LabelInput
              label="Business Name"
              value={merchantData?.businessName}
              isDisabled={true}
              handleChange={() => {}}
            />
            <LabelInput
              label="Business Description"
              value={businessDescription}
              isDisabled={!editEnabled}
              valueClassName="max-w-[300px]"
              handleChange={setBusinessDescription}
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
                value={merchantData?.businessAddress.description}
                isDisabled={true}
                handleChange={() => {}}
              />
            )}
          </Card>
        </div>
        <Card className="p-4 w-full flex justify-center items-center md:basis-[50%]">
          <CardContent className="w-full flex justify-center items-center pt-[unset]">
            {editEnabled ? (
              <UploadProductImage
                handleProductImageUrl={handleProductImageUrl}
              />
            ) : (
              <Image
                src={merchantData?.imageUrl}
                alt="product-image"
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
