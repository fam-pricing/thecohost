"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const TYPE_LABEL: Record<string, string> = {
  escrow:  "Payment escrowed",
  release: "Payment released to co-host",
  refund:  "Refund",
  topup:   "Top-up",
}

const TYPE_COLOR: Record<string, string> = {
  escrow:  "text-amber-600 bg-amber-50",
  release: "text-blue-600 bg-blue-50",
  refund:  "text-green-600 bg-green-50",
  topup:   "text-green-600 bg-green-50",
}

const TYPE_ICON: Record<string, string> = {
  escrow:  "🔒",
  release: "✅",
  refund:  "↩️",
  topup:   "➕",
}

export default function PaymentsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<"landlord" | "cohost" | null>(null)

  // Stats
  const totalSpent = transactions.filter(t => t.transaction_type === "escrow").reduce((s, t) => s + t.amount, 0)
  const totalRefunded = transactions.filter(t => t.transaction_type === "refund").reduce((s, t) => s + t.amount, 0)
  const escrowed = transactions.filter(t => t.transaction_type === "escrow").length

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      // Check user type
      const { data: lp } = await supabase
        .from("landlord_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (lp) {
        setUserType("landlord")
        const { data: txns } = await supabase
          .from("credit_transactions")
          .select("id, transaction_type, amount, description, created_at, job_id")
          .eq("landlord_id", lp.id)
          .order("created_at", { ascending: false })
          .limit(50)
        setTransactions(txns ?? [])
      } else {
        // Co-host: no payment history yet (receives payouts externally)
        setUserType("cohost")
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments</h1>
        <p className="text-gray-500 mb-8">
          {userType === "landlord"
            ? "Track all payments made through The Co-Host platform. Funds are held in escrow and released to co-hosts on job completion."
            : "Your earnings are transferred directly to you upon job completion. Payment method setup coming soon."}
        </p>

        {userType === "cohost" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-3">💸</div>
            <h2 className="font-semibold text-gray-900 mb-2">Earnings coming soon</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Once a job is completed, payment will be transferred to your registered account. Payout setup will be available here shortly.
            </p>
          </div>
        )}

        {userType === "landlord" && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{escrowed}</div>
                <div className="text-xs text-gray-400 mt-0.5">Jobs paid</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: "#0F6E56" }}>AED {totalSpent.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-0.5">Total spent</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">AED {totalRefunded.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-0.5">Refunded</div>
              </div>
            </div>

            {/* Escrow info banner */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
              <span className="text-lg leading-none mt-0.5">🔒</span>
              <div>
                <div className="font-medium">How escrow works</div>
                <div className="text-xs text-amber-600 mt-0.5">
                  Payment is collected when you post a job. Funds are held securely and only released to the co-host when the job is marked complete. If a job is cancelled before it starts, you receive a full refund.
                </div>
              </div>
            </div>

            {/* Payment gateway notice */}
            <div className="flex items-start gap-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-3 mb-6 text-sm text-gray-500">
              <span className="text-lg leading-none mt-0.5">⚙️</span>
              <div>
                <div className="font-medium text-gray-700">Payment gateway — coming soon</div>
                <div className="text-xs mt-0.5">
                  We are integrating a UAE-compliant payment gateway. All charges will appear here once live.
                </div>
              </div>
            </div>

            {/* Transaction history */}
            {transactions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="text-4xl mb-3">📋</div>
                <h2 className="font-semibold text-gray-900 mb-1">No transactions yet</h2>
                <p className="text-sm text-gray-500">Your payment history will appear here after you post your first job.</p>
                <a
                  href="/cohosts"
                  className="inline-block mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-medium"
                  style={{ backgroundColor: "#0F6E56" }}
                >
                  Browse co-hosts
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Transaction history</h2>
                <div className="space-y-3">
                  {transactions.map(t => (
                    <div key={t.id} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-start gap-3">
                        <span className="text-xl leading-none mt-0.5">{TYPE_ICON[t.transaction_type] ?? "💳"}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{t.description}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(t.created_at).toLocaleDateString("en-AE", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>
                          {t.job_id && (
                            <a href={`/jobs/${t.job_id}`} className="text-xs underline mt-0.5" style={{ color: "#0F6E56" }}>
                              View job →
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[t.transaction_type] ?? "text-gray-600 bg-gray-100"}`}>
                          AED {t.amount.toLocaleString()}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          {TYPE_LABEL[t.transaction_type] ?? t.transaction_type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
