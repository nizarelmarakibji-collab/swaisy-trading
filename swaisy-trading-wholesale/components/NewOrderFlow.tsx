
import React, { useState } from 'react';
import { OrderItem, DraftOrder, Product, User, GalleryItem } from '../types';
import { Card } from './ui/Card';
import { ProductSelection } from './ProductSelection';
import { OrderCart } from './OrderCart';
import { CartIcon } from './icons/CartIcon';

interface NewOrderFlowProps {
  onOrderCreated: () => void;
  onCancel: () => void;
  products: Product[];
  currentUser: User;
  // Added missing props to satisfy ProductSelection requirements
  gallery: GalleryItem[];
  onProductUpdate: (product: Product) => Promise<void>;
}

type OrderTab = 'products' | 'cart';

export const NewOrderFlow: React.FC<NewOrderFlowProps> = ({ 
  onOrderCreated, 
  onCancel, 
  products, 
  currentUser, 
  gallery, 
  onProductUpdate 
}) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('products');
  const [draftOrder, setDraftOrder] = useState<DraftOrder>({
    storeName: '',
    phoneNumber: '',
    address: '',
    items: [],
    notes: ''
  });

  // Updated to accept qty parameter from ProductSelection
  const handleProductSelect = (product: Product, qty: number) => {
    setDraftOrder(currentOrder => {
      const existingItem = currentOrder.items.find(i => i.itemId === product.id);
      let newItems;
      if (existingItem) {
        newItems = currentOrder.items.map(i =>
          i.itemId === product.id ? { ...i, qty: i.qty + qty } : i
        );
      } else {
        newItems = [...currentOrder.items, { itemId: product.id, itemName: product.name, qty, price: product.defaultPrice }];
      }
      return { ...currentOrder, items: newItems };
    });
  };

  const handleUpdateOrder = (updatedOrder: DraftOrder) => {
    setDraftOrder(updatedOrder);
  };
  
  const totalItems = draftOrder.items.reduce((sum, item) => sum + item.qty, 0);

  const TabButton: React.FC<{tab: OrderTab, label: string, children?: React.ReactNode}> = ({ tab, label, children }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
          isActive
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`}
      >
        {children}
        {label}
      </button>
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h2 className="text-2xl font-bold">Create New Order</h2>
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-800">Cancel</button>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <TabButton tab="products" label="1. Select Products" />
            <TabButton tab="cart" label="2. Review Order">
                <CartIcon className="h-5 w-5 mr-2" />
                {totalItems > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">{totalItems}</span>
                )}
            </TabButton>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'products' && (
          // Pass all required props to ProductSelection component
          <ProductSelection 
            products={products}
            gallery={gallery}
            onProductSelect={handleProductSelect} 
            onProceedToCart={() => setActiveTab('cart')}
            cartItemCount={totalItems}
            currentUser={currentUser}
            onProductUpdate={onProductUpdate}
          />
        )}
        {activeTab === 'cart' && (
          <OrderCart 
            products={products}
            orderData={draftOrder}
            onUpdateOrder={handleUpdateOrder}
            onOrderCreated={onOrderCreated}
            onBackToProducts={() => setActiveTab('products')}
            currentUser={currentUser}
          />
        )}
      </div>
    </Card>
  );
};
