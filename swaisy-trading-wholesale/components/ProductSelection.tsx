

import React, { useState, useMemo, useEffect } from 'react';
import { Product, User, GalleryItem } from '../types';
import { Input } from './ui/Input';
import { SearchIcon } from './icons/SearchIcon';
import { Button } from './ui/Button';
import { ProductDetailModal } from './ProductDetailModal';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { PencilIcon } from './icons/PencilIcon';
import { EditProductModal } from './Inventory';

interface ProductSelectionProps {
  products: Product[];
  gallery: GalleryItem[];
  onProductSelect: (product: Product, qty: number) => void;
  onProceedToCart: () => void;
  cartItemCount: number;
  currentUser: User;
  onProductUpdate: (product: Product) => Promise<void>;
}

// Components for Hierarchy
const GridCard: React.FC<{ title: string, image?: string, onClick: () => void, subtext?: string, isBrand?: boolean }> = ({ title, image, onClick, subtext, isBrand }) => (
    <div 
        onClick={onClick}
        className="cursor-pointer bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-primary-300 transition-all group"
    >
        <div className={`bg-slate-100 w-full relative flex items-center justify-center ${isBrand ? 'h-24 p-2' : 'h-32'}`}>
             {image ? (
                <img src={image} alt={title} className={`w-full h-full ${isBrand ? 'object-contain' : 'object-cover'}`} referrerPolicy="no-referrer" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="text-4xl font-bold opacity-20">{title.charAt(0)}</span>
                </div>
             )}
             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all" />
        </div>
        <div className="p-3 text-center border-t border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{title}</h3>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

const ProductCard: React.FC<{ product: Product, onSelect: () => void, t: any, canEdit: boolean, onEdit: (e: React.MouseEvent) => void, language: string }> = ({ product, onSelect, t, canEdit, onEdit, language }) => {
    return (
        <div 
            onClick={onSelect}
            className="relative bg-white border border-slate-200 rounded-lg p-3 text-center transition-all group cursor-pointer hover:border-primary-500 hover:shadow-lg hover:scale-105"
            role="button"
        >
             {canEdit && (
                <button 
                    onClick={onEdit} 
                    className="absolute top-2 right-2 z-20 p-1.5 bg-white rounded-full shadow text-slate-500 hover:text-primary-600"
                    title={t('editItem')}
                >
                    <PencilIcon className="h-4 w-4" />
                </button>
            )}
            
            {product.isSpecialOffer && (
                <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-secondary-400 text-slate-900 text-xs font-bold rounded shadow-sm">
                    SALE
                </div>
            )}

            <div className="absolute inset-0 bg-primary-600 text-white flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-90 transition-opacity pointer-events-none z-10">
                <span className="font-bold">{t('viewDetails')}</span>
            </div>
            <img src={product.imageUrl} alt={product.name} referrerPolicy="no-referrer" className="h-24 w-24 rounded-md object-cover mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                {language === 'ar' && product.nameAr ? product.nameAr : product.name}
            </h4>
            <p className="text-xs text-slate-500 mt-1">${product.defaultPrice.toFixed(2)}</p>
        </div>
    );
};

export const ProductSelection: React.FC<ProductSelectionProps> = ({ products, gallery, onProductSelect, onProceedToCart, cartItemCount, currentUser, onProductUpdate }) => {
  const { t, language } = useLanguage();
  const [viewState, setViewState] = useState<'categories' | 'subcategories' | 'brands' | 'items'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Filter products to only show in-stock items for the shop
  const shopProducts = useMemo(() => products.filter(p => p.stockStatus !== 'out'), [products]);

  // Logic for localized Categories
  interface LocalizedCategory {
      id: string; // English name as ID
      display: string;
  }

  const categories: LocalizedCategory[] = useMemo(() => {
    const map = new Map<string, string>();
    shopProducts.forEach(p => {
        if (p.category && p.category !== 'Special Offers') { // Exclude legacy hardcoded 'Special Offers' if present
            // If not in map, add it. Prefer Arabic if language is Arabic and available
            if (!map.has(p.category)) {
                 map.set(p.category, (language === 'ar' && p.categoryAr) ? p.categoryAr : p.category);
            } else if (language === 'ar' && p.categoryAr && map.get(p.category) === p.category) {
                 // Upgrade to Arabic if found later
                 map.set(p.category, p.categoryAr);
            }
        }
    });
    return Array.from(map.entries()).map(([id, display]) => ({ id, display })).sort((a, b) => a.display.localeCompare(b.display));
  }, [shopProducts, language]);

  const specialOffersProducts = useMemo(() => {
      return shopProducts.filter(p => p.isSpecialOffer);
  }, [shopProducts]);

  const subCategories: LocalizedCategory[] = useMemo(() => {
      if (!selectedCategory) return [];
      const map = new Map<string, string>();
      shopProducts
        .filter(p => p.category === selectedCategory)
        .forEach(p => {
             if (p.subCategory && p.subCategory !== 'N/A') {
                 if (!map.has(p.subCategory)) {
                      map.set(p.subCategory, (language === 'ar' && p.subCategoryAr) ? p.subCategoryAr : p.subCategory);
                 } else if (language === 'ar' && p.subCategoryAr && map.get(p.subCategory) === p.subCategory) {
                      map.set(p.subCategory, p.subCategoryAr);
                 }
             }
        });
      return Array.from(map.entries()).map(([id, display]) => ({ id, display })).sort((a, b) => a.display.localeCompare(b.display));
  }, [shopProducts, selectedCategory, language]);

  const brands = useMemo(() => {
      if (!selectedCategory || !selectedSubCategory) return [];
      return Array.from(new Set(shopProducts
        .filter(p => p.category === selectedCategory && p.subCategory === selectedSubCategory)
        .map(p => p.brand)
      ));
  }, [shopProducts, selectedCategory, selectedSubCategory]);

  const filteredItems = useMemo(() => {
      if (searchTerm) {
          return shopProducts.filter(p => 
             p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (p.nameAr && p.nameAr.includes(searchTerm))
          );
      }
      if (viewState === 'items' && selectedCategory && selectedSubCategory && selectedBrand) {
          return shopProducts.filter(p => 
              p.category === selectedCategory && 
              p.subCategory === selectedSubCategory && 
              p.brand === selectedBrand
          );
      }
      return [];
  }, [shopProducts, searchTerm, viewState, selectedCategory, selectedSubCategory, selectedBrand]);

  // Navigation Handlers
  const goHome = () => {
      setViewState('categories');
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setSelectedBrand(null);
      setSearchTerm('');
  };

  const selectCategory = (catId: string) => {
      setSelectedCategory(catId);
      setViewState('subcategories');
  };

  const selectSubCategory = (subId: string) => {
      setSelectedSubCategory(subId);
      setViewState('brands');
  };

  const selectBrand = (brand: string) => {
      setSelectedBrand(brand);
      setViewState('items');
  };

  const goBack = () => {
      if (viewState === 'items') setViewState('brands');
      else if (viewState === 'brands') setViewState('subcategories');
      else if (viewState === 'subcategories') setViewState('categories');
  };

  // Helper to display selected category name (localized)
  const getCategoryDisplayName = (id: string) => {
      const found = categories.find(c => c.id === id);
      return found ? found.display : id;
  }

  const getSubCategoryDisplayName = (id: string) => {
      const found = subCategories.find(c => c.id === id);
      return found ? found.display : id;
  }

  const getBreadcrumbs = () => {
      const parts = [
          { label: t('categories'), onClick: goHome },
      ];
      if (selectedCategory) parts.push({ label: getCategoryDisplayName(selectedCategory), onClick: () => setViewState('subcategories') });
      if (selectedSubCategory) parts.push({ label: getSubCategoryDisplayName(selectedSubCategory), onClick: () => setViewState('brands') });
      if (selectedBrand) parts.push({ label: selectedBrand, onClick: () => {} });
      
      return (
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 flex-wrap">
               {parts.map((part, idx) => (
                   <React.Fragment key={idx}>
                       {idx > 0 && <span>/</span>}
                       <button 
                        onClick={part.onClick}
                        className={`hover:text-primary-600 ${idx === parts.length - 1 ? 'font-bold text-slate-800' : ''}`}
                       >
                           {part.label}
                       </button>
                   </React.Fragment>
               ))}
          </div>
      )
  }
  
  // Helper to get image for category/subcat/brand
  const getEntityImage = (name: string, filterFn: (p: Product) => boolean) => {
      const normalizedName = name.trim().toLowerCase();
      
      // Try to find in gallery
      const galleryItem = gallery.find(g => {
          const gName = g.name.toLowerCase();
          if (gName === normalizedName) return true;
          const lastDot = gName.lastIndexOf('.');
          if (lastDot !== -1 && gName.substring(0, lastDot) === normalizedName) return true;
          return false;
      });

      if (galleryItem) return galleryItem.data;

      // Fallback
      const prod = shopProducts.find(filterFn);
      return prod ? prod.imageUrl : undefined;
  }

  // Admin Edit Logic
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'editor';
  const handleEditClick = (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();
      setEditingProduct(product);
  };

  // Render Logic
  return (
    <div>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(p, q) => { onProductSelect(p, q); setSelectedProduct(null); }}
          />
        )}
        {editingProduct && (
            <EditProductModal 
                product={editingProduct}
                onClose={() => setEditingProduct(null)}
                onSave={(p) => { onProductUpdate(p); setEditingProduct(null); }}
            />
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
                <Input 
                    type="text" 
                    placeholder={t('searchPlaceholder')} 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rtl:pr-10 rtl:pl-2"
                    aria-label="Search products"
                />
                <SearchIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
        </div>

        {/* Search Results Mode */}
        {searchTerm ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2 bg-slate-50 rounded-lg">
                {filteredItems.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onSelect={() => setSelectedProduct(product)} 
                        t={t} 
                        canEdit={canEdit}
                        onEdit={(e) => handleEditClick(e, product)}
                        language={language}
                    />
                ))}
                 {filteredItems.length === 0 && (
                    <div className="col-span-full text-center p-8 text-slate-500">
                        <p>{t('noProductsFound')}</p>
                    </div>
                )}
            </div>
        ) : (
            <>
                {/* Hierarchy Navigation */}
                {viewState !== 'categories' && (
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" onClick={goBack} className="p-1"><ArrowLeftIcon className="h-4 w-4" /></Button>
                        {getBreadcrumbs()}
                    </div>
                )}

                {/* FIRST PAGE: CATEGORIES */}
                {viewState === 'categories' && (
                    <div className="space-y-8">
                        {specialOffersProducts.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-secondary-600 mb-3 flex items-center gap-2">
                                    {t('specialOffers')}
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-4">
                                    {specialOffersProducts.map(p => (
                                        <div key={p.id} className="min-w-[160px] w-[160px]">
                                            <ProductCard 
                                                product={p} 
                                                onSelect={() => setSelectedProduct(p)} 
                                                t={t}
                                                canEdit={canEdit}
                                                onEdit={(e) => handleEditClick(e, p)}
                                                language={language}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                             <h2 className="text-lg font-bold text-slate-800 mb-3">{t('categories')}</h2>
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {categories.map(cat => (
                                    <GridCard 
                                        key={cat.id} 
                                        title={cat.display} 
                                        image={getEntityImage(cat.id, p => p.category === cat.id)} 
                                        onClick={() => selectCategory(cat.id)}
                                    />
                                ))}
                             </div>
                        </section>

                        {/* Shop By Brand (All brands logic or top brands) */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 mb-3">{t('shopByBrand')}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {(Array.from(new Set(shopProducts.map(p => p.brand))) as string[])
                                  .filter(b => b && b !== 'Generic') // Filter out empty or Generic
                                  .sort()
                                  .map(brand => {
                                    const img = getEntityImage(brand, p => p.brand === brand);
                                    return (
                                        <GridCard 
                                            key={brand}
                                            title={brand}
                                            image={img}
                                            onClick={() => setSearchTerm(brand)}
                                            isBrand={true}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}

                {/* SUBCATEGORIES */}
                {viewState === 'subcategories' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {subCategories.map(sub => (
                            <GridCard 
                                key={sub.id} 
                                title={sub.display} 
                                image={getEntityImage(sub.id, p => p.category === selectedCategory && p.subCategory === sub.id)}
                                onClick={() => selectSubCategory(sub.id)}
                            />
                        ))}
                    </div>
                )}

                {/* BRANDS */}
                {viewState === 'brands' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {brands.map(brand => (
                            <GridCard 
                                key={brand} 
                                title={brand} 
                                image={getEntityImage(brand, p => p.category === selectedCategory && p.subCategory === selectedSubCategory && p.brand === brand)}
                                onClick={() => selectBrand(brand)}
                            />
                        ))}
                    </div>
                )}

                {/* ITEMS */}
                {viewState === 'items' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2 bg-slate-50 rounded-lg">
                         {filteredItems.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onSelect={() => setSelectedProduct(product)} 
                                t={t}
                                canEdit={canEdit}
                                onEdit={(e) => handleEditClick(e, product)}
                                language={language}
                            />
                        ))}
                    </div>
                )}
            </>
        )}

        {/* Sticky Footer for Cart Total */}
        {cartItemCount > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-400 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-40">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">{t('total')} + {t('vat')}</span>
                        <span className="font-bold text-lg text-primary-700">
                            {t('reviewOrder')}
                        </span>
                    </div>
                    <Button onClick={onProceedToCart} className="shadow-lg">
                        {t('reviewOrder')} ({cartItemCount})
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
};
