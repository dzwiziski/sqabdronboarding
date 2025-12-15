import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BDROnboardingCalendar from './components/BDROnboardingCalendar';
import Login from './components/Login';
import OnboardingWizard from './components/OnboardingWizard';
import { getBDROnboardingData } from './services/firestoreService';

const AppContent: React.FC = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const [selectedBdrId, setSelectedBdrId] = useState<string | null>(null);
  const [selectedBdrName, setSelectedBdrName] = useState<string>('');
  const [hasStartDate, setHasStartDate] = useState<boolean | null>(null);
  const [checkingStartDate, setCheckingStartDate] = useState(false);

  // Check if BDR has set their start date
  useEffect(() => {
    const checkStartDate = async () => {
      if (user && userProfile?.role === 'bdr') {
        setCheckingStartDate(true);
        try {
          const data = await getBDROnboardingData(user.uid);
          setHasStartDate(!!data?.startDate);
        } catch (error) {
          console.error('Error checking start date:', error);
          setHasStartDate(true); // Assume they have one to avoid blocking
        } finally {
          setCheckingStartDate(false);
        }
      }
    };
    checkStartDate();
  }, [user, userProfile]);

  if (loading || checkingStartDate) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <Login />;
  }

  // Show onboarding wizard for BDRs who haven't set start date
  if (userProfile.role === 'bdr' && hasStartDate === false) {
    return (
      <OnboardingWizard
        userId={user.uid}
        userName={userProfile.name}
        onComplete={() => setHasStartDate(true)}
      />
    );
  }

  const targetBdrId = userProfile.role === 'manager' ? selectedBdrId : user.uid;

  return (
    <BDROnboardingCalendar
      userId={user.uid}
      userProfile={userProfile}
      targetBdrId={targetBdrId}
      targetBdrName={userProfile.role === 'manager' ? selectedBdrName : userProfile.name}
      onSelectBdr={(id, name) => { setSelectedBdrId(id); setSelectedBdrName(name); }}
      onSignOut={signOut}
    />
  );
};

// Error boundary to catch crashes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-4">{this.state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950">
          <AppContent />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;