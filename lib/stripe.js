import Stripe from 'stripe';

// Initialize server-side Stripe client
// Uses STRIPE_SECRET_KEY from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      appInfo: {
        name: 'Avora Library Platform',
        version: '1.0.0',
      },
    })
  : null;

export const isStripeConfigured = () => Boolean(stripeSecretKey);
