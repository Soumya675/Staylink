import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, MapPin, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

interface StaticPagesProps {
  page: 'about' | 'how-it-works' | 'contact' | 'faq' | 'terms' | 'privacy' | 'guidelines';
  onNavigate: (view: string) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onNavigate }) => {
  const [contactSent, setContactSent] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');

  const faqs = [
    {
      q: 'How does StayLink guarantee 100% zero brokerage?',
      a: 'StayLink only permits authenticated property owners, family representatives, or institutional landlords to post listings. We run an automated middleman detection filter and physically verify electricity consumer IDs. If a poster is found charging brokerage or acting as an unregistered broker, they are permanently banned.'
    },
    {
      q: 'How do visit appointments work?',
      a: 'Renters can schedule a morning, afternoon, or evening visit slot directly through the property detail page. The homeowner reviews and confirms the request with society gate and parking instructions. No charges or appointment tokens are required.'
    },
    {
      q: 'What should I do before transferring token advance?',
      a: 'Never transfer token money, security deposit, or key charges before in-person inspection of the premises and verification of the owner’s utility bill or property tax receipt. StayLink does not hold or process rental cash advances.'
    },
    {
      q: 'Can landlords post single rooms or PGs?',
      a: 'Yes, StayLink supports PGs, co-living rooms, 1 RKs, standard flats (1/2/3/4 BHK), and independent bungalows across Indian cities.'
    },
    {
      q: 'Which Indian cities are supported?',
      a: 'StayLink is operational across Bengaluru, Mumbai, Delhi-NCR (Gurgaon/Noida), Pune, Hyderabad, Chennai, Kolkata, and Ahmedabad.'
    }
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page: ABOUT STAYLINK */}
      {page === 'about' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">About StayLink</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              India's Dedicated Direct Homeowner Rental Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Eliminating predatory middleman commissions and bringing transparency to urban housing.
            </p>
          </div>

          <div className="prose text-xs text-slate-700 leading-relaxed space-y-4">
            <p>
              In major Indian metro cities such as Bengaluru, Mumbai, Gurgaon, Pune, and Hyderabad, finding a rental home has historically meant dealing with aggressive broker networks who demand between 15 days to 2 full months of rent as non-refundable brokerage fees.
            </p>
            <p>
              Tenants frequently encounter duplicate photographs, bait-and-switch listings, unannounced maintenance charges, and surprise move-in conditions. Property owners, on the other hand, face unvetted tenants and relentless nuisance calls from unlicensed brokers copying their listings without consent.
            </p>
            <p>
              <strong>StayLink</strong> was engineered to solve this imbalance by creating an open, digital infrastructure where genuine homeowners connect directly with working professionals, university students, and families relocating for career opportunities.
            </p>

            <h3 className="text-sm font-bold text-slate-900 pt-2">Our Core Principles</h3>
            <ul className="space-y-2 pl-4 list-disc text-slate-700">
              <li><strong>Zero Brokerage Commitment</strong>: Free access to direct owner contact info and visit scheduling.</li>
              <li><strong>Transparent Financial Disclosure</strong>: Itemized breakdown of monthly rent, security deposit, maintenance, and electricity tariff policies.</li>
              <li><strong>Model Tenancy Act Alignment</strong>: Providing fair, balanced lease agreement templates under Indian state tenancy guidelines.</li>
              <li><strong>Zero Tolerance for Impersonation</strong>: Instant blacklisting of disguised brokers or scam profiles.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Page: HOW IT WORKS */}
      {page === 'how-it-works' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">User Guide</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How StayLink Works for Renters & Owners
            </h1>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">For Renters & Tenants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900">1. Discover</span>
                  <p className="text-slate-600">Filter by city, locality, monthly rent, and furnishing without seeing broker spam.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900">2. Connect & Visit</span>
                  <p className="text-slate-600">Chat with the homeowner directly and schedule a free in-person visit slot.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900">3. Move in & Save</span>
                  <p className="text-slate-600">Finalize terms directly with the owner, saving up to ₹50,000+ in broker fees.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider">For Property Owners</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900">1. List in 4 Mins</span>
                  <p className="text-slate-600">Post photos, rent terms, and society rules for free through our simple multi-step wizard.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900">2. Verify Ownership</span>
                  <p className="text-slate-600">Authenticate electricity account or municipal tax record to receive the Verified Owner badge.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900">3. Direct Tenants</span>
                  <p className="text-slate-600">Meet vetted IT professionals and families without receiving calls from middleman agents.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page: CONTACT US */}
      {page === 'contact' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Get In Touch</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Contact StayLink Support
            </h1>
            <p className="text-xs text-slate-500">
              Our Bangalore team is available Monday through Saturday from 9:00 AM to 7:00 PM IST.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Headquarters</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  StayLink Technologies Pvt. Ltd.<br />
                  4th Floor, Tech Hub Tower, 100 Feet Road, Indiranagar,<br />
                  Bengaluru, Karnataka 560038, India
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email Inquiries</span>
                </div>
                <p className="text-slate-600">
                  General: support@staylink.in<br />
                  Trust & Safety: trust@staylink.in
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Helpline</span>
                </div>
                <p className="text-slate-600">+91 80 4000 1234 (India toll-free)</p>
              </div>
            </div>

            {/* Contact Form */}
            {contactSent ? (
              <div className="p-8 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Message Dispatched</h4>
                <p className="text-xs text-slate-600">Our customer success representative will respond within 4 business hours.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setContactSent(true); }} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <input type="text" required placeholder="e.g. Ananya Das" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Email</label>
                  <input type="email" required placeholder="ananya@example.in" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input type="text" required placeholder="e.g. Inquiry regarding owner verification" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message Details</label>
                  <textarea rows={4} required placeholder="How can our Bangalore team help you?" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs resize-none" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 flex items-center justify-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Page: FAQ */}
      {page === 'faq' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Help Centre</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h1>
            <input
              type="text"
              value={faqSearch}
              onChange={e => setFaqSearch(e.target.value)}
              placeholder="Search answers on deposits, visits, or verification..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg mt-3"
            />
          </div>

          <div className="divide-y divide-slate-100 space-y-4">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="pt-4 first:pt-0 space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page: LISTING GUIDELINES */}
      {page === 'guidelines' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Trust & Integrity</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              StayLink Listing Guidelines & Anti-Broker Fair Housing Policy
            </h1>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
              <h4 className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Strict Prohibition on Disguised Brokers</span>
              </h4>
              <p>
                StayLink is strictly a <strong>direct-from-owner</strong> platform. Any user who registers under false pretenses to solicit brokerage, commissions, or consulting charges from tenants will have their account immediately suspended and their phone number flagged across our network.
              </p>
            </div>

            <h3 className="text-sm font-bold text-slate-900 pt-2">Rules for Property Owners</h3>
            <ul className="space-y-2 pl-4 list-disc">
              <li><strong>Authentic Photographs Only</strong>: Upload genuine, recent photos taken inside your property. Stock photos or architectural 3D renders are prohibited.</li>
              <li><strong>Accurate Financial Breakdown</strong>: All fees including monthly rent, refundable deposit, maintenance, and electricity tariff must be stated honestly in the listing description.</li>
              <li><strong>Prompt Status Updates</strong>: Once your property is rented out, you must mark the listing as 'Unavailable' to avoid unnecessary inquiries from tenants.</li>
              <li><strong>No Discrimination</strong>: Housing must be offered fairly without arbitrary refusal based on religion, dietary choices, or state of origin.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Page: TERMS & PRIVACY */}
      {(page === 'terms' || page === 'privacy') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4 text-xs text-slate-700 leading-relaxed">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {page === 'terms' ? 'Terms and Conditions of Use' : 'StayLink Privacy Policy'}
          </h1>
          <p className="text-[11px] text-slate-500">Effective Date: October 2026 · Governing Jurisdiction: Bengaluru, India</p>

          <p>
            By accessing or listing properties on StayLink, you agree to comply with Indian cyber laws, the Information Technology Act 2000, and applicable municipal tenancy regulations.
          </p>
          <p>
            StayLink provides a matchmaking directory for direct property transactions. StayLink is not a party to lease agreements and does not collect or hold rental funds or security deposits. Users are advised to inspect properties in person before executing agreements.
          </p>
        </div>
      )}
    </div>
  );
};
