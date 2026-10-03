import React from 'react';
import { ShieldCheck, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Anti-broker transparent promise strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-900/40 text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Strictly Zero Brokerage</h4>
              <p className="text-xs text-slate-400 mt-1">
                Save 1 to 2 months of hard-earned rent. 100% of listings on StayLink are posted directly by verified property owners.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Verified Ownership</h4>
              <p className="text-xs text-slate-400 mt-1">
                Owners verify electricity meters and municipal tax IDs to prevent sublet scams and unauthorized brokers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-900/40 text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Transparent Pricing</h4>
              <p className="text-xs text-slate-400 mt-1">
                Monthly rent, refundable security deposits, and maintenance charges are itemized upfront. No surprise fees.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Directory */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Brand Col */}
          <div className="col-span-2">
            <button
              onClick={() => onNavigate('home')}
              className="text-left font-extrabold text-2xl tracking-tight text-white focus:outline-none"
            >
              Stay<span className="text-blue-500">Link</span>
            </button>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed max-w-sm">
              StayLink is India's dedicated direct-owner rental housing marketplace. Built for working professionals, students, and relocating families seeking genuine homes in top tech hubs and metro cities.
            </p>
            <div className="mt-6 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Indiranagar & HSR Layout, Bengaluru, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>support@staylink.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>+91 80 4000 1234 (Mon - Sat, 9 AM - 7 PM IST)</span>
              </div>
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Top Rental Cities</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Rent in Bengaluru</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Rent in Mumbai</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Rent in Delhi-NCR / Gurgaon</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Rent in Pune</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Rent in Hyderabad</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Rent in Chennai</button></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Platform</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">All Properties</button></li>
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About StayLink</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact Support</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">Help Centre & FAQs</button></li>
            </ul>
          </div>

          {/* Policies & Trust */}
          <div>
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Trust & Guidelines</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('guidelines')} className="hover:text-white transition-colors">Zero-Brokerage Code</button></li>
              <li><button onClick={() => onNavigate('guidelines')} className="hover:text-white transition-colors">Listing Guidelines</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">Tenant Safety Advisory</button></li>
            </ul>
          </div>
        </div>

        {/* Copyright notice & India rent advisory */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 StayLink Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="text-center md:text-right text-[11px] text-slate-500">
            Advisory: Always physically inspect the property and verify property tax/electricity records before transferring token advance.
          </p>
        </div>
      </div>
    </footer>
  );
};
