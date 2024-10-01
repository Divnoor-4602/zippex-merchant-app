"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { collection, updateDoc, doc } from "firebase/firestore";
import merchantLogo from "../../../public/images/logo-merchant.png";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import UploadButton from "../UploadButton";

const formSchema = z.object({
  businessDescription: z
    .string()
    .min(10, { message: "This field has to be filled" }),
  businessType: z.string().min(1, { message: "This field has to be filled" }),
});

const BusinessDocumentForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Initialize the form with react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessDescription: "",
      businessType: "",
    },
  });

  // State for uploaded file URLs
  const [uploadedUrls, setUploadedUrls] = useState({
    businessLicense: "",
    identityProof: "",
  });

  // Callback to handle file uploads and set URLs
  const handleFileUpload = (fileType: string, url: string) => {
    setUploadedUrls((prev) => ({ ...prev, [fileType]: url }));
  };

  // form submit handler
  const onSubmit = async (values: any) => {
    const currentUserUid = auth.currentUser?.uid;

    try {
      setIsLoading(true);

      const merchantCollection = collection(db, "merchants");
      const merchantRef = doc(merchantCollection, currentUserUid);

      // Update Firestore with business info and document URLs
      await updateDoc(merchantRef, {
        isOnBoarded: false,
        onboardingStep: 2,
        isVerified: false,
        documentUrls: {
          businessLicense: uploadedUrls.businessLicense,
          identityProof: uploadedUrls.identityProof,
        },
      });

      router.push("/business-on-boarding/business-verification-pending");
      toast.success("Onboarding completed successfully!");

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while onboarding. Please try again later."
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="mx-auto mx-w-sm">
        <CardHeader className="flex justify-center items-center">
          <Image src={merchantLogo} alt="Merchant Logo" className="w-[50%]" />
          <CardTitle className="text-xl font-bold">Onboarding</CardTitle>
          <CardDescription className="font-light">
            Start Your Seamless Store-to-Door Delivery Journey with Us!
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          {/* Form starts here */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 flex flex-col"
          >
            {/* File upload buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Upload Business Documents
              </h3>

              {/* Business License Upload */}
              <div>
                <label
                  htmlFor="businessLicense"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business License
                </label>
                <UploadButton
                  handleLogoUploaded={(url) =>
                    handleFileUpload("businessLicense", url)
                  }
                />

                {/* Show business license preview */}
                {uploadedUrls.businessLicense && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Uploaded License:</p>
                    <img
                      src={uploadedUrls.businessLicense}
                      alt="Business License"
                      className="w-24 h-24 object-contain border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Identity Proof Upload */}
              <div>
                <label
                  htmlFor="identityProof"
                  className="block text-sm font-medium text-gray-700"
                >
                  Identity Proof
                </label>
                <UploadButton
                  handleLogoUploaded={(url) =>
                    handleFileUpload("identityProof", url)
                  }
                />

                {/* Show identity proof preview */}
                {uploadedUrls.identityProof && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Uploaded Identity Proof:
                    </p>
                    <img
                      src={uploadedUrls.identityProof}
                      alt="Identity Proof"
                      className="w-24 h-24 object-contain border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              onClick={onSubmit}
              disabled={isLoading}
              className="bg-brandblue w-full hover:bg-brandblue/90"
            >
              {isLoading ? "Loading..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default BusinessDocumentForm;
