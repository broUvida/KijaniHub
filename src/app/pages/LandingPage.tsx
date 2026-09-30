import { useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import {
  Leaf, Recycle, Droplets, ArrowRight, CheckCircle, Globe, Home, Building2,
  Sprout, MapPin, Briefcase, TrendingUp, Landmark, Coins, Heart, Bug,
  RefreshCw, LineChart, Phone, Mail,
} from 'lucide-react';

/** Founder portrait (embedded so no separate asset upload is needed) */
const FOUNDER_PHOTO = 'data:image/jpeg;base64,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';


/**
 * LandingPage — public commercial site for Kijani Hub.
 * Positions Kijani Hub as a revenue-generating circular economy company,
 * powered by the KijaniSense IoT platform (the dashboard behind /login).
 */

/** Simple count-up hook for the conversion ledger */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const t0 = performance.now();
            const tick = (t: number) => {
              const p = Math.min((t - t0) / duration, 1);
              setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, value };
}

function LedgerOutput({ target, label, money = false }: { target: number; label: string; money?: boolean }) {
  const { ref, value } = useCountUp(target);
  return (
    <div ref={ref}>
      <div className={`font-mono text-2xl md:text-3xl font-semibold ${money ? 'text-amber-400' : 'text-emerald-300'}`}>
        {value.toLocaleString()}{money ? 'K' : ''}
      </div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-emerald-100/60 mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  const marketStats = [
    { value: '~4,600 t', label: 'of solid waste generated in Dar es Salaam every day' },
    { value: '>60%', label: 'of that waste is organic — our raw material' },
    { value: '<50%', label: 'is formally collected, leaving a huge service gap' },
    { value: 'TZS 0', label: 'what we pay for our core feedstock' },
    { value: '2 markets', label: 'we sell into: animal feed & organic fertilizer' },
    { value: 'B2B + B2C + B2G', label: 'households, farmers, businesses & municipalities' },
  ];

  const steps = [
    { icon: Home, title: 'Collect', text: 'Households and businesses pay a subscription for reliable organic waste collection by trained youth teams.' },
    { icon: MapPin, title: 'Sort & track', text: 'Smart bins with fill-level sensors tell us exactly where waste is and when to collect — cutting fuel and labour costs.' },
    { icon: Bug, title: 'Process', text: 'Black Soldier Fly units, composting and biogas digestion convert waste into feed, fertilizer and energy.' },
    { icon: Coins, title: 'Sell', text: 'Larvae protein feed goes to poultry & fish farmers; frass fertilizer to urban growers; biogas offsets our energy costs.' },
    { icon: RefreshCw, title: 'Reinvest', text: 'Margins fund more bins, youth micro-franchises and processing capacity — the loop scales itself.' },
  ];

  const products = [
    {
      tag: 'Product · B2B', icon: Bug, title: 'BSF larvae protein feed',
      text: 'Protein-rich Black Soldier Fly larvae, fresh or dried — a low-cost alternative to fishmeal for poultry and aquaculture farmers.',
      price: 'TZS 2,500–3,500', per: '/ kg dried', buyer: 'Poultry farms, fish farmers, feed millers',
    },
    {
      tag: 'Product · B2B / B2C', icon: Sprout, title: 'Frass organic fertilizer',
      text: 'Nutrient-rich frass and mature compost that improves soil health — a natural fit for urban farmers and horticulture businesses.',
      price: 'TZS 600–1,000', per: '/ kg bagged', buyer: 'Urban farmers, nurseries, agri-retailers',
    },
    {
      tag: 'Service · B2C', icon: Home, title: 'Household collection subscription',
      text: 'Clean, reliable, scheduled organic waste pickup with incentives for source separation. Our recurring-revenue backbone.',
      price: 'TZS 5,000–10,000', per: '/ household / month', buyer: 'Households in pilot wards',
    },
    {
      tag: 'Service · B2B', icon: Building2, title: 'Business & institutional contracts',
      text: 'Waste management and sustainability-compliance contracts for markets, hotels, restaurants and schools — priced by volume.',
      price: 'Custom', per: '/ volume-based', buyer: 'Markets, hotels, food businesses, schools',
    },
    {
      tag: 'Service · B2G', icon: Landmark, title: 'Municipal data & services',
      text: 'KijaniSense dashboards, collection analytics and ward-level waste mapping for municipalities pursuing cleaner, data-driven cities.',
      price: 'Contract', per: '/ annual license', buyer: 'Municipal councils, city authorities',
    },
    {
      tag: 'Future · Climate finance', icon: Globe, title: 'Carbon & climate credits',
      text: 'Methane avoided by diverting organic waste from dumps can be quantified and monetized through voluntary carbon markets as we scale.',
      price: 'Pipeline', per: '/ post-pilot', buyer: 'Carbon credit purchasers, climate funds',
    },
  ];

  const revenueStreams = [
    { icon: RefreshCw, title: 'Collection subscriptions', text: 'Recurring monthly revenue from households & businesses', share: '~35%' },
    { icon: Bug, title: 'Larvae feed sales', text: 'High-margin protein product with strong farm demand', share: '~30%' },
    { icon: Sprout, title: 'Fertilizer sales', text: 'Frass & compost sold bagged to growers and retailers', share: '~20%' },
    { icon: Landmark, title: 'Contracts & data services', text: 'Institutional waste contracts + municipal dashboards', share: '~15%' },
    { icon: Globe, title: 'Carbon credits', text: 'Future upside from verified methane avoidance', share: 'Pipeline' },
  ];

  const platformPoints = [
    { bold: 'Smart bins', text: 'report fill levels and trigger collection alerts, so routes are optimized and bins never overflow.' },
    { bold: 'Production monitoring', text: 'tracks temperature, humidity and yields across BSF, compost and biogas units for consistent product quality.' },
    { bold: 'Business dashboards', text: 'turn operations into investor-ready numbers: kilograms collected, products sold, CO₂ avoided.' },
    { bold: 'A sellable asset', text: '— the same dashboards become a licensed product for municipalities and partners.' },
  ];

  const partnerTargets = [
    { icon: Landmark, name: 'Municipal councils', text: 'Pilot wards, collection mandates and data-service contracts' },
    { icon: Globe, name: 'Development & climate funders', text: 'Grant and impact-investment capital to scale processing capacity' },
    { icon: Sprout, name: 'Agri-businesses & farmer groups', text: 'Offtake agreements for feed and fertilizer products' },
    { icon: Droplets, name: 'WASH & health organizations', text: 'Co-funding hygiene stations at markets and schools' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-gray-800">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-emerald-900 text-lg">
            <span className="w-8 h-8 rounded-lg bg-emerald-900 text-emerald-300 flex items-center justify-center">
              <Leaf size={16} />
            </span>
            Kijani Hub
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
            <a href="#market" className="hover:text-emerald-900">Opportunity</a>
            <a href="#how" className="hover:text-emerald-900">How it works</a>
            <a href="#products" className="hover:text-emerald-900">Products</a>
            <a href="#revenue" className="hover:text-emerald-900">Revenue</a>
            <a href="#platform" className="hover:text-emerald-900">KijaniSense</a>
            <a href="#impact" className="hover:text-emerald-900">Impact</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-emerald-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <span className="inline-flex items-center gap-2 font-mono text-xs border border-stone-200 bg-white rounded-full px-4 py-2 text-gray-500 mb-7">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Dar es Salaam, Tanzania · Pilot stage · Youth-led
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-emerald-950 leading-[1.02]">
            Waste in.<br />
            <span className="text-emerald-600">Value out.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mt-6">
            Kijani Hub is a circular economy company that collects organic waste and converts it into
            animal feed, organic fertilizer and clean energy — creating revenue, green jobs and
            healthier communities in the process.
          </p>
          <div className="flex flex-wrap gap-4 mt-9">
            <a href="#products" className="bg-amber-400 text-emerald-950 px-6 py-3.5 rounded-lg font-semibold hover:bg-amber-300 transition-colors">
              See our products & prices
            </a>
            <button
              onClick={() => navigate('/login')}
              className="border border-stone-300 text-emerald-950 px-6 py-3.5 rounded-lg font-semibold hover:border-emerald-700 transition-colors inline-flex items-center gap-2"
            >
              Explore the live dashboard <ArrowRight size={17} />
            </button>
          </div>

          {/* SIGNATURE: conversion ledger */}
          <div className="mt-16 bg-emerald-950 rounded-2xl p-7 md:p-9 shadow-2xl shadow-emerald-950/25">
            <div className="flex flex-wrap justify-between items-baseline gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-100/60">The Kijani conversion ledger</span>
              <span className="font-mono text-xs text-emerald-100/60">per 1,000 kg organic waste processed</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center mt-6">
              <div className="col-span-2 md:col-span-1">
                <div className="font-mono text-2xl md:text-3xl font-semibold text-white">1,000 kg</div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-emerald-100/60 mt-1">Organic waste in</div>
              </div>
              <div className="hidden md:block text-center font-mono text-2xl text-amber-400">&rarr;</div>
              <LedgerOutput target={180} label="kg BSF larvae feed" />
              <LedgerOutput target={250} label="kg frass fertilizer" />
              <LedgerOutput target={60} label="m³ biogas potential" />
              <LedgerOutput target={750} label="TZS revenue potential" money />
            </div>
            <p className="font-mono text-[11px] text-emerald-100/50 mt-6 pt-4 border-t border-dashed border-white/15">
              Illustrative pilot-stage estimates based on typical Black Soldier Fly conversion rates.
              Actual yields depend on waste composition and process conditions.
            </p>
          </div>
        </div>
      </header>

      {/* MARKET OPPORTUNITY */}
      <section id="market" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-14 items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-700 mb-3"><span className="text-amber-500">Fursa</span> / The opportunity</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 leading-tight">
              Dar es Salaam produces waste faster than anyone can bury it.
            </h2>
            <p className="text-gray-600 mt-5">
              Most of the city's waste is organic and biodegradable — yet the majority ends up in open
              dumps and drains, where it breeds disease vectors, releases methane and costs
              municipalities money. What the city treats as a liability, Kijani Hub treats as raw material.
            </p>
          </div>
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {marketStats.map((s) => (
                <div key={s.label} className="bg-white border border-stone-200 rounded-xl p-5">
                  <div className="font-mono text-xl font-semibold text-emerald-950">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-2">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="font-mono text-[11px] text-gray-400 mt-4">
              City-level figures are approximate estimates from published waste-management studies of Dar es Salaam; to be refined with pilot data.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-emerald-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-300 mb-3"><span className="text-amber-400">Mzunguko</span> / How it works</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">One loop. Five points where value is created.</h2>
          <p className="text-emerald-100/70 mt-4 max-w-2xl">
            Every step in the Kijani loop is either a paid service or a sellable product — monitored end-to-end by our KijaniSense IoT platform.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-12">
            {steps.map((s, i) => (
              <div key={s.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <s.icon className="text-emerald-300" size={20} />
                  <span className="font-mono text-xs text-amber-400">0{i + 1}</span>
                </div>
                <h3 className="text-white font-semibold mt-3">{s.title}</h3>
                <p className="text-sm text-emerald-100/60 mt-2">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS & PRICES */}
      <section id="products" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-700 mb-3"><span className="text-amber-500">Bidhaa</span> / Products & services</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">What we sell — and who buys it.</h2>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Indicative pilot pricing in Tanzanian Shillings. Final pricing will be validated with customers during the pilot.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-11">
            {products.map((p) => (
              <div key={p.title} className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 border border-stone-200 rounded-full px-3 py-1">{p.tag}</span>
                  <p.icon className="text-emerald-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-emerald-950 mt-4">{p.title}</h3>
                <p className="text-sm text-gray-500 mt-2 flex-1">{p.text}</p>
                <div className="mt-5 pt-4 border-t border-dashed border-stone-200">
                  <span className="font-mono font-semibold text-emerald-950">{p.price}</span>{' '}
                  <span className="font-mono text-xs text-gray-400">{p.per}</span>
                  <p className="text-xs text-gray-400 mt-1">Buyers: {p.buyer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVENUE MODEL */}
      <section id="revenue" className="py-20 bg-gradient-to-b from-amber-50 to-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-700 mb-3"><span className="text-amber-500">Mapato</span> / Business model</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Five revenue streams. One free raw material.</h2>
          <div className="grid lg:grid-cols-2 gap-12 mt-10 items-start">
            <div>
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                {revenueStreams.map((r, i) => (
                  <div key={r.title} className={`flex items-center gap-4 px-5 py-4 ${i < revenueStreams.length - 1 ? 'border-b border-stone-200' : ''}`}>
                    <span className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <r.icon className="text-emerald-700" size={18} />
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-950 text-sm">{r.title}</h3>
                      <p className="text-xs text-gray-500">{r.text}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-amber-700">{r.share}</span>
                  </div>
                ))}
              </div>
              <p className="font-mono text-[11px] text-gray-400 mt-4">Projected revenue mix at pilot maturity — to be validated against real sales data.</p>
            </div>
            <div className="bg-emerald-950 rounded-2xl p-7 text-emerald-100">
              <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-300">Unit economics · illustrative</p>
              <h3 className="text-white font-bold text-lg mt-1">One tonne of organic waste</h3>
              <table className="w-full text-sm mt-5">
                <tbody>
                  <tr className="border-b border-dashed border-white/15"><td className="py-2.5">Larvae feed (~180 kg × TZS 3,000)</td><td className="text-right font-mono">+540K</td></tr>
                  <tr className="border-b border-dashed border-white/15"><td className="py-2.5">Frass fertilizer (~250 kg × TZS 800)</td><td className="text-right font-mono">+200K</td></tr>
                  <tr className="border-b border-dashed border-white/15"><td className="py-2.5">Collection fees attributable</td><td className="text-right font-mono">+150K</td></tr>
                  <tr className="border-b border-dashed border-white/15"><td className="py-2.5">Collection & processing costs</td><td className="text-right font-mono">−390K</td></tr>
                  <tr className="border-b border-dashed border-white/15"><td className="py-2.5">Labour (youth operators)</td><td className="text-right font-mono">−250K</td></tr>
                  <tr><td className="pt-4 font-mono font-semibold text-amber-400">Estimated gross margin / tonne</td><td className="pt-4 text-right font-mono font-semibold text-amber-400">≈ +250K TZS</td></tr>
                </tbody>
              </table>
              <p className="font-mono text-[10px] text-emerald-100/50 mt-4">
                Illustrative model, not audited figures. The pilot exists to prove these numbers with real operations data — tracked live in KijaniSense.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM */}
      <section id="platform" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-700 mb-3"><span className="text-amber-500">Teknolojia</span> / The platform</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">KijaniSense: the IoT brain of the business.</h2>
            <p className="text-gray-600 mt-4">
              Our in-house platform monitors every bin, BSF unit, compost site, digester and WASH station
              in real time — so operations run on data, not guesswork.
            </p>
            <div className="mt-7 space-y-4">
              {platformPoints.map((pt) => (
                <div key={pt.bold} className="flex gap-3 text-sm">
                  <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={17} />
                  <span><strong className="text-emerald-950">{pt.bold}</strong> {pt.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-8 bg-emerald-900 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-emerald-800 transition-colors inline-flex items-center gap-2"
            >
              Open the live demo <ArrowRight size={17} />
            </button>
          </div>
          <div className="bg-emerald-950 rounded-2xl p-5 shadow-2xl shadow-emerald-950/25">
            <div className="flex gap-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-white/25" /><span className="w-2 h-2 rounded-full bg-white/25" /><span className="w-2 h-2 rounded-full bg-white/25" />
            </div>
            {[
              { name: 'Kariakoo Market Bin', sub: 'Kariakoo, Dar es Salaam', val: '92% · collect today', cls: 'text-red-300' },
              { name: 'Ilala District Bin', sub: 'Ilala, Dar es Salaam', val: '100% · overdue', cls: 'text-red-300' },
              { name: 'Kinondoni Hub Bin', sub: 'Kinondoni, Dar es Salaam', val: '61% · 2 days', cls: 'text-amber-400' },
              { name: 'BSF Unit 1', sub: 'Temp 33.5°C · Humidity 64%', val: 'Optimal', cls: 'text-emerald-300' },
              { name: 'Biogas Digester 1', sub: '3.9 m³ today · 13.4 kWh', val: '79% capacity', cls: 'text-emerald-300' },
            ].map((row) => (
              <div key={row.name} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3 mb-2.5">
                <div>
                  <p className="text-sm text-emerald-50">{row.name}</p>
                  <p className="font-mono text-[10px] text-emerald-100/50">{row.sub}</p>
                </div>
                <span className={`font-mono text-xs font-semibold ${row.cls}`}>{row.val}</span>
              </div>
            ))}
            <p className="font-mono text-[10px] text-emerald-100/50 mt-3">KijaniSense · live demo with simulated pilot data</p>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="py-20 bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-700 mb-3"><span className="text-amber-500">Athari</span> / Why the business creates impact</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Profit and public health, from the same loop.</h2>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Kijani Hub was founded by a pharmacy and public health student — because unmanaged waste is a
            disease problem before it is an aesthetic one. Every tonne we process is prevention in action.
          </p>
          <div className="grid md:grid-cols-2 gap-5 mt-10">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-7">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="text-emerald-700" size={19} />
                <h3 className="font-bold text-emerald-950">Health & environment</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li>— Fewer breeding sites for flies and mosquitoes in served communities</li>
                <li>— Reduced open dumping, odor and water-source contamination</li>
                <li>— Methane avoided by diverting organics from dumpsites</li>
                <li>— WASH stations promoting handwashing where waste is handled</li>
              </ul>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-7">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="text-emerald-700" size={19} />
                <h3 className="font-bold text-emerald-950">Jobs & economy</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li>— Green jobs for youth as collectors, operators and franchisees</li>
                <li>— Affordable feed and fertilizer inputs for local farmers</li>
                <li>— Lower waste-management costs for municipalities</li>
                <li>— Skills in IoT, circular economy and agribusiness</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-20 bg-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-300 mb-8"><span className="text-amber-400">Mwanzilishi</span> / Founder's note</p>
          <div className="grid md:grid-cols-[280px_1fr] gap-10 items-center">
            <div className="max-w-[280px] mx-auto md:mx-0">
              <img
                src={FOUNDER_PHOTO}
                alt="Timoth Jeremiah Mbaga, founder of Kijani Hub"
                className="w-full rounded-2xl border-2 border-amber-400/40 shadow-2xl shadow-black/30"
              />
            </div>
            <div>
              <blockquote className="text-xl md:text-2xl font-semibold text-white leading-relaxed max-w-3xl">
                "I'm training as a pharmacist, and I've learned that disease prevention doesn't start in the
                hospital — it starts in the street, the market and the drain. Kijani Hub is my answer: a
                business where <span className="text-amber-400">every shilling of revenue is also a unit of prevention.</span>"
              </blockquote>
              <p className="text-white font-bold mt-7">Timoth Jeremiah Mbaga</p>
              <p className="font-mono text-xs text-emerald-100/60 mt-1">
                Founder — Bachelor of Pharmacy student, MUHAS · youth leader in public health, AMR advocacy & digital health
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <a href="mailto:mbagatimothy@gmail.com" className="inline-flex items-center gap-2 border border-white/20 text-emerald-50 px-4 py-2 rounded-lg text-sm hover:border-amber-400/60 transition-colors">
                  <Mail size={15} /> mbagatimothy@gmail.com
                </a>
                <a href="tel:+255784598953" className="inline-flex items-center gap-2 border border-white/20 text-emerald-50 px-4 py-2 rounded-lg text-sm hover:border-amber-400/60 transition-colors">
                  <Phone size={15} /> +255 784 598 953
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERSHIP OPPORTUNITIES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-700 mb-3"><span className="text-amber-500">Ushirikiano</span> / Partnership opportunities</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Who we want to build with.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {partnerTargets.map((p) => (
              <div key={p.name} className="bg-white border border-stone-200 rounded-2xl p-6">
                <p.icon className="text-emerald-700" size={22} />
                <h3 className="font-bold text-emerald-950 mt-4">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-2">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 text-center bg-gradient-to-b from-stone-50 to-amber-50">
        <div className="max-w-3xl mx-auto px-4">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-700 mb-3"><span className="text-amber-500">Karibu</span> / Get involved</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Buy from us. Invest in us. Pilot with us.</h2>
          <p className="text-gray-600 mt-4">
            Whether you're a farmer who needs affordable feed, a funder backing circular economy
            ventures, or a municipality that wants cleaner wards — let's talk.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <a href="mailto:kijanihubtz@gmail.com" className="bg-emerald-900 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-emerald-800 transition-colors inline-flex items-center gap-2">
              <Mail size={17} /> kijanihubtz@gmail.com
            </a>
            <a href="tel:+255784598953" className="border border-stone-300 text-emerald-950 px-6 py-3.5 rounded-lg font-semibold hover:border-emerald-700 transition-colors inline-flex items-center gap-2">
              <Phone size={17} /> +255 784 598 953
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between gap-4 text-sm text-gray-500">
          <div>
            <strong className="text-emerald-950">Kijani Hub</strong> — turning waste into wealth in Dar es Salaam, Tanzania.
            <br /><span className="font-mono text-xs">Powered by the KijaniSense IoT platform.</span>
          </div>
          <span className="font-mono text-xs">© 2026 Kijani Hub. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
