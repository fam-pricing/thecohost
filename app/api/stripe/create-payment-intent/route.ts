import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { amount } = await request.json()
  if (!amount || amount < 500 || amount > 50000) {
    return NextResponse.json({ error: "Amount must be between AED 500 and 50,000" }, { status: 400 })
  }

  const { data: lp } = await supabase.from("landlord_profiles").select("id").eq("user_id", user.id).single()
  if (!lp) return NextResponse.json({ error: "Landlord profile not found" }, { status: 404 })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "aed",
    metadata: { landlord_id: lp.id, user_id: user.id, type: "credit_topup" },
    automatic_payment_methods: { enabled: true },
  })

  return NextResponse.json({ client_secret: paymentIntent.client_secret })
}
