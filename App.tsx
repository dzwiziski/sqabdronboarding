import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BDROnboardingCalendar from './components/BDROnboardingCalendar';
import Login from './components/Login';

const AppContent: React.FC = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const [selectedBdrId, setSelectedBdrId] = useState<string | null>(null);
  const [selectedBdrName, setSelectedBdrName] = useState<string>('');

  if (loading) {
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

  // For managers, pass the selected BDR ID; for BDRs, use their own ID
  const targetBdrId = userProfile.role === 'manager' ? selectedBdrId : user.uid;
  const isViewingOwnCalendar = userProfile.role === 'bdr' || (userProfile.role === 'manager' && selectedBdrId === user.uid);

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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

export default App;