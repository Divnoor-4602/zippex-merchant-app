"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SearchIcon, PhoneIcon, BellIcon } from "lucide-react";
import helpCenter from "@/constants/help-center";
import HelpCentreCard from "@/components/cards/HelpCentreCard";
import ReactMarkdown from "react-markdown";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHelpCenter, setFilteredHelpCenter] = useState<any>(helpCenter);
  const faqs = [
    {
      question: "How do I update my store hours?",
      answer:
        "You can update your store hours in the 'Store Settings' section of your merchant dashboard.",
    },
    {
      question: "What do I do if an item is out of stock?",
      answer:
        "Mark the item as 'Unavailable' in your inventory management system to prevent customers from ordering it.",
    },
    {
      question: "How long does it take to receive payments?",
      answer:
        "Payments are typically processed within 2-3 business days after the order is completed.",
    },
  ];

  const FAQ = `# Zippex Merchant App - Frequently Asked Questions (FAQs)

Welcome to the **Zippex** FAQ section. Here you'll find answers to the most common questions about using our merchant application. If you need further assistance, feel free to [contact our support team](#).

---

## **1. Getting Started**

### **1.1. What is Zippex?**

**Zippex** is a robust merchant application designed to empower businesses to efficiently manage sales, inventory, customer relationships, and more. Accessible via [merchant.zippex.app](https://merchant.zippex.app), Zippex offers features such as point-of-sale (POS) transactions, real-time inventory tracking, comprehensive sales analytics, and seamless integration with various payment gateways to streamline your business operations.

### **1.2. How do I create a new merchant account on Zippex?**

To create a new merchant account on **Zippex**:

1. **Visit the Website:** Navigate to [merchant.zippex.app](https://merchant.zippex.app) using your preferred web browser.
2. **Sign Up:** Click on the **"Sign Up"** button located at the top-right corner of the homepage.
3. **Provide Business Details:** Fill in your business information, including:
   - Business Name
   - Email Address
   - Contact Number
   - Create a Secure Password
4. **Agree to Terms:** Review and accept the **Terms of Service** and **Privacy Policy**.
5. **Verify Email:** Check your email for a verification link from Zippex and click on it to activate your account.
6. **Complete Profile:** Log in to your new account and complete your business profile by adding additional details such as business address, tax information, and preferred payment methods.

### **1.3. What devices and browsers are compatible with Zippex?**

**Zippex** is a web-based application optimized for various devices and browsers:

- **Devices:**
  - **Desktops & Laptops:** Windows, macOS, Linux
  - **Tablets & Mobile Devices:** Responsive design ensures functionality on tablets and smartphones
- **Supported Browsers:**
  - **Google Chrome:** Latest version recommended
  - **Mozilla Firefox:** Latest version recommended
  - **Microsoft Edge:** Latest version recommended
  - **Safari:** Latest version recommended on macOS and iOS devices
- **Note:** For the best experience, ensure your browser is up to date and JavaScript is enabled.

### **1.4. How do I access Zippex on mobile devices?**

While **Zippex** is primarily a web-based application accessible via [merchant.zippex.app](https://merchant.zippex.app), it is optimized for mobile use:

1. **Open Browser:** Use your mobile device’s web browser (Chrome, Safari, etc.).
2. **Navigate to the Website:** Enter [merchant.zippex.app](https://merchant.zippex.app) in the address bar.
3. **Log In:** Access your account as you would on a desktop.
4. **Optional:** Add a shortcut to your home screen for quicker access:
   - **iOS Safari:** Tap the **Share** button and select **"Add to Home Screen."**
   - **Android Chrome:** Tap the **Menu** icon and select **"Add to Home screen."**

---

## **2. Account Management**

### **2.1. How do I reset my Zippex password?**

To reset your password on **Zippex**:

1. **Go to Login Page:** Visit [merchant.zippex.app](https://merchant.zippex.app) and click on **"Login."**
2. **Forgot Password:** Click on the **"Forgot Password?"** link below the login fields.
3. **Enter Email:** Input the email address associated with your Zippex account and click **"Submit."**
4. **Check Email:** Look for an email from Zippex with the subject **"Password Reset Instructions."**
5. **Reset Password:** Click the password reset link in the email and follow the prompts to create a new password.
6. **Log In:** Return to the login page and sign in with your new password.

### **2.2. How can I update my business information?**

To update your business information on **Zippex**:

1. **Log In:** Access your account at [merchant.zippex.app](https://merchant.zippex.app).
2. **Navigate to Settings:** Click on your profile icon in the top-right corner and select **"Settings."**
3. **Business Profile:** Go to **"Business Profile."**
4. **Edit Details:** Update necessary fields such as business name, address, contact information, and tax details.
5. **Save Changes:** Click **"Save"** to apply the updates.

### **2.3. How do I add or remove users from my account?**

To manage users in **Zippex**:

1. **Log In as Administrator:** Only account administrators can add or remove users.
2. **Go to User Management:** Navigate to **Settings** > **User Management.**
3. **Add a User:**
   - Click on **"Add User."**
   - Enter the new user's email address.
   - Assign a role (e.g., Manager, Staff).
   - Set permissions based on their responsibilities.
   - Click **"Invite"** to send an invitation email.
4. **Remove a User:**
   - Locate the user in the **User Management** list.
   - Click **"Remove"** next to their name.
   - Confirm the removal when prompted.

### **2.4. How do I change my account email address?**

To change your account email address:

1. **Log In:** Access your account at [merchant.zippex.app](https://merchant.zippex.app).
2. **Navigate to Settings:** Click on your profile icon and select **"Settings."**
3. **Update Email:** Go to **"Account Information"** and enter your new email address.
4. **Verify New Email:** Zippex will send a verification link to the new email. Click the link to confirm the change.
5. **Confirm Update:** Once verified, your account email will be updated.

---

## **3. Payments and Transactions**

### **3.1. What payment methods does Zippex support?**

**Zippex** supports a variety of payment methods, including:

- **Credit/Debit Cards:** Visa, MasterCard, American Express, Discover
- **Digital Wallets:** Apple Pay, Google Pay, Samsung Pay
- **Bank Transfers:** ACH transfers
- **Cash Transactions**
- **Gift Cards and Store Credits**

### **3.2. How do I process a sale using Zippex?**

To process a sale:

1. **Log In:** Access your merchant account at [merchant.zippex.app](https://merchant.zippex.app).
2. **Add Items:** Select the items being purchased from your inventory or enter them manually.
3. **Apply Discounts:** If applicable, apply any discounts or promotional codes.
4. **Choose Payment Method:** Select the customer's preferred payment method.
5. **Complete Transaction:** Follow the on-screen prompts to finalize the sale and generate a receipt.
6. **Print/Email Receipt:** Optionally, print a physical receipt or send it via email/SMS to the customer.

### **3.3. Are there any transaction fees?**

Yes, transaction fees may apply based on the payment method used. Our standard fee structure is as follows:

- **Credit/Debit Cards:** 2.9% + $0.30 per transaction
- **Digital Wallets:** 2.5% + $0.25 per transaction
- **Bank Transfers:** 1.8% per transaction
- **Cash Transactions:** No fees
  Please refer to our [Pricing Page](https://merchant.zippex.app/pricing) for detailed information on fees and any applicable discounts for high-volume merchants.

### **3.4. How do I issue refunds?**

To issue a refund:

1. **Log In:** Access your merchant account.
2. **Navigate to Transactions:** Go to **"Transactions"** > **"Refunds."**
3. **Search Transaction:** Use the receipt number or customer details to find the original transaction.
4. **Select Transaction:** Click on the transaction you wish to refund.
5. **Initiate Refund:** Click **"Refund."**
6. **Enter Details:** Input the refund amount and select the reason for the refund.
7. **Confirm Refund:** Click **"Confirm"** to process the refund. The customer will receive the refunded amount via the original payment method.

### **3.5. Can I set up recurring payments?**

Yes, **Zippex** allows you to set up recurring payments for subscription-based services or regular customers:

1. **Navigate to Recurring Payments:** Go to **"Payments"** > **"Recurring Payments."**
2. **Create New Schedule:** Click on **"Create Recurring Payment."**
3. **Enter Details:** Provide the payment amount, frequency (e.g., weekly, monthly), and customer information.
4. **Set Start/End Dates:** Define when the recurring payments should start and end.
5. **Confirm Setup:** Click **"Save"** to activate the recurring payment schedule.

---

## **4. Inventory Management**

### **4.1. How do I add new products to my inventory?**

To add new products:

1. **Log In:** Access your merchant account.
2. **Navigate to Inventory:** Click on **"Inventory"** > **"Add Product."**
3. **Enter Product Details:** Fill in the necessary information, including:
   - **Name**
   - **SKU (Stock Keeping Unit)**
   - **Category**
   - **Price**
   - **Cost**
   - **Quantity in Stock**
   - **Supplier Information**
   - **Product Description**
   - **Images**
4. **Save Product:** Click **"Save"** to add the product to your inventory.

### **4.2. How can I track inventory levels?**

**Zippex** provides real-time inventory tracking:

1. **Navigate to Stock Levels:** Go to **"Inventory"** > **"Stock Levels."**
2. **View Current Stock:** See the current quantity of all products.
3. **Set Low-Stock Alerts:** Configure alerts to notify you when inventory falls below a specified threshold.
4. **Generate Reports:** Access inventory reports to analyze stock movements and trends by navigating to **"Reports"** > **"Inventory Reports."**

### **4.3. How do I handle inventory adjustments or corrections?**

To adjust inventory:

1. **Go to Adjustments:** Navigate to **"Inventory"** > **"Adjustments."**
2. **Select Product:** Choose the product you wish to adjust from the list.
3. **Enter Adjustment Details:**
   - **Adjustment Quantity:** Specify the number to add or subtract.
   - **Reason:** Select a reason (e.g., damaged goods, stock count discrepancy).
   - **Notes:** Add any additional information if necessary.
4. **Submit Adjustment:** Click **"Submit"** to update the inventory levels accordingly.

### **4.4. Can I import products in bulk?**

Yes, **Zippex** allows bulk importing of products:

1. **Prepare CSV File:** Ensure your product data is formatted correctly in a CSV file. Refer to our [Import Template](https://merchant.zippex.app/import-template) for guidance.
2. **Navigate to Import:** Go to **"Inventory"** > **"Import Products."**
3. **Upload File:** Click **"Choose File"** and select your CSV file.
4. **Map Fields:** Ensure all fields are correctly mapped.
5. **Start Import:** Click **"Import"** to upload your products in bulk.
6. **Review Import Status:** Monitor the import progress and check for any errors in the import log.

---

## **5. Reporting and Analytics**

### **5.1. What types of reports are available?**

**Zippex** offers a variety of reports to help you analyze and optimize your business:

- **Sales Reports:** Daily, weekly, monthly, and annual sales summaries.
- **Inventory Reports:** Stock levels, low-stock alerts, and inventory valuation.
- **Financial Reports:** Revenue, expenses, and profit margins.
- **Customer Reports:** Purchase history, loyalty program statistics, and customer demographics.
- **Employee Reports:** Sales performance, hours worked, and commission tracking.

### **5.2. How do I generate a sales report?**

To generate a sales report:

1. **Log In:** Access your merchant account.
2. **Navigate to Reports:** Click on **"Reports"** > **"Sales Reports."**
3. **Select Time Frame:** Choose the desired period (e.g., daily, weekly, monthly).
4. **Apply Filters:** Optionally, filter by product categories, payment methods, or other criteria.
5. **Generate Report:** Click **"Generate Report"** to view the data.
6. **Download Report:** Choose to download the report in your preferred format (PDF, Excel, etc.) by clicking **"Download."**

### **5.3. Can I schedule automatic report generation?**

Yes, you can schedule automatic reports:

1. **Go to Schedule Reports:** Navigate to **"Reports"** > **"Schedule Reports."**
2. **Select Report Type:** Choose the type of report you want to schedule (e.g., Sales, Inventory).
3. **Set Frequency:** Define how often the report should be generated (daily, weekly, monthly).
4. **Add Recipients:** Enter the email addresses of individuals who should receive the reports.
5. **Configure Settings:** Adjust any additional settings as needed.
6. **Save Schedule:** Click **"Save Schedule"** to activate automatic report generation and delivery.

### **5.4. How do I customize my reports?**

To customize reports:

1. **Navigate to Reports:** Go to **"Reports"** and select the desired report type.
2. **Apply Custom Filters:** Use filters such as date ranges, product categories, payment methods, or specific employees.
3. **Select Data Columns:** Choose which data columns to include in your report.
4. **Save Custom Report:** After configuring, click **"Save as Custom Report"** to reuse the settings in the future.
5. **Generate and Download:** Click **"Generate Report"** and download it in your preferred format.

---

## **6. Security and Privacy**

### **6.1. How does Zippex ensure the security of my data?**

**Zippex** employs multiple security measures to protect your data:

- **Encryption:** All data is encrypted both in transit (using SSL/TLS) and at rest.
- **Authentication:** Supports multi-factor authentication (MFA) to prevent unauthorized access.
- **Access Controls:** Role-based access controls ensure that users have appropriate permissions.
- **Regular Audits:** Conducts regular security audits and vulnerability assessments.
- **Compliance:** Complies with industry standards such as PCI DSS for payment security and GDPR for data privacy.

### **6.2. Is my payment information secure?**

Yes, your payment information is highly secure:

- **PCI Compliance:** **Zippex** is PCI DSS compliant, ensuring that all credit card information is handled securely.
- **Tokenization:** Sensitive payment data is tokenized, meaning actual card details are never stored on our servers.
- **Secure Payment Gateways:** Integrates with trusted payment gateways that adhere to strict security protocols.

### **6.3. How is my personal and business information protected?**

Your personal and business information is protected through:

- **Data Encryption:** All personal data is encrypted both during transmission and while stored.
- **Access Restrictions:** Only authorized personnel can access sensitive information.
- **Regular Backups:** Data is regularly backed up to prevent loss due to unforeseen events.
- **Privacy Policies:** Adheres to strict privacy policies to ensure your information is used appropriately and not shared without consent.

### **6.4. How do I enable two-factor authentication (2FA) on my account?**

To enable 2FA:

1. **Log In:** Access your merchant account.
2. **Navigate to Security Settings:** Go to **Settings** > **Security.**
3. **Enable 2FA:** Toggle the **"Two-Factor Authentication"** option to **On.**
4. **Choose Method:** Select your preferred 2FA method (e.g., Authenticator App, SMS).
5. **Verify Setup:** Follow the prompts to complete the 2FA setup process.
6. **Confirm:** Ensure 2FA is active by logging out and logging back in with the new settings.

---

## **7. Technical Support**

### **7.1. How can I contact customer support?**

You can reach our customer support through the following channels:

- **Email:** [support@zippex.app](mailto:support@zippex.app)
- **Phone:** +1-800-123-4567 (Available Monday to Friday, 9 AM - 6 PM EST)
- **Live Chat:** Accessible via the [Zippex website](https://merchant.zippex.app) and the app
- **Help Center:** Visit our [Help Center](https://merchant.zippex.app/help) for articles, guides, and troubleshooting tips.

### **7.2. What should I do if I encounter a bug or issue?**

If you encounter a bug or issue:

1. **Document the Issue:** Take screenshots and note the steps leading up to the problem.
2. **Check the Help Center:** Refer to our [Help Center](https://merchant.zippex.app/help) to see if the issue is addressed.
3. **Contact Support:** If the issue persists, reach out to our support team via [support@zippex.app](mailto:support@zippex.app) or call us at +1-800-123-4567.
4. **Provide Details:** When contacting support, include detailed information such as:
   - Description of the issue
   - Steps to reproduce the problem
   - Any error messages received
   - Your account information
5. **Follow Up:** Our support team will investigate and work with you to resolve the issue as quickly as possible.

### **7.3. Where can I find tutorials and guides for using Zippex?**

You can access tutorials and guides in our **Help Center**:

- **Visit Help Center:** Go to [merchant.zippex.app/help](https://merchant.zippex.app/help)
- **Browse Topics:** Explore various topics such as getting started, inventory management, reporting, and more.
- **Watch Video Tutorials:** Access step-by-step video guides for visual assistance.
- **Search Function:** Use the search bar to find specific topics or issues.

### **7.4. How do I report a security vulnerability?**

If you discover a security vulnerability:

1. **Do Not Exploit:** Refrain from exploiting the vulnerability.
2. **Contact Security Team:** Email our security team at [security@zippex.app](mailto:security@zippex.app).
3. **Provide Details:** Include a detailed description of the vulnerability, steps to reproduce it, and any relevant screenshots or logs.
4. **Await Response:** Our security team will acknowledge your report and work to address the issue promptly.
5. **Responsible Disclosure:** We appreciate your responsible disclosure and may acknowledge your contribution in our security acknowledgments.

---

## **8. Billing and Subscriptions**

### **8.1. What subscription plans are available for Zippex?**

**Zippex** offers several subscription plans to cater to different business needs:

- **Basic Plan:** Ideal for small businesses with essential features.
- **Standard Plan:** Suitable for growing businesses needing advanced features.
- **Premium Plan:** Designed for large enterprises requiring comprehensive tools and priority support.
- **Custom Plan:** Tailored solutions for businesses with specific requirements.

For detailed information on each plan, visit our [Pricing Page](https://merchant.zippex.app/pricing).

### **8.2. How do I upgrade or downgrade my subscription plan?**

To change your subscription plan:

1. **Log In:** Access your merchant account.
2. **Navigate to Billing:** Go to **Settings** > **Billing.**
3. **Select Plan:** Choose the new subscription plan you wish to upgrade or downgrade to.
4. **Confirm Change:** Review the plan details and click **"Change Plan."**
5. **Payment Adjustment:** Any price differences will be adjusted in your next billing cycle.
6. **Confirmation:** You will receive a confirmation email regarding the plan change.

### **8.3. How can I view my billing history and invoices?**

To view billing history:

1. **Log In:** Access your merchant account.
2. **Navigate to Billing:** Go to **Settings** > **Billing.**
3. **View Invoices:** Under **"Billing History,"** you can see all past invoices and payment transactions.
4. **Download Invoices:** Click on individual invoices to view details and download PDFs for your records.

### **8.4. What payment methods are accepted for subscription fees?**

**Zippex** accepts the following payment methods for subscription fees:

- **Credit/Debit Cards:** Visa, MasterCard, American Express, Discover
- **Bank Transfers:** ACH transfers (for Enterprise plans)
- **PayPal:** Available for certain plans and regions
- **Direct Debit:** Supported in select countries

### **8.5. How do I cancel my subscription?**

To cancel your subscription:

1. **Log In:** Access your merchant account.
2. **Navigate to Billing:** Go to **Settings** > **Billing.**
3. **Cancel Subscription:** Click on **"Cancel Subscription."**
4. **Confirm Cancellation:** Follow the prompts to confirm your cancellation.
5. **Retention Offer:** You may be presented with a retention offer; choose to proceed with cancellation if desired.
6. **Confirmation Email:** You will receive an email confirming the cancellation. Your account will retain access until the end of the current billing cycle.

### **8.6. Can I get a refund if I cancel my subscription?**

Refunds are subject to our [Refund Policy](https://merchant.zippex.app/refund-policy). Generally:

- **Monthly Subscriptions:** No refunds for the current billing period.
- **Annual Subscriptions:** Partial refunds may be available based on the time of cancellation.
- **Promotional Offers:** Refund eligibility may vary.
  For specific refund requests, please [contact our support team](mailto:support@zippex.app).

---

## **9. Integrations and Extensions**

### **9.1. What third-party integrations does Zippex support?**

**Zippex** integrates with a wide range of third-party applications to enhance your business operations:

- **Accounting Software:** QuickBooks, Xero
- **E-commerce Platforms:** Shopify, WooCommerce, Magento
- **Marketing Tools:** Mailchimp, HubSpot
- **Shipping Services:** USPS, FedEx, UPS
- **Payment Gateways:** Stripe, PayPal, Square
- **CRM Systems:** Salesforce, Zoho CRM

### **9.2. How do I integrate Zippex with my existing e-commerce platform?**

To integrate **Zippex** with your e-commerce platform:

1. **Log In:** Access your merchant account.
2. **Navigate to Integrations:** Go to **Settings** > **Integrations.**
3. **Select E-commerce Platform:** Choose your platform (e.g., Shopify, WooCommerce) from the list.
4. **Authorize Connection:** Click **"Connect"** and follow the prompts to authorize Zippex to access your e-commerce data.
5. **Configure Settings:** Customize the integration settings as needed, such as syncing products, inventory, and orders.
6. **Complete Integration:** Click **"Save"** to finalize the integration. Your data will begin syncing automatically.

### **9.3. Can I develop custom integrations for Zippex?**

Yes, **Zippex** offers an API for developing custom integrations:

1. **Access API Documentation:** Visit our [API Documentation](https://merchant.zippex.app/api-docs) to understand available endpoints and usage.
2. **Obtain API Key:** Log in to your account, navigate to **Settings** > **API Access**, and generate an API key.
3. **Develop Integration:** Use the API key to authenticate your requests and develop your custom integration.
4. **Test Integration:** Ensure your integration works correctly by testing it in a sandbox environment.
5. **Deploy Integration:** Once tested, deploy your integration for live use.
6. **Support:** Contact our developer support team if you encounter any issues during development.

### **9.4. Are there any extensions or add-ons available for Zippex?**

Yes, **Zippex** offers various extensions and add-ons to enhance functionality:

- **Advanced Reporting:** Unlock more detailed analytics and custom report options.
- **Loyalty Programs:** Implement customer loyalty and rewards programs.
- **Multi-Location Management:** Manage multiple store locations from a single account.
- **Advanced Security:** Additional security features such as enhanced MFA options.
- **Custom Branding:** Customize the look and feel of receipts, invoices, and the POS interface.

You can browse and activate available extensions by navigating to **"Settings"** > **"Extensions."**

---

## **10. Miscellaneous**

### **10.1. How do I update Zippex to the latest version?**

**Zippex** is a web-based application, and updates are rolled out automatically. To ensure you have the latest features and security improvements:

- **Refresh Browser:** Regularly refresh your web browser to load the latest version.
- **Clear Cache:** If you encounter issues, try clearing your browser's cache and cookies.
- **Notifications:** Stay informed about updates by subscribing to our [Newsletter](https://merchant.zippex.app/newsletter) or following our [Blog](https://merchant.zippex.app/blog).

### **10.2. How can I provide feedback or suggest new features?**

We value your feedback! To provide suggestions:

1. **Visit Feedback Page:** Go to [merchant.zippex.app/feedback](https://merchant.zippex.app/feedback).
2. **Submit Feedback:** Fill out the feedback form with your suggestions or feature requests.
3. **Contact Support:** Alternatively, email your ideas to [feedback@zippex.app](mailto:feedback@zippex.app).
4. **Community Forums:** Participate in our [Community Forums](https://community.zippex.app) to discuss ideas with other merchants and our team.

### **10.3. Does Zippex offer a free trial?**

Yes, **Zippex** offers a **30-day free trial** for new merchants:

1. **Sign Up:** Create a new account at [merchant.zippex.app](https://merchant.zippex.app).
2. **Activate Trial:** Upon signing up, your free trial will be activated automatically.
3. **Explore Features:** Use all premium features during the trial period to evaluate the platform.
4. **Upgrade or Cancel:** Before the trial ends, choose to upgrade to a paid plan or cancel without any charges.

### **10.4. What languages does Zippex support?**

**Zippex** supports multiple languages to cater to a diverse user base:

- **English**
- **Spanish**
- **French**
- **German**
- **Chinese (Simplified)**
- **Japanese**
- **Portuguese**

To change the language:

1. **Log In:** Access your merchant account.
2. **Navigate to Settings:** Go to **Settings** > **Language Preferences.**
3. **Select Language:** Choose your preferred language from the dropdown menu.
4. **Save Changes:** Click **"Save"** to apply the new language settings.

### **10.5. How do I delete my Zippex account?**

To delete your **Zippex** account:

1. **Log In:** Access your merchant account.
2. **Navigate to Account Settings:** Go to **Settings** > **Account Settings.**
3. **Request Deletion:** Click on **"Delete Account."**
4. **Confirm Identity:** You may be asked to verify your identity through email or phone.
5. **Finalize Deletion:** Confirm that you want to permanently delete your account. **Note:** This action cannot be undone and will remove all your data from Zippex.
6. **Confirmation Email:** You will receive an email confirming the account deletion.

---

Thank you for choosing **Zippex**! We are committed to providing you with the best tools to manage and grow your business. If you have any additional questions, please don't hesitate to [contact our support team](mailto:info@zippex.app).
`;

  const filteredInventory = (searchQuery: string) => {
    if (searchQuery === "") {
      setFilteredHelpCenter(helpCenter);
      return helpCenter;
    }
    setFilteredHelpCenter(() => {
      const bufferedObject: { [key: string]: number } = {};
      const bufferedArray: { [key: string]: number }[] = [];
      Object.keys(helpCenter).map((item) => {
        if (
          helpCenter[item as keyof typeof helpCenter].title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          helpCenter[item as keyof typeof helpCenter].description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) {
          bufferedObject[item] = bufferedObject[item]
            ? bufferedObject[item]++
            : 0;
        }
        helpCenter[item as keyof typeof helpCenter].topics.map((topic) => {
          if (
            topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.description.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            bufferedObject[item] = bufferedObject[item]
              ? bufferedObject[item]++
              : 0;
          }
        });
      });
      return bufferedObject;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Merchant Help Center
      </h1>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => {
            filteredInventory(e.target.value);
            setSearchQuery(e.target.value);
          }}
          className="pl-10 pr-4 py-2 w-full no-focus"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-auto gap-4">
        {Object.keys(filteredHelpCenter).length === 0 && (
          <div className="w-full md:col-span-3 text-center text-gray-500 flex items-center justify-center">
            No results found for &quot;{searchQuery}&quot;
          </div>
        )}
        {filteredHelpCenter &&
          Object.keys(filteredHelpCenter).map((item) => {
            return (
              <HelpCentreCard
                key={item}
                title={helpCenter[item as keyof typeof helpCenter].title}
                description={
                  helpCenter[item as keyof typeof helpCenter].description
                }
                topics={helpCenter[item as keyof typeof helpCenter].topics}
              />
            );
          })}
      </div>
      <Card className="w-full">
        <ReactMarkdown className="markdown p-6">{FAQ}</ReactMarkdown>
      </Card>
    </div>
  );
}
