"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Dropzone from "react-dropzone";
import { collection, updateDoc, doc } from "firebase/firestore";
import { Button } from "./ui/button";

import { Cloud, Loader2, File } from "lucide-react";
import { useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "sonner";

const UploadDropzone = ({
  closeDialog,
  handleLogoUpload,
}: {
  closeDialog: React.Dispatch<React.SetStateAction<boolean>>;
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

          const currentUserUid = auth.currentUser?.uid;

          // handle file upload
          const file = acceptedFile[0];

          // reference to storeage
          const storageRef = ref(storage, `businessImages/${file.name}`);

          // create an upload task for the selected Image
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          console.log(url);

          // add the image url to the merchant database
          const merchantCollection = collection(db, "merchants");

          const merchantRef = doc(merchantCollection, currentUserUid);

          // updating the doc with the new business information

          await updateDoc(merchantRef, {
            imageUrl: url,
          });

          toast.success("Image uploaded successfully");
          handleLogoUpload(file.name);
          closeDialog(false);
        }}
      >
        {({ getRootProps, getInputProps, acceptedFiles }) => {
          return (
            <div
              {...getRootProps()}
              className="border h-64 m-4 border-dashed rounded-lg border-gray-300"
            >
              <div className="flex items-center w-full h-full">
                <div className="flex flex-col items-center justify-center rounded-lg w-full h-full cursor-pointer bg-gray-100 hover:bg-gray-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Cloud className="size-6 text-zinc-500 mb-2" />
                    <p className="mt-2 text-sm text-zinc-700">
                      <span className="font-semibold">Click to upload </span>
                      <span>or drag n drop</span>
                    </p>
                    <p className="text-xs text-zinc-500">Logo</p>
                  </div>

                  {acceptedFiles && acceptedFiles[0] ? (
                    <>
                      <div className="max-w-xs bg-white flex overflow-hidden rounded-md items-center outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                        <div className="px-3 py-2 h-full grid place-items-center">
                          <File className="size-4 text-brandblue" />
                        </div>
                        <div className="truncate text-sm py-2 px-3">
                          {acceptedFiles[0].name}
                        </div>
                      </div>
                    </>
                  ) : null}

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

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [logoUploaded, setLogoUploaded] = useState<string>("");

  const handleLogoUploaded = (name: string) => {
    setLogoUploaded((prev) => name);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v: any) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button className="" variant={"outline"}>
          {logoUploaded ? logoUploaded : "Upload logo"}
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog content">
        <DialogTitle className="hidden"></DialogTitle>
        <UploadDropzone
          closeDialog={setIsOpen}
          handleLogoUpload={handleLogoUploaded}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
