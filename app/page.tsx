"use client"

import { useState } from "react"

const SERVICES = [
  { icon: "🚪", label: "Check-in Management",      desc: "Meet & greet guests, handover keys, welcome walkthrough" },
  { icon: "🚶", label: "Check-out Management",     desc: "Inspect property, collect keys, report any damage" },
  { icon: "🧹", label: "Cleaning Coordination",    desc: "Schedule & supervise turnovers between guest stays" },
  { icon: "💬", label: "Guest Communication",      desc: "Handle all guest messages before, during & after stay" },
  { icon: "📋", label: "Listing Management",       desc: "Optimise and maintain your Airbnb / Booking.com listings" },
  { icon: "🔧", label: "Maintenance Logging",      desc: "Report issues, coordinate contractors, follow up on fixes" },
  { icon: "📊", label: "DTCM Reporting",           desc: "Handle tourism tax filings and regulatory compliance" },
  { icon: "🏠", label: "Interior Styling",         desc: "Stage and photograph your property for maximum appeal" },
]

const HOW_LANDLORD = [
  { step: "1", title: "Post your property",    desc: "Add your holiday home and describe what support you need." },
  { step: "2", title: "Browse co-hosts",       desc: "Filter by area, service, rating, and experience. Read reviews." },
  { step: "3", title: "Hire & relax",          desc: "Send a job offer, payment is escrowed, release on completion." },
]

const HOW_COHOST = [
  { step: "1", title: "Create your profile",  desc: "List your services, set your prices, and showcase your experience." },
  { step: "2", title: "Accept job offers",    desc: "Landlords browse and send you offers. Accept the ones you want." },
  { step: "3", title: "Get paid",             desc: "Complete the job, mark it done, and payment is released to you." },
]

