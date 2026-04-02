import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as any
    const { landlord_id, type } = pi.metadata

    if (type === "credit_topup" && landlord_id) {
      const amount = Math.round(pi.amount / 100)
      const { data: lp } = await supabaseAdmin
        .from("landlord_profiles").select("credit_balance").eq("id", landlord_id).single()

      const newBalance = (lp?.credit_balance ?? 0) + amount
      await supabaseAdmin.from("landlord_profiles")
        .update({ credit_balance: newBalance }).eq("id", landlord_id)

      await supabaseAdmin.from("credit_transactions").insert({
        landlord_id,
        transaction_type: "topup",
        amount,
        balance_after: newBalance,
        stripe_payment_intent_id: pi.id,
        description: `Credit top-up: AED ${amount.toLocaleString()}`,
      })
    }
  }

  return NextResponse.json({ received: true })
}
