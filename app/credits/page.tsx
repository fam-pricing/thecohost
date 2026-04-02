"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { loadStripe } from "@stripe/stripe-js"

const TOPUP_OPTIONS = [500, 1000, 2500, 5000, 10000, 25000]

export default function CreditsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [landlordId, setLandlordId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [topupAmount, setTopupAmount] = useState(1000)
  const [customAmount, setCustomAmount] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const { data: lp } = await supabase.from("landlord_profiles").select("id, credit_balance").eq("user_id", user.id).single()
      if (!lp) { router.push("/dashboard"); return }
      setLandlordId(lp.id)
      setBalance(lp.credit_balance ?? 0)
      const { data: txns } = await supabase.from("credit_transactions")
        .select("id, transaction_type, amount, balance_after, description, created_at, jobs(title)")
        .eq("landlord_id", lp.id)
        .order("created_at", { ascending: false })
        .limit(20)
      setTransactions(txns ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleTopUp() {
    const amount = customAmount ? parseInt(customAmount) : topupAmount
    if (amount < 500 || amount > 50000) {
      alert("Amount must be between AED 500 and AED 50,000.")
      return
    }
    setProcessing(true)
    // In production this calls /api/stripe/create-payment-intent
    // For now simulate a direct credit add (dev mode)
    if (process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      const { data: lp } = await supabase.from("landlord_profiles").select("credit_balance").eq("id", landlordId!).single()
      const newBalance = (lp?.credit_balance ?? 0) + amount
      await supabase.from("landlord_profiles").update({ credit_balance: newBalance }).eq("id", landlordId!)
      await supabase.from("credit_transactions").insert({
        landlord_id: landlordId!,
        transaction_type: "topup",
        amount,
        balance_after: newBalance,
        description: `Credit top-up: AED ${amount.toLocaleString()}`,
      })
      setBalance(newBalance)
      const { data: txns } = await supabase.from("credit_transactions")
        .select("id, transaction_type, amount, balance_after, description, created_at")
        .eq("landlord_id", landlordId!)
        .order("created_at", { ascending: false })
        .limit(20)
      setTransactions(txns ?? [])
    }
    setProcessing(false)
  }

  const txnColor: Record<string, string> = {
    topup: "text-green-600",
    escrow: "text-amber-600",
    release: "text-blue-600",
    refund: "text-green-600",
  }
  const txnLabel: Record<string, string> = {
    topup: "Top-up",
    escrow: "Escrowed",
    release: "Released",
    refund: "Refunded",
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Credits</h1>

        {/* Balance card */}
        <div className="rounded-2xl p-6 mb-6 text-white" style={{ background: "linear-gradient(135deg, #0F6E56, #0a4d3d)" }}>
          <div className="text-sm opacity-70 mb-1">Available balance</div>
          <div className="text-4xl font-bold">AED {balance.toLocaleString()}</div>
          <div className="text-sm opacity-60 mt-2">Used for job escrow and payments</div>
        </div>

        {/* Top-up section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top Up Credits</h2>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {TOPUP_OPTIONS.map(amt => (
              <button key={amt} onClick={() => { setTopupAmount(amt); setCustomAmount("") }}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  topupAmount === amt && !customAmount
                    ? "text-white border-transparent"
                    : "text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
                style={topupAmount === amt && !customAmount ? { backgroundColor: "#0F6E56" } : {}}>
                AED {amt.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mb-4">
            <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
              placeholder="Custom amount (AED 500–50,000)"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
          </div>
          <button onClick={handleTopUp} disabled={processing}
            className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#0F6E56" }}>
            {processing ? "Processing..." : `Top Up AED ${(customAmount ? parseInt(customAmount) : topupAmount).toLocaleString()}`}
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">Payments powered by Stripe. Secure & instant.</p>
        </div>

        {/* Transactions */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Transaction History</h2>
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{t.description ?? txnLabel[t.transaction_type]}</div>
                    <div className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${txnColor[t.transaction_type] ?? "text-gray-900"}`}>
                      {t.amount > 0 ? "+" : ""}AED {Math.abs(t.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Balance: AED {t.balance_after?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