const TRUST = [
  { icon: "🛡️", label: "Verified identities",      desc: "Every co-host is ID-verified before going live on the platform." },
  { icon: "🔒", label: "Escrow protection",         desc: "Payments are held securely until the job is completed." },
  { icon: "⭐", label: "Two-way reviews",           desc: "Both parties leave reviews after every job. No anonymous ratings." },
  { icon: "📜", label: "DTCM compliant",            desc: "Built for Dubai's holiday home regulatory framework." },
]

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold" style={{ color: "#0F6E56" }}>
            The Co-Host
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 transition">How it works</a>
            <a href="#services" className="text-gray-500 hover:text-gray-900 transition">Services</a>
            <a href="#for-cohosts" className="text-gray-500 hover:text-gray-900 transition">Become a co-host</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition">
              Log in
            </a>
            <a href="/signup" className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition"
              style={{ backgroundColor: "#0F6E56" }}>
              Get started
            </a>
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 text-sm">
            <a href="#how-it-works" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#services" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#for-cohosts" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Become a co-host</a>
            <div className="flex gap-3 pt-2">
              <a href="/login" className="flex-1 text-center border border-gray-200 py-2.5 rounded-xl text-gray-700 font-medium">Log in</a>
              <a href="/signup" className="flex-1 text-center py-2.5 rounded-xl text-white font-medium"
                style={{ backgroundColor: "#0F6E56" }}>Get started</a>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(15,110,86,0.08) 0%, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-28 text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#0F6E56]/10 text-[#0F6E56] text-xs font-semibold px-4 py-1.5 rounded-full mb-8 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F6E56] inline-block" />
            Dubai's Co-Hosting Marketplace
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Hire a co-host.<br />
            <span style={{ color: "#0F6E56" }}>Not a management company.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-4 leading-relaxed">
            Connect directly with verified hospitality freelancers who handle your holiday home operations
            — for fixed fees, not a percentage of your revenue.
          </p>

          <p className="text-sm text-gray-400 mb-10">
            Used by landlords across Dubai Marina · Downtown · JBR · Palm Jumeirah · Business Bay
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup?type=landlord"
              className="px-8 py-4 rounded-xl text-base font-semibold text-white transition hover:opacity-90 shadow-lg shadow-[#0F6E56]/20"
              style={{ backgroundColor: "#0F6E56" }}>
              I'm a landlord →
            </a>
            <a href="/signup?type=cohost"
              className="px-8 py-4 rounded-xl text-base font-semibold text-gray-700 border border-gray-200 hover:border-gray-400 transition bg-white">
              I want to become a co-host
            </a>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-6 mt-14 text-xs text-gray-400">
            {["UAE-based platform", "DTCM compliant", "Escrow-protected payments", "Verified co-hosts only"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="text-[#0F6E56]">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem section ── */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The old model takes too much.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Traditional holiday home management companies charge 15–25% of your gross revenue. That's tens of thousands of dirhams a year — for work done by freelancers anyway.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Old way */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-6">❌ The old way</div>
              <ul className="space-y-4">
                {[
                  "Management company takes 20% of every booking",
                  "You lose control of your own property",
                  "Opaque fees, poor communication",
                  "Inflexible — all or nothing contracts",
                  "The work is done by a freelancer anyway",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-400 text-sm">
                    <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* New way */}
            <div className="bg-[#0F6E56]/10 rounded-2xl p-8 border border-[#0F6E56]/30">
              <div className="text-sm font-semibold text-[#4ade80] uppercase tracking-wide mb-6">✓ The Co-Host way</div>
              <ul className="space-y-4">
                {[
                  "Fixed fee per service — no revenue sharing",
                  "You stay in full control of your property",
                  "Transparent pricing, direct communication",
                  "Hire only what you need, when you need it",
                  "Hire the freelancer directly — no middleman",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-200 text-sm">
                    <span className="text-[#4ade80] mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works (Landlords) ── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-[#0F6E56] uppercase tracking-widest mb-3">For landlords</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get help in 3 steps.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Find the right co-host for your property in minutes, not months.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_LANDLORD.map((s) => (
              <div key={s.step} className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-5"
                  style={{ backgroundColor: "#0F6E56" }}>
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/signup?type=landlord"
              className="inline-block px-8 py-4 rounded-xl text-base font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#0F6E56" }}>
              Find a co-host now
            </a>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-[#0F6E56] uppercase tracking-widest mb-3">Services</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hire by service. Pay per job.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Co-hosts offer individual services at fixed prices. Pick exactly what your property needs — nothing more.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map((s) => (
              <div key={s.label}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#0F6E56]/30 hover:shadow-md transition-all group cursor-default">
                <div className="text-2xl mb-3">{s.icon}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#0F6E56] transition">{s.label}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For co-hosts ── */}
      <section id="for-cohosts" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-sm font-semibold text-[#0F6E56] uppercase tracking-widest mb-3">For co-hosts</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Turn your hospitality skills into income.
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                If you have experience in property management, guest relations, cleaning, or hospitality — there are landlords in Dubai who need you right now. Set your own prices, choose your jobs.
              </p>

              <div className="space-y-4 mb-10">
                {HOW_COHOST.map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: "#0F6E56" }}>
                      {s.step}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{s.title}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <a href="/signup?type=cohost"
                className="inline-block px-8 py-4 rounded-xl text-base font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "#0F6E56" }}>
                Apply as a co-host
              </a>
            </div>

            {/* Stats card */}
            <div className="bg-gray-950 rounded-3xl p-8 text-white">
              <div className="text-sm text-gray-400 mb-6">Why co-hosts choose us</div>
              <div className="space-y-6">
                {[
                  { num: "0%", label: "Platform cut from your earnings on completed jobs" },
                  { num: "AED 0", label: "Cost to join — free to create your profile" },
                  { num: "48h", label: "Average time from sign-up to first job offer" },
                  { num: "🔒", label: "Escrow protection — you always get paid" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-4 border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                    <div className="text-2xl font-bold w-16 shrink-0" style={{ color: "#4ade80" }}>{s.num}</div>
                    <div className="text-sm text-gray-300">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / How we protect you ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-sm font-semibold text-[#0F6E56] uppercase tracking-widest mb-3">Trust & Safety</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built to protect both sides.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We handle verification, escrow, and reviews so both landlords and co-hosts can transact with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {TRUST.map((t) => (
              <div key={t.label} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <div className="text-3xl mb-3">{t.icon}</div>
                <div className="font-semibold text-gray-900 text-sm mb-2">{t.label}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24" style={{ background: "linear-gradient(135deg, #0F6E56, #0a4d3d)" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Ready to take back control?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
            Join landlords and hospitality professionals already using The Co-Host in Dubai.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup?type=landlord"
              className="px-8 py-4 rounded-xl font-semibold text-base transition bg-white hover:bg-gray-100"
              style={{ color: "#0F6E56" }}>
              Start as a landlord
            </a>
            <a href="/signup?type=cohost"
              className="px-8 py-4 rounded-xl font-semibold text-base transition text-white border border-white/40 hover:border-white hover:bg-white/10">
              Join as a co-host
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="text-xl font-bold text-white mb-1">The Co-Host</div>
              <div className="text-sm text-gray-500">Dubai's co-hosting marketplace. Built for landlords and hospitality freelancers.</div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <a href="/login" className="hover:text-gray-300 transition">Log in</a>
              <a href="/signup" className="hover:text-gray-300 transition">Sign up</a>
              <a href="/cohosts" className="hover:text-gray-300 transition">Browse co-hosts</a>
              <a href="mailto:hello@thecohost.com" className="hover:text-gray-300 transition">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-600">
            © 2026 The Co-Host · Dubai, UAE · Under Ayoubico Consultancies DWC LLC
          </div>
        </div>
      </footer>

    </main>
  )
}
