import { Link } from 'react-router-dom';
import { Zap, Satellite, BarChart3, Code2, Shield, DollarSign, ArrowRight, CheckCircle2, Menu, X, Droplets, Home, Columns3, Fence, TreePine, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

const features = [
  {
    icon: Satellite,
    title: 'Satellite Measurements',
    description: 'Automatically detect building footprints and measure perimeters using Mapbox satellite imagery and Turf.js.',
  },
  {
    icon: Zap,
    title: 'Instant Quotes',
    description: 'Generate accurate estimates in seconds. Website visitors get pricing without waiting for a site visit.',
  },
  {
    icon: Code2,
    title: 'Easy Embed',
    description: 'Drop a single line of code into any website. Your quoter matches your brand with full style customization.',
  },
  {
    icon: BarChart3,
    title: 'Built-in Analytics',
    description: 'Track views, clicks, and completed quotes. Know exactly how your quoter is performing in real time.',
  },
  {
    icon: Shield,
    title: 'Lead Management',
    description: 'Every quote becomes a lead in your built-in CRM. Track status from new contact to closed deal.',
  },
  {
    icon: DollarSign,
    title: 'Maximize Revenue',
    description: 'Close more jobs with instant pricing. Homeowners get answers immediately instead of waiting days.',
  },
];

const industries = [
  {
    icon: Droplets,
    name: 'Gutters',
    description: 'Auto-detect roof perimeters for precise gutter length estimates. The original GutterQuote AI -- our most popular tool.',
    highlight: true,
  },
  {
    icon: Home,
    name: 'Roofing',
    description: 'Auto-detect building footprints for accurate roof perimeter and edge measurements.',
    highlight: false,
  },
  {
    icon: Columns3,
    name: 'Decks',
    description: 'Let homeowners draw deck outlines on satellite imagery for instant decking quotes.',
    highlight: false,
  },
  {
    icon: Fence,
    name: 'Fencing',
    description: 'Property owners trace their fence line on the map and get an instant price per linear foot.',
    highlight: false,
  },
  {
    icon: TreePine,
    name: 'Landscaping',
    description: 'Customers outline work areas on satellite views for accurate landscape service quotes.',
    highlight: false,
  },
];

const steps = [
  { step: '01', title: 'Pick Your Industry', description: 'Choose from gutters, roofing, decks, fencing, or landscaping. Each comes with industry-specific materials and pricing defaults.' },
  { step: '02', title: 'Customize & Embed', description: 'Set your pricing, branding, and materials. Copy a single embed code and paste it into your website.' },
  { step: '03', title: 'Collect Leads', description: 'Homeowners enter their address, get an instant quote, and you get a qualified lead with all the details.' },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSending, setTicketSending] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSending(true);
    await supabase.from('support_tickets').insert({
      name: ticketName,
      email: ticketEmail,
      message: ticketMessage,
    });
    setTicketSending(false);
    setTicketSent(true);
    setTimeout(() => {
      setTicketOpen(false);
      setTicketSent(false);
      setTicketName('');
      setTicketEmail('');
      setTicketMessage('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/image.png" alt="SureQuote AI" className="h-9 w-auto" />
              <span className="text-lg font-bold tracking-tight">SureQuote<span className="text-brand-500">AI</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#industries" className="text-sm text-gray-400 hover:text-white transition-colors">Industries</a>
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-brand-600/25">
                Get Started
              </Link>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-gray-900 border-t border-white/5 px-4 py-4 space-y-3">
            <a href="#industries" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-400 hover:text-white">Industries</a>
            <a href="#features" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-400 hover:text-white">Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-400 hover:text-white">How It Works</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-400 hover:text-white">Pricing</a>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-400 hover:text-white">Sign In</Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} className="block bg-brand-600 text-center text-white text-sm font-semibold px-5 py-2.5 rounded-lg">Get Started</Link>
          </div>
        )}
      </nav>

      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(22,163,74,0.15)_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-brand-500/20 mb-6">
              <Zap size={14} /> The Future of Home Service Estimating
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] animate-fade-in-delay-1">
            Instant Quotes for<br />
            <span className="text-brand-500">Any Home Service</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay-2">
            Give homeowners instant, accurate estimates with satellite-powered measurements.
            Embed a branded quoting tool on your site for gutters, roofing, decks, fencing, or landscaping.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-3">
            <Link
              to="/register"
              className="group flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:shadow-xl hover:shadow-brand-600/25"
            >
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#industries" className="flex items-center gap-2 text-gray-400 hover:text-white font-medium px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              Explore Industries
            </a>
          </div>
          <div className="mt-16 relative max-w-4xl mx-auto animate-fade-in-delay-3">
            <div className="absolute -inset-4 bg-gradient-to-b from-brand-500/20 to-transparent rounded-2xl blur-2xl" />
            <div className="relative bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-gray-500">surequote.ai/dashboard</span>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[{ label: 'Total Leads', value: '1,247', change: '+12%' }, { label: 'Quotes Generated', value: '3,891', change: '+23%' }, { label: 'Conversion Rate', value: '32%', change: '+5%' }].map((stat) => (
                    <div key={stat.label} className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-brand-400 mt-1">{stat.change} this month</p>
                    </div>
                  ))}
                </div>
                <div className="h-32 bg-gray-800/30 rounded-xl border border-white/5 flex items-end p-4 gap-1">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 bg-brand-500/60 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="industries" className="py-20 sm:py-28 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">One Platform, <span className="text-brand-500">Five Industries</span></h2>
            <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">Create instant quoting tools tailored to your trade. Each industry gets its own materials, pricing, and measurement approach.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind) => (
              <div
                key={ind.name}
                className={`group relative bg-gray-900/50 border rounded-2xl p-6 transition-all duration-300 ${
                  ind.highlight
                    ? 'border-brand-500/40 hover:border-brand-500/60 ring-1 ring-brand-500/10'
                    : 'border-white/5 hover:border-brand-500/30 hover:bg-gray-900'
                }`}
              >
                {ind.highlight && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                  </div>
                )}
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <ind.icon className="text-brand-500" size={22} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{ind.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{ind.description}</p>
              </div>
            ))}
            <div className="flex items-center justify-center bg-gray-900/30 border border-dashed border-white/10 rounded-2xl p-6 text-center">
              <div>
                <p className="text-gray-500 text-sm mb-3">More industries coming soon</p>
                <Link to="/register" className="text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors">
                  Request an industry
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything You Need to <span className="text-brand-500">Close More Jobs</span></h2>
            <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">Purpose-built for home service contractors who want to win more business online.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-brand-500/30 hover:bg-gray-900 transition-all duration-300">
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <feature.icon className="text-brand-500" size={22} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-28 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Up and Running in <span className="text-brand-500">Minutes</span></h2>
            <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">Three simple steps to start generating leads from your website.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="relative">
                <span className="text-6xl font-black text-brand-500/10 absolute -top-4 -left-2">{step.step}</span>
                <div className="relative pt-8 pl-4">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple, Transparent <span className="text-brand-500">Pricing</span></h2>
            <p className="mt-4 text-gray-400 text-lg">One plan. Every industry. Everything included.</p>
          </div>
          <div className="max-w-lg mx-auto">
            <div className="relative bg-gray-900 border border-brand-500/30 rounded-2xl p-8 sm:p-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">All Industries</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold">$99</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'All 5 industries included',
                  'Unlimited quoters',
                  'Satellite-powered measurements',
                  'Auto-detect for gutters & roofing',
                  'Full brand customization',
                  'Embeddable on any website',
                  'Built-in lead CRM',
                  'Real-time analytics dashboard',
                  'Unlimited leads',
                  'Priority support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-brand-500 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3.5 rounded-xl text-center transition-all hover:shadow-lg hover:shadow-brand-600/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Ready to Win More <span className="text-brand-500">Jobs</span>?</h2>
          <p className="text-gray-400 text-lg mb-8">Join contractors across the country who are closing more deals with instant online quotes.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:shadow-xl hover:shadow-brand-600/25"
          >
            Get Started Today <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/image.png" alt="SureQuote AI" className="h-7 w-auto" />
              <span className="text-sm font-bold">SureQuote<span className="text-brand-500">AI</span></span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <a href="mailto:support@gutterquote.ai" className="hover:text-white transition-colors">support@gutterquote.ai</a>
            </div>
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} SureQuote AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <button
        onClick={() => setTicketOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-brand-600 hover:bg-brand-500 text-white w-14 h-14 rounded-full shadow-xl shadow-brand-600/30 flex items-center justify-center transition-all hover:scale-105"
        aria-label="Contact Support"
      >
        <MessageCircle size={24} />
      </button>

      {ticketOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTicketOpen(false)} />
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-semibold">Contact Support</h3>
              <button onClick={() => setTicketOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            {ticketSent ? (
              <div className="px-6 py-12 text-center">
                <CheckCircle2 size={48} className="text-brand-500 mx-auto mb-4" />
                <p className="text-lg font-semibold">Message Sent</p>
                <p className="text-sm text-gray-400 mt-1">We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={ticketSending}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  {ticketSending ? 'Sending...' : (
                    <>Send Message <Send size={16} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
