import React, { useState, useEffect } from 'react';
import { Users, ChevronDown, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllBDRs, UserProfile } from '../services/firestoreService';

interface BDRSelectorProps {
    selectedBdrId: string | null;
    onSelectBdr: (bdrId: string, bdrName: string) => void;
}

const BDRSelector: React.FC<BDRSelectorProps> = ({ selectedBdrId, onSelectBdr }) => {
    const { userProfile } = useAuth();
    const [bdrs, setBdrs] = useState<{ id: string; profile: UserProfile }[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBdrs = async () => {
            if (userProfile?.role === 'manager') {
                try {
                    const bdrList = await getAllBDRs();
                    setBdrs(bdrList);
                    // Auto-select first BDR if none selected
                    if (!selectedBdrId && bdrList.length > 0) {
                        onSelectBdr(bdrList[0].id, bdrList[0].profile.name);
                    }
                } catch (error) {
                    console.error('Error loading BDRs:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadBdrs();
    }, [userProfile, selectedBdrId, onSelectBdr]);

    if (userProfile?.role !== 'manager') return null;

    const selectedBdr = bdrs.find(b => b.id === selectedBdrId);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
            >
                <Users size={16} className="text-purple-400" />
                {loading ? (
                    <span className="text-slate-400">Loading...</span>
                ) : selectedBdr ? (
                    <span>{selectedBdr.profile.name}</span>
                ) : (
                    <span className="text-slate-400">Select BDR</span>
                )}
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden min-w-[200px]">
                    {bdrs.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            No BDRs found
                        </div>
                    ) : (
                        bdrs.map(bdr => (
                            <button
                                key={bdr.id}
                                onClick={() => {
                                    onSelectBdr(bdr.id, bdr.profile.name);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors ${selectedBdrId === bdr.id ? 'bg-slate-700' : ''
                                    }`}
                            >
                                <UserCircle size={20} className="text-slate-400" />
                                <div>
                                    <div className="text-sm font-medium text-white">{bdr.profile.name}</div>
                                    <div className="text-xs text-slate-400">{bdr.profile.email}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BDRSelector;
