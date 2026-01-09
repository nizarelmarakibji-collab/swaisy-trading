
import React, { useState } from 'react';
import { Logo } from './icons/Logo';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (username, password) => void;
  error: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const { t, language, setLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-500 to-secondary-400 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto z-10">
             <div className="flex gap-2 bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-white/20">
                <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-sm rounded ${language === 'en' ? 'bg-primary-100 text-primary-700 font-bold' : 'text-slate-500'}`}>EN</button>
                <button onClick={() => setLanguage('ar')} className={`px-2 py-1 text-sm rounded ${language === 'ar' ? 'bg-primary-100 text-primary-700 font-bold' : 'text-slate-500'}`}>عربي</button>
             </div>
        </div>
      <div className="max-w-md w-full relative">
        <div className="flex justify-center mb-6">
            {/* Simplified container to display logo exactly as is, just providing contrast */}
            <div className="bg-white/90 px-6 py-4 rounded-xl shadow-lg">
                <Logo className="h-28 w-auto" />
            </div>
        </div>
        <Card className="shadow-2xl border-t-4 border-secondary-400">
          <h1 className="text-xl font-bold text-center text-slate-800 mb-1">
             {t('welcome')}
          </h1>
          <p className="text-center text-slate-500 mb-6 text-sm">
            {t('signInTitle')}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {t('username')}
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g., swaisy"
                autoComplete="username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {t('password')}
              </label>
              <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
                <button 
                    type="button"
                    className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all">
              {t('login')}
            </Button>
          </form>
        </Card>
        <p className="text-center text-white/80 mt-6 text-sm font-medium drop-shadow-md">
            Your Trusted Wholesale Supplier
        </p>
      </div>
    </div>
  );
};
