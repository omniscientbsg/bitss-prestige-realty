import { db } from "@/lib/database";
import Link from "next/link";
import { ArrowRight, Star, Shield, Diamond, Building2 } from "lucide-react";

export default function LandingPage() {
  const properties = db.getAll().filter(p => p.hot || p.distress).slice(0, 3); // Get top 3 hot/distress properties

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-gold" />
            <div className="font-heading text-2xl font-semibold tracking-wide text-white">
              BITSS <span className="text-gold font-light">Prestige</span>
            </div>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-platinum">
            <Link href="#portfolio" className="hover:text-gold transition-colors">Curated Portfolio</Link>
            <Link href="#advisory" className="hover:text-gold transition-colors">Wealth Advisory</Link>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/admin" 
              className="px-5 py-2.5 text-sm font-medium border border-white/10 rounded-full hover:bg-white/5 transition-all text-platinum"
            >
              Partner Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 relative">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 flex flex-col gap-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 w-fit">
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span className="text-xs font-medium text-gold tracking-widest uppercase">Exclusive Off-Market Access</span>
          </div>
          
          <h1 className="font-heading text-6xl lg:text-7xl leading-tight text-white">
            Redefining <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-[#E8C97A] to-gold">Luxury Investments</span><br/>
            in Dubai.
          </h1>
          
          <p className="text-lg text-platinum/70 leading-relaxed max-w-xl">
            We don't just sell real estate; we engineer wealth. Gain exclusive access to off-plan pre-launches, distress deals, and high-yield properties curated strictly for elite investors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="#portfolio" className="px-8 py-4 bg-gold hover:bg-[#D4B35E] text-[#0A0A0F] font-semibold rounded-full transition-all flex items-center justify-center gap-2 group">
              View Curated Assets
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#advisory" className="px-8 py-4 border border-white/10 hover:border-gold/30 hover:bg-gold/5 text-white font-medium rounded-full transition-all flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              Speak to an Advisor
            </Link>
          </div>
        </div>

        {/* Floating Asset Cards (Preview) */}
        <div className="flex-1 relative w-full max-w-md lg:max-w-none h-[600px] z-10 hidden md:block">
          {properties.map((prop, idx) => (
            <div 
              key={prop.id}
              className="absolute bg-dark3 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl transition-all hover:scale-105 hover:border-gold/30 cursor-pointer"
              style={{
                top: `${idx * 120}px`,
                left: `${idx * 60}px`,
                zIndex: 30 - idx,
                transform: `rotate(${(idx - 1) * 3}deg)`
              }}
            >
              <div className="w-72 h-48 rounded-xl bg-dark1 overflow-hidden relative border border-white/5">
                <img src={prop.image} alt={prop.name} className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-medium text-white flex items-center gap-1">
                  {prop.distress ? '🚨 Distress Deal' : '💎 Pre-Launch'}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-heading text-xl text-white">{prop.name}</h3>
                <p className="text-sm text-platinum/60">{prop.location}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div>
                    <div className="text-xs text-platinum/50 uppercase tracking-wider">Projected Yield</div>
                    <div className="text-gold font-semibold">{prop.gross_yield}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-platinum/50 uppercase tracking-wider">Entry Price</div>
                    <div className="text-white font-medium">AED {prop.price_aed.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Curated Portfolio Section */}
      <section id="portfolio" className="py-24 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="font-heading text-4xl lg:text-5xl text-white mb-4">The Portfolio</h2>
          <p className="text-platinum/60 max-w-2xl text-lg">
            A strictly curated selection of high-yield opportunities, distress sales, and pre-launches currently available on the market.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {db.getAll().filter(p => !p.hidden).slice(0, 6).map(prop => (
            <div key={prop.id} className="bg-dark2 border border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-all flex flex-col group cursor-pointer">
              <div className="h-64 relative bg-dark1 overflow-hidden">
                {prop.image && <img src={prop.image} alt={prop.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />}
                <div className="absolute top-4 right-4 flex gap-2">
                  {prop.hot && <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">HOT</span>}
                  {prop.distress && <span className="bg-orange-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">DISTRESS</span>}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-heading text-2xl text-white mb-2 group-hover:text-gold transition-colors">{prop.name}</h3>
                <p className="text-sm text-platinum/60 mb-6 flex-1">{prop.location}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                  <div>
                    <div className="text-xs text-platinum/40 uppercase tracking-widest mb-1">Entry Price</div>
                    <div className="text-white font-medium text-lg">AED {prop.price_aed.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-platinum/40 uppercase tracking-widest mb-1">Projected Yield</div>
                    <div className="text-gold font-semibold text-lg">{prop.gross_yield}%</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advisory Section */}
      <section id="advisory" className="py-24 relative overflow-hidden bg-dark2/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="font-heading text-4xl lg:text-5xl text-white mb-6">Expert Wealth Advisory</h2>
            <p className="text-platinum/70 text-lg leading-relaxed mb-8">
              We provide end-to-end bespoke services for UHNW individuals looking to enter the Dubai real estate market. From initial portfolio strategy and asset selection to golden visa facilitation and property management, our experts handle everything.
            </p>
            <ul className="space-y-4 mb-10">
              {["Exclusive Pre-Launch Allocation", "Distressed Asset Sourcing", "Golden Visa Processing", "Turnkey Property Management"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-platinum">
                  <Diamond className="w-5 h-5 text-gold" /> {item}
                </li>
              ))}
            </ul>
            <a href="mailto:contact@bitss.ae" className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-gold/30 rounded-full transition-all font-medium">
              Contact Us Directly
            </a>
          </div>
          <div className="flex-1 relative">
            <div className="aspect-square max-w-md mx-auto rounded-full bg-gradient-to-tr from-gold/20 to-transparent p-1">
              <div className="w-full h-full rounded-full bg-dark1 overflow-hidden border border-white/10 p-8 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-dark2 rounded-full border border-gold/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(201,168,76,0.2)]">
                    <Shield className="w-10 h-10 text-gold" />
                  </div>
                  <h3 className="font-heading text-3xl text-white mb-2">Secure Your Legacy</h3>
                  <p className="text-sm text-platinum/60 max-w-xs mx-auto">
                    Partner with the most trusted luxury real estate advisors in the UAE.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <div className="border-t border-white/5 bg-dark2/50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap justify-between gap-8">
          {[
            { label: 'Off-Market Assets', value: '$120M+' },
            { label: 'Avg. Capital Gain (5Yr)', value: '42%' },
            { label: 'Client Retention', value: '98%' },
            { label: 'Direct Developer Tier', value: 'VIP' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="text-3xl font-heading text-gold">{stat.value}</div>
              <div className="text-xs text-platinum/50 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
