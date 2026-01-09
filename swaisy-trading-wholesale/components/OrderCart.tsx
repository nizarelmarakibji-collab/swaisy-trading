
import React, { useState, useMemo } from 'react';
import { DraftOrder, Product, User } from '../types';
import { createOrder } from '../services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface OrderCartProps {
  products: Product[];
  orderData: DraftOrder;
  onUpdateOrder: (orderData: DraftOrder) => void;
  onOrderCreated: () => void;
  onBackToProducts: () => void;
  currentUser: User;
}

export const OrderCart: React.FC<OrderCartProps> = ({ products, orderData, onUpdateOrder, onOrderCreated, onBackToProducts, currentUser }) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditor = currentUser.role === 'editor';
  const isShop = currentUser.role === 'shop';

  const subtotal = useMemo(() => {
    return orderData.items.reduce((total, item) => total + (item.qty || 0) * (item.price || 0), 0);
  }, [orderData.items]);

  const discountPercentage = orderData.discount || 0;
  const discountAmount = subtotal * (discountPercentage / 100);
  const netTotal = subtotal - discountAmount;

  const handleFieldChange = (field: keyof DraftOrder, value: string) => {
    onUpdateOrder({ ...orderData, [field]: value });
  };

  const handleQuantityChange = (itemId: string, newQty: number) => {
    let newItems;
    if (newQty <= 0) {
      newItems = orderData.items.filter(i => i.itemId !== itemId);
    } else {
      newItems = orderData.items.map(i => i.itemId === itemId ? { ...i, qty: newQty } : i);
    }
    onUpdateOrder({ ...orderData, items: newItems });
  };

  const handleDiscountChange = (val: number) => {
      const discount = Math.min(100, Math.max(0, val || 0));
      onUpdateOrder({ ...orderData, discount });
  }

  const handleSubmit = async () => {
    if (isEditor) return;

    setError(null);
    if (!orderData.storeName.trim() || !orderData.phoneNumber.trim() || !orderData.address.trim()) {
      setError(t('fillRequired'));
      return;
    }
    
    if (!/^\d{8}$/.test(orderData.phoneNumber.trim())) {
        setError(t('phoneError'));
        return;
    }

    if (orderData.items.length === 0) {
      setError(t('yourOrderIsEmpty'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      const itemsForApi = orderData.items.map(({ itemName, ...rest }) => rest);
      await createOrder({
        storeName: orderData.storeName.trim(),
        phoneNumber: orderData.phoneNumber.trim(),
        address: orderData.address.trim(),
        items: itemsForApi,
        notes: orderData.notes,
        discount: orderData.discount,
        createdBy: currentUser.username,
      });
      onOrderCreated();
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (orderData.items.length === 0) {
      return (
          <div className="text-center p-8">
              <h3 className="text-lg font-semibold text-slate-700">{t('yourOrderIsEmpty')}</h3>
              <p className="text-slate-500 mt-2">{t('addProductsStart')}</p>
              <Button onClick={onBackToProducts} variant="outline" className="mt-4">
                  {t('backToProducts')}
              </Button>
          </div>
      )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Items List */}
      <div className="lg:col-span-2">
        <h3 className="text-lg font-semibold mb-3">{t('itemsOrdered')}</h3>
        <div className="space-y-3 pr-2">
          {orderData.items.map(item => (
            <div key={item.itemId} className="flex items-center gap-3 bg-slate-50 p-2 rounded-md border">
              <img src={products.find(p => p.id === item.itemId)?.imageUrl} alt={item.itemName} referrerPolicy="no-referrer" className="h-14 w-14 rounded object-cover"/>
              <div className="flex-grow">
                <p className="text-sm font-medium">{item.itemName}</p>
                <p className="text-xs text-slate-500">${item.price.toFixed(2)} <span className="text-slate-400">{t('tvaIncluded')}</span></p>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleQuantityChange(item.itemId, item.qty - 1)} aria-label="Decrease quantity"><MinusIcon className="h-4 w-4"/></Button>
                <Input type="number" value={item.qty} onChange={e => handleQuantityChange(item.itemId, parseInt(e.target.value) || 0)} className="w-14 text-center p-1 h-8" aria-label={`Quantity for ${item.itemName}`}/>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleQuantityChange(item.itemId, item.qty + 1)} aria-label="Increase quantity"><PlusIcon className="h-4 w-4"/></Button>
              </div>
              <div className="text-right rtl:text-left w-24">
                  <p className="text-sm font-semibold">${(item.qty * item.price).toFixed(2)}</p>
                  <p className="text-xs text-slate-500 -mt-1">{t('tvaIncluded')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary & Customer Info */}
      <div>
        <div className="bg-slate-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">{t('storeName')}</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 mb-1">{t('storeName')} *</label>
              <Input 
                id="storeName" 
                value={orderData.storeName} 
                onChange={e => handleFieldChange('storeName', e.target.value)} 
                required 
                disabled={isShop || isEditor}
              />
            </div>
             <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1">{t('phoneNumber')} *</label>
              <Input 
                id="phoneNumber" 
                type="tel" 
                value={orderData.phoneNumber} 
                onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                    handleFieldChange('phoneNumber', val);
                }}
                placeholder="8 digits"
                required 
                disabled={isShop || isEditor}
               />
               <p className="text-xs text-slate-500 mt-1">Must be 8 digits</p>
            </div>
             <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">{t('address')} *</label>
              <Input 
                id="address" 
                value={orderData.address} 
                onChange={e => handleFieldChange('address', e.target.value)} 
                required 
                disabled={isShop || isEditor}
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">{t('notes')}</label>
              <textarea id="notes" value={orderData.notes} onChange={(e) => handleFieldChange('notes', e.target.value)} rows={3} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>
          </div>

          {/* Totals Section */}
          <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>{t('subtotal')}:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                  <label htmlFor="discount" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      {t('discountPercentage')}
                  </label>
                  <div className="w-20 relative">
                      <Input
                          id="discount"
                          type="number"
                          min="0"
                          max="100"
                          value={orderData.discount || 0}
                          onChange={(e) => handleDiscountChange(parseFloat(e.target.value))}
                          className="text-right h-8 py-1 pr-6"
                          disabled={isShop || isEditor}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  </div>
              </div>
              
              {discountAmount > 0 && (
                   <div className="flex justify-between items-center text-sm text-emerald-600">
                      <span>{t('discount')}:</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                  </div>
              )}

              <div className="flex justify-between items-center text-xl font-bold pt-2 border-t mt-2">
                <span>{t('total')}:</span>
                <span className="text-right rtl:text-left">
                    ${netTotal.toFixed(2)}
                    <span className="block text-xs font-normal text-slate-500">{t('tvaIncluded')}</span>
                </span>
              </div>
          </div>
        </div>
        
        <div className="mt-4">
          {isEditor && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3 flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{t('editorRestrictionMessage')}</p>
              </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-3">{error}</p>}
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleSubmit} disabled={isSubmitting || isEditor} size="md" className="w-full">
              {isSubmitting ? t('placingOrder') : t('confirmOrder')}
            </Button>
            <Button onClick={onBackToProducts} variant="outline" className="w-full">
                {t('backToProducts')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};