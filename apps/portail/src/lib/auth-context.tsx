// apps/portail/src/lib/auth-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

interface AuthContextType {
    eleve: any | null;
    login: (matricule: string, code: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [eleve, setEleve] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vérifier si un token existe déjà au chargement
        const token = localStorage.getItem('eleve_token');
        const savedEleve = localStorage.getItem('eleve_data');
        if (token && savedEleve) {
            setEleve(JSON.parse(savedEleve));
            // Injecter le token dans les futurs appels Supabase
            supabase.functions.setAuth(token);
        }
        setLoading(false);
    }, []);

    const login = async (matricule: string, code: string) => {
        const { data, error } = await supabase.functions.invoke('login-eleve', {
            body: { matricule, code },
        });

        if (error) throw error;

        if (data?.token) {
            localStorage.setItem('eleve_token', data.token);
            localStorage.setItem('eleve_data', JSON.stringify(data.eleve));
            setEleve(data.eleve);
            // Important : configure le client pour utiliser ce JWT pour la RLS
            supabase.functions.setAuth(data.token);
        }
    };

    const logout = () => {
        localStorage.removeItem('eleve_token');
        localStorage.removeItem('eleve_data');
        setEleve(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ eleve, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};