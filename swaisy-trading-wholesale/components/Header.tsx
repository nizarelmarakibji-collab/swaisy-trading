
import React from 'react';
import { Logo } from './icons/Logo';
import { User } from '../types';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { CartIcon } from './icons/CartIcon';
import { GridIcon } from './icons/GridIcon';
import { ListIcon } from './icons/ListIcon';
import { AdminIcon } from './icons/AdminIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ImageIcon } from './icons/ImageIcon';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: any) => void;
  cartItemCount: number;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, currentView, onNavigate, cartItemCount }) => {
  const { t, language, setLanguage } = useLanguage();

  const navItemClass = (view: string) => `
    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
    ${currentView === view 
      ? 'bg-primary-50 text-primary-700 font-bold border-b-2 border-primary-500' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
  `;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-t-4 border-secondary-400">
      <div className="container mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between mb-3 md:mb-0">
          {/* Logo Area */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('shop')}>
            <Logo className="h-12 w-auto" />
          </div>

          <div className="flex items-center gap-3">
             <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
                  <button onClick={() => setLanguage('en')} className={`px-2 py-0.5 text-xs rounded ${language === 'en' ? 'bg-white text-primary-700 font-bold shadow-sm' : 'text-slate-500'}`}>EN</button>
                  <button onClick={() => setLanguage('ar')} className={`px-2 py-0.5 text-xs rounded ${language === 'ar' ? 'bg-white text-primary-700 font-bold shadow-sm' : 'text-slate-500'}`}>AR</button>
             </div>
            <div className="text-right rtl:text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1 justify-end rtl:justify-start">
                  {user.username}
                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded-full border ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      user.role === 'editor' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                      user.role === 'shop' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                      {user.role}
                  </span>
              </p>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm" className="hidden sm:inline-flex">
              {t('logout')}
            </Button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 border-t md:border-t-0 pt-3 md:pt-0 md:mt-2 md:justify-center scrollbar-hide">
            {/* Shop: All Roles */}
            <button onClick={() => onNavigate('shop')} className={navItemClass('shop')}>
                <GridIcon className="h-4 w-4" />
                {t('newOrder')}
            </button>

            {/* Cart: All Roles */}
            <button onClick={() => onNavigate('cart')} className={navItemClass('cart')}>
                <div className="relative">
                    <CartIcon className="h-4 w-4" />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-secondary-400 text-slate-900 text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
                            {cartItemCount}
                        </span>
                    )}
                </div>
                {t('reviewOrder')}
            </button>

            {/* Recent Orders: Admin, Salesman & Shop */}
            {(user.role === 'admin' || user.role === 'salesman' || user.role === 'shop') && (
                <button onClick={() => onNavigate('recent_orders')} className={navItemClass('recent_orders')}>
                    <ClockIcon className="h-4 w-4" />
                    {t('recentOrders')}
                </button>
            )}

            {/* Inventory: Admin & Editor */}
            {(user.role === 'admin' || user.role === 'editor') && (
                <>
                    <button onClick={() => onNavigate('inventory')} className={navItemClass('inventory')}>
                        <ListIcon className="h-4 w-4" />
                        {t('inventory')}
                    </button>
                    <button onClick={() => onNavigate('gallery')} className={navItemClass('gallery')}>
                        <ImageIcon className="h-4 w-4" />
                        {t('gallery')}
                    </button>
                </>
            )}

             {/* Users: Admin Only */}
            {user.role === 'admin' && (
                <button onClick={() => onNavigate('admin')} className={navItemClass('admin')}>
                    <AdminIcon className="h-4 w-4" />
                    {t('adminPanel')}
                </button>
            )}

             {/* Mobile Logout */}
             <div className="sm:hidden ml-auto pl-2 border-l">
                <Button onClick={onLogout} variant="ghost" size="sm" className="text-slate-500">
                    {t('logout')}
                </Button>
             </div>
        </nav>
      </div>
    </header>
  );
};
