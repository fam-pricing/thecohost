"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

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

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const { data: lp } = await supabase
        .from("landlord_profiles")
        .select("id, credit_balance")
        .eq("user_id", user.id)
        .single()
      if (!lp) { router.push("/dashboard"); return }
      setLandlordId(lp.id)
      setBalance(lp.credit_balance ?? 0)
      const { data: txns } = await supabase
        .from("credit_transactions")
        .select("id, transaction_type, amount, balance_after, description, created_at")
        .eq("landlord_id", lp.id)
        .order("created_at", { ascending: false })
        .limit(20)
      setTransactions(txns ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const finalAmount = customAmount ? parseInt(customAmount) : topupAmount

  const txnColor: Record<string, string> = {
    topup:   "text-green-600",
    escrow:  "text-amber-600",
    release: "text-blue-600",
    refund:  "text-green-600",
  }
  const txnSign: Record<string, string> = {
    topup: "+", escrow: "-", release: "-", refund: "+"
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

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
        <div
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ background: "linear-gradient(135deg, #0F6E56, #0a4d3d)" }}
        >
          <div className="text-sm opacity-70 mb-1">Available balance</div>
          <div className="text-4xl font-bold">AED {balance.toLocaleString()}</div>
          <div className="text-sm opacity-60 mt-2">Used for job escrow and payments to co-hosts</div>
        </div>

        {/* Top-up section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">Top Up Credits</h2>
          <p className="text-sm text-gray-400 mb-4">
            Payment method will be configured soon. Select an amount to request a top-up.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {TOPUP_OPTIONS.map(amt => (
              <button
                key={amt}
                onClick={() => { setTopupAmount(amt); setCustomAmount("") }}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  topupAmount === amt && !customAmount
                    ? "text-white border-transparent"
                    : "text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
                style={topupAmount === amt && !customAmount ? { backgroundColor: "#0F6E56" } : {}}
              >
                AED {amt.toLocaleString()}
              </button>
            ))}
          </div>

          <input
            type="number"
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            placeholder="Or enter a custom amount (AED)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900 mb-4"
          />

          {/* Placeholder CTA — payment gateway TBD */}
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">
              Payment gateway coming soon
            </p>
            <p className="text-xs text-gray-400">
              Selected amount: <strong>AED {finalAmount > 0 ? finalAmount.toLocaleString() : "—"}</strong>
            </p>
          </div>
        </div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Transaction History</h2>
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{t.description}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(t.created_at).toLocaleDateString("en-AE", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${txnColor[t.transaction_type] ?? "text-gray-900"}`}>
                      {txnSign[t.transaction_type]}AED {Math.abs(t.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Balance: AED {t.balance_after?.toLocaleString()}
                    </div>
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
