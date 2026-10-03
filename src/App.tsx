import React, { useState, useEffect } from 'react';
import { User, Property, SearchFilters } from './types';
import { api } from './services/api';
import { SEED_PROPERTIES, SEED_USERS } from './data/seedData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CompareModal } from './components/CompareModal';
import { ScheduleVisitModal } from './components/ScheduleVisitModal';
import { ReportModal } from './components/ReportModal';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { RenterDashboard } from './pages/RenterDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaticPages } from './pages/StaticPages';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>('prop_blr_1');
  const [properties, setProperties] = useState<Property[]>(SEED_PROPERTIES);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('staylink_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_USERS[0]; // Rahul Sharma (Renter)
      }
    }
    return SEED_USERS[0]; // Default to verified renter demo for instant interactive experience
  });

  const [favourites, setFavourites] = useState<string[]>(['prop_blr_1', 'prop_del_1']);
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [scheduleVisitOpen, setScheduleVisitOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    fetchProperties();
    if (currentUser) {
      fetchFavourites(currentUser.id);
    }
  }, [currentUser?.id]);

  const fetchProperties = async () => {
    try {
      const res = await api.getProperties();
      setProperties(res.properties);
    } catch {
      // fallback to seed
      setProperties(SEED_PROPERTIES);
    }
  };

  const fetchFavourites = async (userId: string) => {
    try {
      const res = await api.getFavourites(userId);
      setFavourites(res.propertyIds);
    } catch {
      setFavourites(['prop_blr_1', 'prop_del_1']);
    }
  };

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) {
      setSelectedPropertyId(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    setCurrentView('property-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavourite = async (propertyId: string) => {
    if (!currentUser) {
      setAuthDefaultTab('login');
      setAuthModalOpen(true);
      return;
    }

    if (favourites.includes(propertyId)) {
      setFavourites(favourites.filter(id => id !== propertyId));
      try {
        await api.removeFavourite(propertyId, currentUser.id);
      } catch (err) {
        console.error(err);
      }
    } else {
      setFavourites([...favourites, propertyId]);
      try {
        await api.addFavourite(propertyId, currentUser.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleCompare = (property: Property) => {
    if (comparedProperties.some(c => c.id === property.id)) {
      setComparedProperties(comparedProperties.filter(c => c.id !== property.id));
    } else {
      if (comparedProperties.length >= 3) {
        alert('You can compare up to 3 properties at a time. Please remove one first.');
        return;
      }
      setComparedProperties([...comparedProperties, property]);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setCurrentView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchDemoUser = async (role: 'renter' | 'owner' | 'admin') => {
    const demoUser =
      role === 'renter'
        ? SEED_USERS[0]
        : role === 'owner'
        ? SEED_USERS[1]
        : SEED_USERS[4];

    setCurrentUser(demoUser);
    localStorage.setItem('staylink_user', JSON.stringify(demoUser));

    // Redirect to corresponding dashboard if on dashboard
    if (role === 'owner') setCurrentView('owner-dashboard');
    else if (role === 'admin') setCurrentView('admin-dashboard');
    else if (role === 'renter') setCurrentView('renter-dashboard');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('staylink_user', JSON.stringify(user));
    if (user.role === 'owner') {
      setCurrentView('owner-dashboard');
    } else if (user.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('renter-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('staylink_user');
    setCurrentView('home');
  };

  const selectedProperty =
    properties.find(p => p.id === selectedPropertyId) || properties[0] || SEED_PROPERTIES[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={(tab = 'login') => {
          setAuthDefaultTab(tab);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onSwitchDemoUser={handleSwitchDemoUser}
        comparisonCount={comparedProperties.length}
        favouritesCount={favourites.length}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'home' && (
          <HomePage
            properties={properties}
            favourites={favourites}
            comparedProperties={comparedProperties}
            onToggleFavourite={handleToggleFavourite}
            onToggleCompare={handleToggleCompare}
            onSelectProperty={handleSelectProperty}
            onSearch={handleSearch}
            onNavigate={handleNavigate}
            onOpenAuth={(tab = 'login') => {
              setAuthDefaultTab(tab);
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentView === 'search' && (
          <SearchPage
            properties={properties}
            favourites={favourites}
            comparedProperties={comparedProperties}
            onToggleFavourite={handleToggleFavourite}
            onToggleCompare={handleToggleCompare}
            onSelectProperty={handleSelectProperty}
            initialFilters={searchFilters}
            onOpenCompareModal={() => setCompareModalOpen(true)}
          />
        )}

        {currentView === 'property-detail' && (
          <PropertyDetailPage
            property={selectedProperty}
            allProperties={properties}
            currentUser={currentUser}
            isFavourite={favourites.includes(selectedProperty.id)}
            isCompared={comparedProperties.some(c => c.id === selectedProperty.id)}
            onToggleFavourite={handleToggleFavourite}
            onToggleCompare={handleToggleCompare}
            onSelectProperty={handleSelectProperty}
            onBack={() => setCurrentView('search')}
            onOpenScheduleVisit={() => setScheduleVisitOpen(true)}
            onOpenReport={() => setReportModalOpen(true)}
            onOpenAuth={(tab = 'login') => {
              setAuthDefaultTab(tab);
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentView === 'renter-dashboard' && currentUser && (
          <RenterDashboard
            currentUser={currentUser}
            allProperties={properties}
            favourites={favourites}
            comparedProperties={comparedProperties}
            onToggleFavourite={handleToggleFavourite}
            onToggleCompare={handleToggleCompare}
            onSelectProperty={handleSelectProperty}
            onOpenCompareModal={() => setCompareModalOpen(true)}
          />
        )}

        {currentView === 'owner-dashboard' && currentUser && (
          <OwnerDashboard
            currentUser={currentUser}
            onSelectProperty={handleSelectProperty}
            onRefreshProperties={fetchProperties}
          />
        )}

        {currentView === 'admin-dashboard' && currentUser && (
          <AdminDashboard
            currentUser={currentUser}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {[
          'about',
          'how-it-works',
          'contact',
          'faq',
          'terms',
          'privacy',
          'guidelines'
        ].includes(currentView) && (
          <StaticPages
            page={currentView as any}
            onNavigate={handleNavigate}
          />
        )}
      </div>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab={authDefaultTab}
      />

      <CompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        properties={comparedProperties}
        onRemove={id => setComparedProperties(comparedProperties.filter(c => c.id !== id))}
        onSelectProperty={handleSelectProperty}
      />

      {selectedProperty && (
        <>
          <ScheduleVisitModal
            isOpen={scheduleVisitOpen}
            onClose={() => setScheduleVisitOpen(false)}
            property={selectedProperty}
            currentUser={currentUser}
            onOpenAuth={() => {
              setScheduleVisitOpen(false);
              setAuthDefaultTab('login');
              setAuthModalOpen(true);
            }}
            onSuccess={() => {
              if (currentUser?.role === 'renter') {
                setCurrentView('renter-dashboard');
              }
            }}
          />

          <ReportModal
            isOpen={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            property={selectedProperty}
            currentUser={currentUser}
            onOpenAuth={() => {
              setReportModalOpen(false);
              setAuthDefaultTab('login');
              setAuthModalOpen(true);
            }}
          />
        </>
      )}
    </div>
  );
}
