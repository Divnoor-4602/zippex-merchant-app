"use client";

import Dropzone from "react-dropzone";
import { collection, updateDoc, doc } from "firebase/firestore";
import Image from "next/image";

import { Loader2, ImageIcon } from "lucide-react";
import { useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "sonner";

interface UploadProductImageProps {
  handleProductImageUrl: (file: any) => void;
  existingImageUrl?: string;
  size: "small" | "large";
}

const UploadDropzone = ({
  handleLogoUpload,
  size,
  existingImageUrl,
}: {
  handleLogoUpload: (name: string) => void;
  existingImageUrl?: string;
  size: "small" | "large";
}) => {
  return (
    <>
      <Dropzone
        multiple={false}
        maxFiles={1}
        onError={(error) => {
          toast.error("Error uploading image!");
        }}
        onDrop={async (acceptedFile: any) => {
          toast.warning("Uploading image", {
            icon: <Loader2 className="size-4 animate-spin" />,
          });

          // handle file upload
          const file = acceptedFile[0];

          handleLogoUpload(file);
          toast.success("Image uploaded successfully");

          //   handleLogoUpload(file.name);
        }}
      >
        {({ getRootProps, getInputProps, acceptedFiles }) => {
          return (
            <div
              {...getRootProps()}
              className={`border border-dashed rounded-lg border-gray-300 ${
                size === "small" ? "h-24 w-24" : "h-56 "
              } w-full`}
            >
              <div className="flex items-center w-full h-full">
                <div className="flex flex-col items-center justify-center rounded-lg w-full h-full cursor-pointer bg-gray-100 hover:bg-gray-200">
                  {acceptedFiles && acceptedFiles[0] ? (
                    <>
                      <Image
                        src={URL.createObjectURL(acceptedFiles[0])}
                        alt="product image"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                    </>
                  ) : existingImageUrl ? (
                    <>
                      <Image
                        src={existingImageUrl}
                        alt="product image"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                    </>
                  ) : (
                    <>
                      <ImageIcon className="size-4 text-gray-500 animate-pulse" />
                    </>
                  )}

                  {/* adding the input  */}
                  <input
                    type="file"
                    {...getInputProps()}
                    id="dropzone-file"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          );
        }}
      </Dropzone>
    </>
  );
};

const UploadProductImage = ({
  handleProductImageUrl,
  existingImageUrl,
  size,
}: UploadProductImageProps) => {
  return (
    <UploadDropzone
      handleLogoUpload={handleProductImageUrl}
      size={size}
      existingImageUrl={existingImageUrl}
    />
  );
};

export default UploadProductImage;
