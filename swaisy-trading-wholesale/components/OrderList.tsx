

import React, { useState } from 'react';
import { Order, OrderStatus, User, Product } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CogIcon } from './icons/CogIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  currentUser: User;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  products: Product[];
  users: User[];
  onDeleteOrder: (orderId: string) => void;
}

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const { t } = useLanguage();
    const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; classes: string; }> = {
        pending: {
            label: t('pending'),
            icon: <ClockIcon className="h-4 w-4" />,
            classes: "bg-amber-100 text-amber-800",
        },
        'in progress': {
            label: t('inProgress'),
            icon: <CogIcon className="h-4 w-4" />,
            classes: "bg-sky-100 text-sky-800",
        },
        done: {
            label: t('done'),
            icon: <CheckCircleIcon className="h-4 w-4" />,
            classes: "bg-emerald-100 text-emerald-800",
        }
    }

    const config = statusConfig[status];
    if (!config) return null;
    const { label, icon, classes } = config;
    return (
        <span className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${classes}`}>
            {icon}
            {label}
        </span>
    );
};


const OrderItemCard: React.FC<{ 
    order: Order; 
    currentUser: User; 
    onUpdateStatus: (orderId: string, status: OrderStatus) => void; 
    isExpanded: boolean; 
    onToggleDetails: () => void; 
    products: Product[];
    users: User[];
    onDeleteOrder: (orderId: string) => void;
}> = ({ order, currentUser, onUpdateStatus, isExpanded, onToggleDetails, products, users, onDeleteOrder }) => {
    const { t } = useLanguage();
    
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdateStatus(order.orderId, e.target.value as OrderStatus);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        if (window.confirm(t('deleteOrderConfirm'))) {
            onDeleteOrder(order.orderId);
        }
    };

    const isCreatorDeleted = !users.some(u => u.username === order.createdBy);
    
    // Fallback to current total if subtotal/discount aren't saved in old orders
    const displaySubtotal = order.subtotal !== undefined ? order.subtotal : order.total;
    const displayDiscountPercentage = order.discount || 0;
    const displayDiscountAmount = displaySubtotal * (displayDiscountPercentage / 100);

    return (
        <div 
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200 cursor-pointer relative"
            onClick={onToggleDetails}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleDetails()}
            aria-expanded={isExpanded}
        >
            <div className="flex justify-between items-start gap-2">
                <div>
                    <h3 className="font-bold text-slate-900">{order.storeName}</h3>
                    <p className="text-sm text-slate-500">{order.orderId}</p>
                </div>
                <div className="flex items-center gap-2">
                    {currentUser.role === 'admin' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                             <select 
                                value={order.status}
                                onChange={handleStatusChange}
                                className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                aria-label={`Update status for order ${order.orderId}`}
                             >
                                <option value="pending">{t('pending')}</option>
                                <option value="in progress">{t('inProgress')}</option>
                                <option value="done">{t('done')}</option>
                             </select>
                             <button 
                                onClick={handleDeleteClick}
                                onMouseDown={(e) => e.stopPropagation()}
                                type="button"
                                className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors relative z-50 bg-white border border-slate-100 shadow-sm"
                                title={t('delete')}
                             >
                                <TrashIcon className="h-5 w-5 pointer-events-none" />
                             </button>
                        </div>
                    ) : (
                        <StatusBadge status={order.status} />
                    )}
                    <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            <div className="mt-4 border-t pt-3">
                 <div className="flex justify-between items-center text-sm text-slate-600">
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="text-right rtl:text-left">
                        <span className="font-bold text-lg text-primary-700">${order.total.toFixed(2)}</span>
                        <span className="block text-xs font-normal text-slate-500 -mt-1">{t('tvaIncluded')}</span>
                    </span>
                 </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        {/* Left Column: Customer Info & Notes */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-1.5">{t('customerDetails')}</h4>
                                <div className="space-y-1 text-slate-600">
                                    <p><span className="font-medium">{t('phoneNumber')}:</span> {order.phoneNumber}</p>
                                    <p><span className="font-medium">{t('address')}:</span> {order.address}</p>
                                    <p>
                                        <span className="font-medium">{t('placedBy')}:</span> {order.createdBy}
                                        {isCreatorDeleted && (
                                            <span className="text-rose-600 text-xs italic ml-1 rtl:mr-1 font-semibold">{t('userDeleted')}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            {order.notes && (
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-1.5">{t('notes')}</h4>
                                    <p className="p-2 bg-slate-50 rounded-md text-slate-700 border text-xs leading-relaxed">{order.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Items */}
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">{t('itemsOrdered')} ({order.items.length})</h4>
                            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 -mr-2 mb-3">
                                {order.items.map(item => {
                                    const product = products.find(p => p.id === item.itemId);
                                    return (
                                        <li key={item.itemId} className="flex justify-between items-center bg-slate-50 p-2 rounded-md border gap-3">
                                            <img 
                                                src={product?.imageUrl} 
                                                alt={item.itemName} 
                                                className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                                                referrerPolicy="no-referrer"
                                                onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/placeholder/40/40'; }}
                                            />
                                            <div className="flex-grow">
                                                <p className="font-medium text-slate-800">{item.itemName}</p>
                                                <p className="text-xs text-slate-500">{item.qty} &times; ${item.price.toFixed(2)}</p>
                                            </div>
                                            <p className="font-semibold text-slate-900 w-20 text-right rtl:text-left">${(item.price * item.qty).toFixed(2)}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                            
                            {/* Totals Breakdown */}
                            <div className="border-t pt-2 space-y-1 text-slate-600 text-sm">
                                <div className="flex justify-between">
                                    <span>{t('subtotal')}</span>
                                    <span>${displaySubtotal.toFixed(2)}</span>
                                </div>
                                {displayDiscountPercentage > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>{t('discount')} ({displayDiscountPercentage}%)</span>
                                        <span>-${displayDiscountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100 mt-1">
                                    <span>{t('total')}</span>
                                    <span>${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export const OrderList: React.FC<OrderListProps> = ({ orders, isLoading, error, currentUser, onUpdateStatus, products, users, onDeleteOrder }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleToggleDetails = (orderId: string) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };
  
  return (
    <div className="space-y-4">
        {isLoading && <p>Loading orders...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && orders.length === 0 && <p>No orders found.</p>}
        {!isLoading && !error && orders.map(order => (
          <OrderItemCard 
            key={order.orderId} 
            order={order} 
            currentUser={currentUser} 
            onUpdateStatus={onUpdateStatus}
            isExpanded={expandedOrderId === order.orderId}
            onToggleDetails={() => handleToggleDetails(order.orderId)}
            products={products}
            users={users}
            onDeleteOrder={onDeleteOrder}
          />
        ))}
    </div>
  );
};
