import OnBoardingForm from "@/components/forms/OnBoardingForm";

const page = () => {
  return (
    <main className="flex items-center w-full h-screen">
      <OnBoardingForm />
    </main>
  );
};

export default page;

// Business Information
// 	•	Business ID (Primary Key): String - Unique identifier for the business.
// 	•	Business Name: String - Name of the merchant's business (Required).
// 	•	Business Address: String - Physical address of the business (Required).
// 	•	Contact Person: String - Name of the primary contact person.
// 	•	Business Type: String - Type of business (e.g., Retail, Restaurant, etc.).
// 	•	Business Logo URL: String - URL to the business logo image.
// 	•	Business Description: Text - Brief description of the business.
// 	•	Creation Date: Timestamp - Date and time when the business was registered.
