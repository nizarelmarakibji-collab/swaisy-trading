

import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { addToGallery, deleteFromGallery } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Product, GalleryItem } from '../types';

interface GalleryProps {
    onGalleryUpdate: () => void;
    products: Product[];
    gallery: GalleryItem[];
}

export const Gallery: React.FC<GalleryProps> = ({ onGalleryUpdate, products, gallery }) => {
    const { t } = useLanguage();
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

    const [targetUploadName, setTargetUploadName] = useState<string | null>(null);
    const hiddenFileInput = useRef<HTMLInputElement>(null);

    // Derive categories, subcategories, and brands
    const categories = Array.from(new Set(products.map(p => p.category))).filter(c => c !== 'Special Offers').sort() as string[];
    const subCategories = Array.from(new Set(products.map(p => p.subCategory))).filter(c => c && c !== 'N/A').sort() as string[];
    const brands = Array.from(new Set(products.map(p => p.brand))).filter(b => b && b !== 'Generic').sort() as string[];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        setUploading(true);
        try {
            const files = Array.from(e.target.files) as File[];
            for (const file of files) {
                if (targetUploadName) {
                     // Logic for replacing category/subcategory/brand image
                     // 1. Delete existing matching image
                     const normalized = targetUploadName.toLowerCase();
                     const toDelete = gallery.filter(g => {
                        const gName = g.name.toLowerCase();
                        if (gName === normalized) return true;
                        const lastDot = gName.lastIndexOf('.');
                        if (lastDot !== -1 && gName.substring(0, lastDot) === normalized) return true;
                        return false;
                     });
                     for (const item of toDelete) await deleteFromGallery(item.id);

                     // 2. Upload new with correct name
                     const ext = file.name.split('.').pop();
                     const finalName = `${targetUploadName}.${ext}`;
                     await addToGallery(file, finalName);
                } else {
                    // Standard product upload
                    await addToGallery(file);
                }
            }
            onGalleryUpdate(); 
        } catch (err) {
            alert("Failed to upload image");
        } finally {
            setUploading(false);
            setTargetUploadName(null);
            e.target.value = '';
        }
    };

    const triggerCategoryUpload = (name: string) => {
        setTargetUploadName(name);
        hiddenFileInput.current?.click();
    }

    const handleDelete = async (id: string) => {
        if(!window.confirm(t('deleteUserConfirm'))) return; 
        try {
            await deleteFromGallery(id);
            onGalleryUpdate();
        } catch (err) {
            alert("Failed to delete image");
        }
    };

    const getEntityImage = (name: string) => {
        const normalizedName = name.trim().toLowerCase();
        return gallery.find(g => {
            const gName = g.name.toLowerCase();
            if (gName === normalizedName) return true;
            const lastDot = gName.lastIndexOf('.');
            if (lastDot !== -1 && gName.substring(0, lastDot) === normalizedName) return true;
            return false;
        });
    }

    return (
        <div className="space-y-6">
             {/* Hidden Input for specific uploads */}
             <input 
                type="file" 
                accept="image/*" 
                ref={hiddenFileInput}
                onChange={handleFileUpload}
                className="hidden"
            />

            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{t('gallery')}</h2>
                        <p className="text-slate-500 text-sm">{t('gallerySubtitle')}</p>
                    </div>
                    
                    {/* Tabs */}
                    <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                        <button 
                            onClick={() => setActiveTab('products')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'products' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                        >
                            Product Images
                        </button>
                        <button 
                            onClick={() => setActiveTab('categories')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'categories' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                        >
                            Categories, Subcats & Brands
                        </button>
                    </div>
                </div>

                {activeTab === 'products' && (
                    <>
                         <div className="mb-4 flex justify-end">
                             <div className="relative inline-block">
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={uploading}
                                />
                                <Button disabled={uploading}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    {uploading ? t('uploading') : t('uploadImages')}
                                </Button>
                             </div>
                         </div>
                        {gallery.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                                <p className="text-slate-500">{t('noImagesInGallery')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {gallery.map(img => (
                                    <div key={img.id} className="group relative bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all">
                                        <div className="aspect-square bg-slate-100 relative">
                                            <img src={img.data} alt={img.name} className="w-full h-full object-contain p-2" />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                                            <button 
                                                onClick={() => handleDelete(img.id)}
                                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                                title={t('delete')}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="p-2 border-t bg-slate-50">
                                            <p className="text-xs font-medium text-slate-700 truncate text-center" title={img.name}>
                                                {img.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-8">
                        {/* Categories */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">{t('categories')}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {categories.map(cat => {
                                    const img = getEntityImage(cat);
                                    return (
                                        <div key={cat} className="bg-white border rounded-lg shadow-sm p-3 flex flex-col items-center">
                                            <div className="w-20 h-20 mb-3 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center border">
                                                {img ? (
                                                    <img src={img.data} alt={cat} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl font-bold text-slate-300">{cat.charAt(0)}</span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold text-sm text-slate-800 text-center mb-2 h-10 flex items-center justify-center">{cat}</h4>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="w-full text-xs"
                                                onClick={() => triggerCategoryUpload(cat)}
                                                disabled={uploading}
                                            >
                                                {img ? 'Replace' : 'Upload'}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Sub Categories */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">{t('subCategory')}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {subCategories.map(sub => {
                                    const img = getEntityImage(sub);
                                    return (
                                        <div key={sub} className="bg-white border rounded-lg shadow-sm p-3 flex flex-col items-center">
                                            <div className="w-20 h-20 mb-3 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center border">
                                                {img ? (
                                                    <img src={img.data} alt={sub} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl font-bold text-slate-300">{sub.charAt(0)}</span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold text-sm text-slate-800 text-center mb-2 h-10 flex items-center justify-center">{sub}</h4>
                                             <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="w-full text-xs"
                                                onClick={() => triggerCategoryUpload(sub)}
                                                disabled={uploading}
                                            >
                                                {img ? 'Replace' : 'Upload'}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Brands */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">{t('brand')}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {brands.map(brand => {
                                    const img = getEntityImage(brand);
                                    return (
                                        <div key={brand} className="bg-white border rounded-lg shadow-sm p-3 flex flex-col items-center">
                                            <div className="w-20 h-20 mb-3 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center border">
                                                {img ? (
                                                    <img src={img.data} alt={brand} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl font-bold text-slate-300">{brand.charAt(0)}</span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold text-sm text-slate-800 text-center mb-2 h-10 flex items-center justify-center">{brand}</h4>
                                             <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="w-full text-xs"
                                                onClick={() => triggerCategoryUpload(brand)}
                                                disabled={uploading}
                                            >
                                                {img ? 'Replace' : 'Upload'}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}
            </Card>
        </div>
    );
};