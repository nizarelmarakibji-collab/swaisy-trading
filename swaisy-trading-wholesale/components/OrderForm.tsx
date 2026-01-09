
import React, { useState, useMemo, useEffect } from 'react';
import { Product, OrderItem, DraftOrder } from '../types';
import { getProducts } from '../services/api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { SearchIcon } from './icons/SearchIcon';

interface OrderFormProps {
  onProceedToConfirmation: (orderData: DraftOrder) => void;
  initialData: DraftOrder | null;
}

const ProductCard: React.FC<{ product: Product, onSelect: () => void }> = ({ product, onSelect }) => (
    <div 
        onClick={onSelect}
        className="bg-white border border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
    >
        <img src={product.imageUrl} alt={product.name} className="h-24 w-24 rounded-md object-cover mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-slate-800 leading-tight">{product.name}</h4>
        <p className="text-xs text-slate-500 mt-1">${product.defaultPrice.toFixed(2)} <span className="text-slate-400">TVA incl.</span></p>
    </div>
);


export const OrderForm: React.FC<OrderFormProps> = ({ onProceedToConfirmation, initialData }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (initialData) {
      setStoreName(initialData.storeName);
      setPhoneNumber(initialData.phoneNumber);
      setAddress(initialData.address);
      setItems(initialData.items);
      setNotes(initialData.notes);
    }
  }, [initialData]);


  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, products]);

  const handleProductSelect = (product: Product) => {
    setItems(currentItems => {
        const existingItem = currentItems.find(i => i.itemId === product.id);
        if (existingItem) {
            return currentItems.map(i => 
                i.itemId === product.id ? { ...i, qty: i.qty + 1 } : i
            );
        }
        return [...currentItems, { itemId: product.id, itemName: product.name, qty: 1, price: product.defaultPrice }];
    });
  };

  const handleQuantityChange = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
        setItems(items.filter(i => i.itemId !== itemId));
    } else {
        setItems(items.map(i => i.itemId === itemId ? { ...i, qty: newQty } : i));
    }
  }

  const orderTotal = useMemo(() => {
    return items.reduce((total, item) => total + (item.qty || 0) * (item.price || 0), 0);
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!storeName.trim()) {
      setError('Please enter a store name.');
      return;
    }
    if (!phoneNumber.trim()) {
        setError('Please enter a phone number.');
        return;
    }
    if (!address.trim()) {
        setError('Please enter an address.');
        return;
    }
    if (items.length === 0) {
      setError('Please add at least one item to the order.');
      return;
    }
    
    onProceedToConfirmation({
      storeName: storeName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      items,
      notes,
    });
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 border-b pb-3">Create New Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* PRODUCT GRID */}
            <div className="lg:col-span-3">
                <div className="relative mb-4">
                    <Input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-2 bg-slate-50 rounded-lg">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onSelect={() => handleProductSelect(product)} />
                    ))}
                </div>
            </div>

            {/* ORDER CART */}
            <div className="lg:col-span-2">
                <div className="bg-slate-50 p-4 rounded-lg h-full flex flex-col">
                    <h3 className="text-xl font-bold mb-4">Current Order</h3>
                    <div>
                        <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                        <Input
                            id="storeName"
                            type="text"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            placeholder="Enter store name"
                            required
                        />
                    </div>
                    <div className="mt-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <Input
                            id="phone"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter phone number"
                            required
                        />
                    </div>
                    <div className="mt-2">
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <Input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter address"
                            required
                        />
                    </div>

                    <div className="mt-4 flex-grow overflow-y-auto space-y-3 pr-2">
                        {items.length === 0 ? (
                            <p className="text-slate-500 text-center mt-8">Click products to add them to the order.</p>
                        ) : (
                            items.map(item => (
                                <div key={item.itemId} className="flex items-center gap-3 bg-white p-2 rounded-md shadow-sm">
                                    <img src={products.find(p => p.id === item.itemId)?.imageUrl} alt={item.itemName} className="h-12 w-12 rounded object-cover"/>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium">{item.itemName}</p>
                                        <p className="text-xs text-slate-500">${item.price.toFixed(2)} <span className="text-slate-400">TVA incl.</span></p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleQuantityChange(item.itemId, item.qty - 1)}><MinusIcon className="h-4 w-4"/></Button>
                                        <Input type="number" value={item.qty} onChange={e => handleQuantityChange(item.itemId, parseInt(e.target.value) || 0)} className="w-12 text-center p-1 h-7"/>
                                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleQuantityChange(item.itemId, item.qty + 1)}><PlusIcon className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t">
                        <div className="mt-4">
                            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold my-4">
                            <span>Total:</span>
                            <span className="text-right">
                                ${orderTotal.toFixed(2)}
                                <span className="block text-xs font-normal text-slate-500">TVA included</span>
                            </span>
                        </div>

                        {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-3">{error}</p>}
                        
                        <Button type="submit" disabled={items.length === 0 || !storeName} className="w-full">
                            Review Order
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </form>
    </Card>
  );
};
