

import React, { useState, useMemo, useEffect } from 'react';
// Fix: Import User and Product types.
import { DraftOrder, User, Product } from '../types';
// Fix: Import getProducts to fetch product data.
import { createOrder, getProducts } from '../services/api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface OrderConfirmationProps {
  orderData: DraftOrder;
  onBack: () => void;
  onOrderCreated: () => void;
  // Fix: Add currentUser prop to provide user information for the API call.
  currentUser: User;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderData, onBack, onOrderCreated, currentUser }) => {
  // Fix: Add state to hold products fetched from the API.
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState(orderData.storeName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fix: Fetch products when the component mounts.
  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const subtotal = useMemo(() => {
    return orderData.items.reduce((total, item) => total + (item.qty || 0) * (item.price || 0), 0);
  }, [orderData.items]);
  
  const discountPercentage = orderData.discount || 0;
  const discountAmount = subtotal * (discountPercentage / 100);
  const netTotal = subtotal - discountAmount;

  const handleSubmit = async () => {
    setError(null);
    if (!customerName.trim()) {
      setError('Customer name cannot be empty.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const itemsForApi = orderData.items.map(({ itemName, ...rest }) => rest);
      // Fix: Add the required 'createdBy' property to the createOrder payload.
      // FIX: Corrected the payload for createOrder to match the NewOrderData interface.
      await createOrder({
        storeName: customerName.trim(),
        phoneNumber: orderData.phoneNumber,
        address: orderData.address,
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

  return (
    <Card>
      <div className="flex items-center mb-4 border-b pb-3">
        <Button onClick={onBack} variant="ghost" size="icon" className="mr-2">
            <ArrowLeftIcon className="h-6 w-6" />
        </Button>
        <h2 className="text-2xl font-bold">Confirm Order</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
          <div className="space-y-4">
             <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                <Input id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
             </div>
             <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Order Notes</label>
                <p className="text-sm p-3 bg-slate-50 rounded-md min-h-[40px] border">
                    {orderData.notes || 'No notes provided.'}
                </p>
             </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
           <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
           <div className="space-y-2 max-h-64 overflow-y-auto pr-2 bg-slate-50 p-3 rounded-md border">
             {orderData.items.map(item => (
                <div key={item.itemId} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                    <div className="flex items-center gap-3">
                        {/* Fix: Use products from state to find image URL. */}
                        <img src={products.find(p => p.id === item.itemId)?.imageUrl} alt={item.itemName} referrerPolicy="no-referrer" className="h-10 w-10 rounded object-cover"/>
                        <div>
                            <p className="text-sm font-medium">{item.itemName}</p>
                            <p className="text-xs text-slate-500">{item.qty} x ${item.price.toFixed(2)} <span className="text-slate-400">TVA incl.</span></p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold">${(item.qty * item.price).toFixed(2)}</p>
                        <p className="text-xs text-slate-500 -mt-1">TVA incl.</p>
                    </div>
                </div>
             ))}
           </div>
           
           <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discountPercentage > 0 && (
                   <div className="flex justify-between items-center text-sm text-emerald-600">
                      <span>Discount ({discountPercentage}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                  </div>
              )}

              <div className="flex justify-between items-center text-xl font-bold pt-2 border-t mt-2">
                <span>Total:</span>
                <span className="text-right">
                    ${netTotal.toFixed(2)}
                    <span className="block text-xs font-normal text-slate-500">TVA included</span>
                </span>
              </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t pt-6 flex justify-between items-center">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="ml-auto">
            <Button onClick={onBack} variant="outline" className="mr-3">Back</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} size="md" className="min-w-[180px]">
                {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
            </Button>
        </div>
      </div>

    </Card>
  );
};