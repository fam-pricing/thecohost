"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [conversations, setConversations] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()
      setUserType(profile?.user_type ?? null)

      const { data: convos } = await supabase
        .from("conversations")
        .select(`
          id, last_message_at,
          landlord_profiles(profiles!inner(full_name)),
          cohost_profiles(profiles!inner(full_name)),
          messages(id, content, created_at, is_read, sender_id)
        `)
        .order("last_message_at", { ascending: false })
        .limit(1, { foreignTable: "messages" })

      setConversations(convos ?? [])
      setLoading(false)
    }
    load()
  }, [])

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
        {conversations.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">💬</div>
            <p>No conversations yet. Hire a co-host or accept a job to start chatting.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(c => {
              const isLandlord = userType === "landlord"
              const otherName = isLandlord
                ? (c.cohost_profiles as any)?.profiles?.full_name
                : (c.landlord_profiles as any)?.profiles?.full_name
              const lastMsg = (c.messages as any[])?.[0]
              return (
                <Link key={c.id} href={`/messages/${c.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-lg">💬</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{otherName ?? "Unknown"}</div>
                    {lastMsg && <div className="text-sm text-gray-400 truncate">{lastMsg.content}</div>}
                  </div>
                  <div className="text-xs text-gray-400">{new Date(c.last_message_at).toLocaleDateString()}</div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
