import React from 'react';
import { User } from '../types';
import { Building2, Plus, UserCheck, Shield, Heart, Calendar, MessageSquare, LogOut, ArrowRightLeft } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  currentUser: User | null;
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  onLogout: () => void;
  onSwitchDemoUser: (role: 'renter' | 'owner' | 'admin') => void;
  comparisonCount: number;
  favouritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  onSwitchDemoUser,
  comparisonCount,
  favouritesCount
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Bar Contract: Exactly 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left group flex items-baseline gap-1.5 focus:outline-none"
        >
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Stay<span className="text-blue-600">Link</span>
          </span>
          <span className="hidden sm:inline text-xs font-semibold text-emerald-600 tracking-wider">
            DIRECT
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('search')}
            className={`transition-colors hover:text-slate-900 ${
              currentView === 'search' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Explore Rentals
          </button>
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth('register');
              } else if (currentUser.role === 'owner') {
                onNavigate('owner-dashboard');
              } else {
                onNavigate('owner-dashboard');
              }
            }}
            className={`transition-colors hover:text-slate-900 ${
              currentView === 'owner-dashboard' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Post Free Listing
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className={`transition-colors hover:text-slate-900 ${
              currentView === 'how-it-works' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors hover:text-slate-900 ${
              currentView === 'about' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Zero Brokerage Proof
          </button>
          <button
            onClick={() => onNavigate('guidelines')}
            className={`transition-colors hover:text-slate-900 ${
              currentView === 'guidelines' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Listing Rules
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Compare shortcut if items selected */}
          {comparisonCount > 0 && (
            <button
              onClick={() => onNavigate('search')}
              title="Compare selected properties"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Compare ({comparisonCount})</span>
            </button>
          )}

          {/* Favourites shortcut */}
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth('login');
              else onNavigate('renter-dashboard');
            }}
            title="Saved Favourites"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            aria-label="Favourites"
          >
            <Heart className="w-4 h-4" />
            {favouritesCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {/* Quick Demo Persona Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => onSwitchDemoUser('renter')}
              className={`px-2 py-1 rounded transition-colors ${
                currentUser?.role === 'renter' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Renter Demo
            </button>
            <button
              onClick={() => onSwitchDemoUser('owner')}
              className={`px-2 py-1 rounded transition-colors ${
                currentUser?.role === 'owner' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Owner Demo
            </button>
            <button
              onClick={() => onSwitchDemoUser('admin')}
              className={`px-2 py-1 rounded transition-colors ${
                currentUser?.role === 'admin' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-500 capitalize">({currentUser.role})</span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-xs"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-slate-500 truncate">{currentUser.email}</p>
                    <p className="text-[10px] text-emerald-600 font-medium mt-0.5 capitalize">
                      ● Verified {currentUser.role}
                    </p>
                  </div>

                  {currentUser.role === 'renter' && (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('renter-dashboard');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Renter Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('renter-dashboard');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Visit Requests</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('renter-dashboard');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>My Enquiries</span>
                      </button>
                    </>
                  )}

                  {currentUser.role === 'owner' && (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('owner-dashboard');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Owner Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('owner-dashboard');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-600" />
                        <span>Add New Property</span>
                      </button>
                    </>
                  )}

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin-dashboard');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>Moderation Console</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                Post Property Free
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
