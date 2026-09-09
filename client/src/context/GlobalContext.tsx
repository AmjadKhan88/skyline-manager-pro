import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../lib/api';
import { User } from '../types';

interface GlobalContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
const [darkMode, setDarkMode] = useState(() => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
});

useEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode);
  localStorage.setItem('theme', darkMode ? 'dark' : 'light');
}, [darkMode]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.success) setUser(data.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);



  return (
    <GlobalContext.Provider value={{ user, setUser, loading, darkMode, setDarkMode }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobal must be used within GlobalProvider');
  return ctx;
};

export default useGlobal;