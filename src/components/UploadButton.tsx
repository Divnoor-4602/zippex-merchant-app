"use client";

import Dropzone from "react-dropzone";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage, auth } from "@/lib/firebase";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Cloud, Loader2, File } from "lucide-react";

interface UploadButtonProps {
  handleLogoUploaded: (url: string) => void;
  uploadMessage?: string;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

const UploadDropzone = ({
  closeDialog,
  handleLogoUploaded,
}: {
  closeDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogoUploaded: (url: string) => void;
}) => {
  return (
    <Dropzone
      multiple={false}
      maxFiles={1}
      onError={() => {
        toast.error("Error uploading image!");
      }}
      onDrop={async (acceptedFile: any) => {
        const file = acceptedFile[0];

        // Check file size limit
        if (file.size > MAX_FILE_SIZE) {
          toast.error("File size exceeds the limit of 2 MB.");
          return;
        }

        toast.warning("Uploading image", {
          icon: <Loader2 className="size-4 animate-spin" />,
        });

        const currentUserUid = auth.currentUser?.uid;
        const storageRef = ref(
          storage,
          `businessImages/${currentUserUid}/${file.name}`
        );

        // Upload the file to Firebase Storage
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        toast.success("Image uploaded successfully");

        // Pass the URL back to the parent component
        handleLogoUploaded(url);
        closeDialog(false);
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed rounded-lg border-gray-300"
        >
          <div className="flex items-center w-full h-full">
            <div className="flex flex-col items-center justify-center rounded-lg w-full h-full cursor-pointer bg-gray-100 hover:bg-gray-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="size-6 text-zinc-500 mb-2" />
                <p className="mt-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span>
                  <span> or drag and drop</span>
                </p>
                <p className="text-xs text-zinc-500">Document</p>
              </div>

              {acceptedFiles && acceptedFiles[0] && (
                <div className="max-w-xs bg-white flex overflow-hidden rounded-md items-center outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="size-4 text-brandblue" />
                  </div>
                  <div className="truncate text-sm py-2 px-3">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              )}

              <input type="file" {...getInputProps()} className="hidden" />
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

const UploadButton: React.FC<UploadButtonProps> = ({
  handleLogoUploaded,
  uploadMessage = "Upload Document",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v: any) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button variant={"outline"}>{uploadMessage}</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog content">
        <DialogTitle className="hidden"></DialogTitle>
        <UploadDropzone
          closeDialog={setIsOpen}
          handleLogoUploaded={handleLogoUploaded}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
