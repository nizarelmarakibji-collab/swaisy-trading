
import React, { useState } from 'react';
import { Product } from '../types';
import { Button } from './ui/Button';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { Input } from './ui/Input';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, qty: number) => void;
}

const DetailRow: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-2 px-3 flex justify-between items-center odd:bg-slate-50 rounded-md">
        <dt className="text-sm font-medium text-slate-500">{label}</dt>
        <dd className="text-sm text-slate-900 text-right rtl:text-left">{value}</dd>
    </div>
);

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const { t } = useLanguage();
  const [qty, setQty] = useState(1);
  const isSoldOut = product.stockStatus.toLowerCase() === 'out';

  const handleIncrement = () => setQty(q => q + 1);
  const handleDecrement = () => setQty(q => Math.max(1, q - 1));

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 id="product-detail-title" className="text-xl font-bold text-slate-900">{product.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <XIcon className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img src={product.imageUrl} alt={product.name} referrerPolicy="no-referrer" className="w-full h-auto object-cover rounded-lg shadow-md aspect-square" />
            </div>
            <div>
              <p className="text-slate-600 mb-4">{product.description}</p>
              <dl className="space-y-1">
                <DetailRow label={t('price')} value={
                    <span>
                        {`$${product.defaultPrice.toFixed(2)} `}
                        <span className="text-xs text-slate-500 font-normal">{t('tvaIncluded')}</span>
                    </span>
                } />
                <DetailRow label={t('category')} value={product.category} />
                <DetailRow label={t('subCategory')} value={product.subCategory} />
                <DetailRow label={t('weight')} value={product.weight} />
                <DetailRow label={t('packaging')} value={product.packaging} />
                <DetailRow label={t('unitPerPack')} value={product.unitPerPack} />
                <DetailRow 
                  label={t('status')}
                  value={
                    <span className={`font-bold ${isSoldOut ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isSoldOut ? t('soldOut') : 'In Stock'}
                    </span>
                  } 
                />
              </dl>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl mt-auto">
            {!isSoldOut && (
                <div className="flex items-center justify-center mb-4 gap-4">
                    <label className="font-medium text-slate-700">{t('quantity')}:</label>
                    <div className="flex items-center gap-1">
                        <Button type="button" size="icon" variant="outline" onClick={handleDecrement}><MinusIcon className="h-4 w-4"/></Button>
                        <Input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center p-2" />
                        <Button type="button" size="icon" variant="outline" onClick={handleIncrement}><PlusIcon className="h-4 w-4"/></Button>
                    </div>
                </div>
            )}
          <Button onClick={() => onAddToCart(product, qty)} className="w-full" disabled={isSoldOut}>
            {isSoldOut ? t('soldOut') : t('addToOrder')}
          </Button>
        </div>
      </div>
    </div>
  );
};
