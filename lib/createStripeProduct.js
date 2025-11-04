const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createStripeProducts() {
  try {
    console.log('Creating subscription products...');

    // Monthly product
    const monthlyPrice = await stripe.prices.create({
      product_data: {
        name: 'TradersSquare Plus Monthly',
        description: 'Premium membership - Monthly billing',
      },
      unit_amount: 1999, // $19.99
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    // Yearly product  
    const yearlyPrice = await stripe.prices.create({
      product_data: {
        name: 'TradersSquare Plus Yearly', 
        description: 'Premium membership - Yearly billing (2 months free!)',
      },
      unit_amount: 19900, // $199.00
      currency: 'usd',
      recurring: { interval: 'year' },
    });

    console.log('✅ Products created successfully!');

  } catch (error) {
    console.error('❌ Error creating products:', error);
  }
}

createStripeProducts();