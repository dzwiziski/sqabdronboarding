import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BDROnboardingCalendar from './components/BDROnboardingCalendar';
import SuperadminDashboard from './components/SuperadminDashboard';
import Login from './components/Login';
import { getBDROnboardingData } from './services/firestoreService';
import { Calendar, Clock } from 'lucide-react';

const WaitingForStartDate: React.FC<{ userName: string; onSignOut: () => void }> = ({ userName, onSignOut }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Clock size={40} className="text-blue-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Welcome, {userName}!</h1>
      <p className="text-slate-400 mb-6">
        Your manager will set your onboarding start date. Once that's done, you'll see your personalized 90-day calendar here.
      </p>
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 mb-6">
        <div className="flex items-center gap-3 text-left">
          <Calendar size={20} className="text-slate-500" />
          <div>
            <div className="text-sm font-medium text-slate-300">Start date pending</div>
            <div className="text-xs text-slate-500">Check back soon or contact your manager</div>
          </div>
        </div>
      </div>
      <button onClick={onSignOut} className="text-slate-400 hover:text-white text-sm transition-colors">
        Sign Out
      </button>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const [selectedBdrId, setSelectedBdrId] = useState<string | null>(null);
  const [selectedBdrName, setSelectedBdrName] = useState<string>('');
  const [hasStartDate, setHasStartDate] = useState<boolean | null>(null);
  const [checkingStartDate, setCheckingStartDate] = useState(false);

  useEffect(() => {
    const checkStartDate = async () => {
      if (user && userProfile?.role === 'bdr') {
        setCheckingStartDate(true);
        try {
          const data = await getBDROnboardingData(user.uid);
          setHasStartDate(!!data?.startDate);
        } catch (error) {
          console.error('Error checking start date:', error);
          setHasStartDate(false);
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

  // BDR without start date - show waiting message
  if (userProfile.role === 'bdr' && hasStartDate === false) {
    return <WaitingForStartDate userName={userProfile.name} onSignOut={signOut} />;
  }

  // Superadmin view
  if (userProfile.role === 'superadmin') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Superadmin Panel</h1>
            <button onClick={signOut} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">Sign Out</button>
          </div>
          <SuperadminDashboard />
        </div>
      </div>
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