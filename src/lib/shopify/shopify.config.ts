const shop = "merchant-shop-name.myshopify.com"; // Extract this from the merchant
const clientId = process.env.SHOPIFY_API_KEY; // From Shopify Partner dashboard
const scopes = "read_products"; // You only need product read scope
const redirectUri = encodeURIComponent("https://yourapp.com/shopify/callback"); // Your app's callback URL

const authorizationUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=random_string`;

// Redirect merchant to this URL to authenticate with Shopify
window.location.href = authorizationUrl;
