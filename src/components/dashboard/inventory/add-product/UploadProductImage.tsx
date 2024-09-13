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
}

const UploadDropzone = ({
  handleLogoUpload,
}: {
  handleLogoUpload: (name: string) => void;
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
              className="border  border-dashed rounded-lg border-gray-300 h-56"
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
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="size-4 text-zinc-500 mb-2 animate-pulse" />
                    </div>
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
}: UploadProductImageProps) => {
  return <UploadDropzone handleLogoUpload={handleProductImageUrl} />;
};

export default UploadProductImage;
