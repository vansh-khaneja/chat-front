import { NextRequest } from 'next/server';
// app/api/create-checkout-session/route.ts
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const { userId } = await auth()


  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Demo Product',
            },
            unit_amount: 500, // $5.00
          },
          quantity: 1,
        },
      ],
      customer_email: email, // 📨 Send email here
      success_url: 'https://lexscope.vercel.app/success',
      cancel_url: 'https://lexscope.vercel.app/',
      metadata: {
        userId: userId, // ← pass this from your frontend
      },
    });

    return Response.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe session error:', err.message);
    return new Response('Something went wrong.', { status: 500 });
  }
}
