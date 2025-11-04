require('dotenv').config({ path: '.env.local' });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    console.log("Creating subscription products...");

    // Step 1: Create Products First
    const monthlyProduct = await stripe.products.create({
      name: "TradersSquare Plus Monthly",
      description: "Premium membership - Monthly billing",
    });

    const yearlyProduct = await stripe.products.create({
      name: "TradersSquare Plus Yearly", 
      description: "Premium membership - Yearly billing (2 months free!)",
    });

    console.log("✅ Products created");

    // Step 2: Create Prices for Each Product
    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id, // Link to the product
      unit_amount: 1999, // $19.99
      currency: "usd",
      recurring: { interval: "month" },
    });

    const yearlyPrice = await stripe.prices.create({
      product: yearlyProduct.id, // Link to the product
      unit_amount: 19900, // $199.00
      currency: "usd",
      recurring: { interval: "year" },
    });

    console.log("✅ Prices created successfully!");
    console.log("");
    console.log("=== COPY THESE TO YOUR .env.local FILE ===");
    console.log("NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=" + monthlyPrice.id);
    console.log("NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=" + yearlyPrice.id);
    console.log("==========================================");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createProducts();