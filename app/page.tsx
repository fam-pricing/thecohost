export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div className="text-2xl font-bold text-[#0F6E56]">The Co-Host</div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">For Landlords</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">For Co-Hosts</a>
          <a href="#" className="bg-[#0F6E56] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0a5a45] transition">Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-block bg-[#0F6E56]/10 text-[#0F6E56] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Now available in Dubai
        </div>
        <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-6">
          Hire a co-host.<br />Not a management company.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Connect with verified hospitality freelancers who handle your short-term rental operations — at fixed fees, not revenue percentages. You keep full control.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a href="#" className="bg-[#0F6E56] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#0a5a45] transition">
            Find a Co-Host
          </a>
          <a href="#" className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-gray-300 transition">
            Become a Co-Host
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0F6E56] py-16">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">0%</div>
            <div className="text-[#0F6E56]/30 text-white/70">Revenue share taken</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">100%</div>
            <div className="text-white/70">Property control kept</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">Fixed</div>
            <div className="text-white/70">Fees per service</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-8 py-24">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">How it works</h2>
        <p className="text-gray-500 text-center mb-16">Simple. Transparent. You stay in control.</p>
        <div className="grid grid-cols-3 gap-10">
          {[
            { step: '01', title: 'Post a job', desc: 'Describe what you need — check-in cover, cleaning coordination, guest messaging. Pick the date and property.' },
            { step: '02', title: 'Hire a co-host', desc: 'Browse verified co-hosts, see their rates upfront, and hire the one that fits. Pay via credits — no surprises.' },
            { step: '03', title: 'Job done', desc: 'Co-host completes the work. You confirm. Credits released. Leave a review. Simple.' },
          ].map((item) => (
            <div key={item.step} className="bg-gray-50 rounded-2xl p-8">
              <div className="text-[#0F6E56] font-bold text-sm mb-4">{item.step}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Services on the platform</h2>
          <p className="text-gray-500 text-center mb-16">Co-hosts offer fixed-price services across every part of hosting.</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              'Check-in Management',
              'Check-out Management',
              'Cleaning Coordination',
              'Guest Communication',
              'Listing Management',
              'Maintenance Logging',
              'DTCM Reporting',
              'Portal Access Management',
            ].map((service) => (
              <div key={service} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="w-8 h-8 bg-[#0F6E56]/10 rounded-lg mb-3"></div>
                <div className="text-sm font-medium text-gray-800">{service}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-8 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to take back control?</h2>
        <p className="text-gray-500 text-lg mb-10">Join landlords across Dubai who are done with management companies. Hire your first co-host today.</p>
        <a href="#" className="bg-[#0F6E56] text-white px-10 py-4 rounded-xl text-base font-semibold hover:bg-[#0a5a45] transition inline-block">
          Get Started Free
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-[#0F6E56] font-bold">The Co-Host</div>
          <div className="text-gray-400 text-sm">© 2026 The Co-Host. Dubai, UAE.</div>
        </div>
      </footer>
    </main>
  )
}
