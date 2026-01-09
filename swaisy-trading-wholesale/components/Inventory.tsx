

import React, { useState } from 'react';
import { Product, User } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DownloadIcon } from './icons/DownloadIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { PencilIcon } from './icons/PencilIcon';
import { XIcon } from './icons/XIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { UploadIcon } from './icons/UploadIcon';

declare const XLSX: any;

const getGoogleDriveImageUrl = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    const fileIdMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
    }
    return null;
};

interface InventoryProps {
  products: Product[];
  onLoadProducts: (products: Product[], isSpecialOfferUpload?: boolean) => void;
  onProductUpdate: (product: Product) => Promise<void>;
  currentUser: User;
}

export const EditProductModal: React.FC<{ product: Product; onClose: () => void; onSave: (p: Product) => void }> = ({ product, onClose, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Product>({ ...product });

    const handleChange = (field: keyof Product, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">{t('editItem')}</h3>
                    <button onClick={onClose}><XIcon className="h-6 w-6 text-slate-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700">Name (En)</label>
                            <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700">Name (Ar)</label>
                            <Input value={formData.nameAr || ''} onChange={e => handleChange('nameAr', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-medium text-slate-700">Category (En)</label>
                            <Input value={formData.category} onChange={e => handleChange('category', e.target.value)} />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-700">Category (Ar)</label>
                            <Input value={formData.categoryAr || ''} onChange={e => handleChange('categoryAr', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-medium text-slate-700">Sub Category (En)</label>
                            <Input value={formData.subCategory} onChange={e => handleChange('subCategory', e.target.value)} />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-700">Sub Category (Ar)</label>
                            <Input value={formData.subCategoryAr || ''} onChange={e => handleChange('subCategoryAr', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Brand</label>
                        <Input value={formData.brand} onChange={e => handleChange('brand', e.target.value)} />
                    </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700">Price</label>
                            <Input type="number" step="0.01" value={formData.defaultPrice} onChange={e => handleChange('defaultPrice', parseFloat(e.target.value))} required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700">Stock Status</label>
                             <select 
                                value={formData.stockStatus} 
                                onChange={e => handleChange('stockStatus', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md text-sm"
                            >
                                <option value="in">In Stock</option>
                                <option value="out">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-700">Weight</label>
                        <Input value={formData.weight} onChange={e => handleChange('weight', e.target.value)} />
                    </div>
                    
                    <div className="flex items-center gap-2 py-2">
                        <input 
                            type="checkbox" 
                            id="isSpecialOffer"
                            checked={!!formData.isSpecialOffer} 
                            onChange={e => handleChange('isSpecialOffer', e.target.checked)}
                            className="h-4 w-4 text-primary-600 rounded"
                        />
                        <label htmlFor="isSpecialOffer" className="text-sm font-medium text-slate-700">Mark as Special Offer</label>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700">Image URL</label>
                        <Input value={formData.imageUrl} onChange={e => handleChange('imageUrl', e.target.value)} />
                         <p className="text-xs text-slate-500 mt-1">URL or leave empty to use /images/{formData.name}.jpg</p>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
                        <Button type="submit">{t('save')}</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export const Inventory: React.FC<InventoryProps> = ({ products, onLoadProducts, onProductUpdate, currentUser }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [specialOfferFile, setSpecialOfferFile] = useState<File | null>(null);
  const [fileMessage, setFileMessage] = useState('');
  const [specialOfferMessage, setSpecialOfferMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

   const processProductData = (dataRows: any[][]): Product[] => {
        if (!dataRows || dataRows.length < 2) return [];
        
        let headerRowIndex = -1;
        
        // Find header row - heuristic: look for 'name' or 'item name' or combination of key fields
        // Increased range to find header
        for(let i=0; i<Math.min(dataRows.length, 20); i++) {
             const row = (dataRows[i] || []).map(c => String(c).toLowerCase().trim());
             
             // Check for key columns presence
             const hasName = row.some(h => h.includes('item name') || h.includes('name') || h.includes('product'));
             const hasCategory = row.some(h => h.includes('category') || h.includes('cat') || h.includes('section'));
             const hasBrand = row.some(h => h.includes('brand') || h.includes('vendor'));
             
             // If we find Name + (Category OR Brand), it's likely the header
             if (hasName && (hasCategory || hasBrand)) {
                 headerRowIndex = i;
                 break;
             }
        }
        
        // Setup Header Map
        let headerMap: Record<string, number> = {};
        
        if (headerRowIndex !== -1) {
            const headers = (dataRows[headerRowIndex] || []).map(h => String(h).trim().toLowerCase());
            const findHeader = (possibleNames: string[]) => headers.findIndex(h => possibleNames.includes(h));

            headerMap = {
                name: findHeader(['item name', 'name', 'product name', 'item', 'product', 'description', 'english name']),
                nameAr: findHeader(['item name ar', 'name ar', 'arabic name', 'name_ar', 'item name (ar)', 'product name ar']),
                price: findHeader(['price', 'selling price', 'unit price', 'cost', 'final price', 'wholesale price']),
                category: findHeader(['category', 'cat', 'main category', 'family', 'section', 'group', 'department']),
                categoryAr: findHeader(['category ar', 'category_ar', 'cat ar', 'category (ar)', 'section ar']),
                subCategory: findHeader(['sub category', 'subcategory', 'sub_category', 'sub-category', 'type', 'subtype']),
                subCategoryAr: findHeader(['sub category ar', 'sub_category_ar', 'subcategory ar', 'sub-category ar']),
                brand: findHeader(['brand', 'brand name', 'vendor', 'manufacturer', 'maker']),
                stock: findHeader(['in/out stock', 'stock', 'status', 'stock status', 'availability', 'quantity', 'qty']),
                image: findHeader(['imag', 'image', 'photo', 'picture', 'image url', 'url', 'img', 'link']),
                desc: findHeader(['desc', 'description', 'details', 'info', 'specification']),
                descAr: findHeader(['desc ar', 'description ar', 'description_ar']),
                weight: findHeader(['weight', 'net weight', 'size', 'gross weight', 'capacity', 'volume', 'vol']),
                packaging: findHeader(['packaging', 'package', 'pack type', 'packing']),
                unitPerPack: findHeader(['unit per pack', 'items per pack', 'qty per pack', 'unit', 'units', 'pieces']),
                notes: findHeader(['notes', 'note', 'remarks', 'comments', 'extra info']),
            };
        } else {
             // Fallback to strict template indices
             headerRowIndex = 0; 
             headerMap = {
                name: 0,
                nameAr: 1,
                desc: 2,
                descAr: 3,
                category: 4,
                categoryAr: 5,
                subCategory: 6,
                subCategoryAr: 7,
                brand: 8,
                weight: 9,
                packaging: 10,
                unitPerPack: 11,
                stock: 13,
                price: 15,
                image: 17,
                notes: 18
            };
        }

        return dataRows.slice(headerRowIndex + 1).map((values, index): Product | null => {
            if (!values || values.length === 0) return null;
            
            const getVal = (idx: number) => {
                if (idx === -1 || idx === undefined || values[idx] === undefined || values[idx] === null) return '';
                return String(values[idx]).trim();
            };

             const name = getVal(headerMap.name);
             if (!name) return null;

             let priceStr = getVal(headerMap.price);
             // Remove currency symbols, keep numbers and decimals
             priceStr = priceStr.replace(/[^0-9.]/g, '');
             let price = parseFloat(priceStr);
             if (isNaN(price)) price = 0;

             let img = getVal(headerMap.image);
             if (!img || img.toLowerCase() === 'undefined' || img.toLowerCase() === 'null') {
                 img = `/images/${name}.jpg`;
             } else if (!img.startsWith('http') && !img.startsWith('data:')) {
                 if (img.includes('.')) {
                    img = `/images/${img}`;
                 } else {
                     img = `/images/${img}.jpg`;
                 }
             }
             
             const gdrive = getGoogleDriveImageUrl(img);

             let stockStatus = getVal(headerMap.stock).toLowerCase();
             if (['yes', 'true', 'in stock', 'available', 'in', 'active', '1'].some(s => stockStatus.includes(s))) stockStatus = 'in';
             else if (['no', 'false', 'out of stock', 'unavailable', 'out', '0', 'inactive'].some(s => stockStatus === s)) stockStatus = 'out';
             else stockStatus = 'in'; // Default to in if ambiguous

             // Combine description and notes if notes exist
             const mainDesc = getVal(headerMap.desc);
             const notes = getVal(headerMap.notes);
             const combinedDesc = [mainDesc, notes].filter(Boolean).join('\n');

             // Ensure hierarchy fields have defaults if missing to preserve navigation structure
             // Clean strings to Title Case for better grouping if english
             const cleanString = (str: string) => str.trim();

             const category = cleanString(getVal(headerMap.category)) || 'Uncategorized';
             const subCategory = cleanString(getVal(headerMap.subCategory)) || 'General';
             const brand = cleanString(getVal(headerMap.brand)) || 'Generic';

            return {
                id: name.toUpperCase().replace(/[^A-Z0-9]/g, '-') + `-${index}`,
                name,
                nameAr: getVal(headerMap.nameAr),
                defaultPrice: price,
                category: category,
                categoryAr: getVal(headerMap.categoryAr),
                subCategory: subCategory,
                subCategoryAr: getVal(headerMap.subCategoryAr),
                brand: brand,
                stockStatus: stockStatus,
                imageUrl: gdrive || img,
                description: combinedDesc,
                descriptionAr: getVal(headerMap.descAr),
                weight: getVal(headerMap.weight),
                packaging: getVal(headerMap.packaging),
                unitPerPack: getVal(headerMap.unitPerPack),
                isSpecialOffer: false 
            }
        }).filter((p): p is Product => p !== null);
   }

  const handleUpload = (selectedFile: File, isSpecialOffer: boolean) => {
    if (!selectedFile) return;

    setFileMessage('');
    setSpecialOfferMessage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        
        // Use XLSX to read array buffer - works for csv, xls, xlsx
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0]; // Take first sheet
        const worksheet = workbook.Sheets[sheetName];
        
        // header: 1 returns array of arrays [["Name", "Price"], ["Item 1", 10]]
        const dataRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        const newProducts = processProductData(dataRows);
        
        if (newProducts.length === 0) {
             throw new Error("No valid products found. Ensure columns 'Name' and 'Price' exist.");
        }

        onLoadProducts(newProducts, isSpecialOffer);
        
        if (isSpecialOffer) {
            setSpecialOfferMessage(`Successfully marked/added ${newProducts.length} special offers.`);
            setSpecialOfferFile(null);
        } else {
            setFileMessage(`Successfully loaded ${newProducts.length} products.`);
            setFile(null);
        }
      } catch (error) {
          console.error(error);
          const msg = `Error: ${error.message}`;
          if (isSpecialOffer) setSpecialOfferMessage(msg);
          else setFileMessage(msg);
      }
    };
    reader.onerror = () => {
        const msg = "Failed to read file";
        if (isSpecialOffer) setSpecialOfferMessage(msg);
        else setFileMessage(msg);
    }
    reader.readAsArrayBuffer(selectedFile);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.nameAr && p.nameAr.includes(searchTerm)));

  return (
      <div className="space-y-6">
          {editingProduct && (
              <EditProductModal 
                product={editingProduct} 
                onClose={() => setEditingProduct(null)}
                onSave={async (p) => { await onProductUpdate(p); setEditingProduct(null); }}
              />
          )}

          <Card>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800">{t('inventory')}</h2>
                      <p className="text-slate-500 text-sm">{t('uploadInstruction')}</p>
                  </div>
                  <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                          const ws = XLSX.utils.json_to_sheet(products.map(p => {
                              // Split description to separate notes if they were combined
                              const parts = p.description ? p.description.split('\n') : [];
                              const mainDesc = parts[0] || '';
                              const noteText = parts.slice(1).join('\n') || '';

                              return {
                                  'ITEM NAME': p.name,
                                  'item name ar': p.nameAr,
                                  'desc': mainDesc,
                                  'notes': noteText,
                                  'desc ar': p.descriptionAr,
                                  'CATEGORY': p.category,
                                  'category ar': p.categoryAr,
                                  'sub category': p.subCategory,
                                  'sub category ar': p.subCategoryAr,
                                  'BRAND': p.brand,
                                  'weight': p.weight,
                                  'price': p.defaultPrice,
                                  'in/out stock': p.stockStatus,
                                  'imag': p.imageUrl,
                                  'packaging': p.packaging,
                                  'unit per pack': p.unitPerPack,
                                  'special offer': p.isSpecialOffer ? 'Yes' : 'No'
                              };
                          }));
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, "Products");
                          XLSX.writeFile(wb, "swaisy_products.xlsx");
                      }}>
                          <DownloadIcon className="h-4 w-4 mr-2" />
                          {t('downloadCatalog')}
                      </Button>
                  </div>
               </div>

               {/* Main Catalog Upload */}
               <div className="border-b pb-6 mb-6">
                   <h3 className="font-semibold text-lg mb-3">{t('productCatalog')}</h3>
                   <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-grow w-full">
                          <label className="block text-sm font-medium text-slate-700 mb-1">{t('uploadProducts')} (Excel/CSV)</label>
                          <input 
                              type="file" 
                              accept=".csv, .xlsx, .xls" 
                              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                          />
                      </div>
                      <Button onClick={() => file && handleUpload(file, false)} disabled={!file}>
                          {t('uploadButton')}
                      </Button>
                   </div>
                   {fileMessage && (
                       <p className={`mt-2 text-sm ${fileMessage.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
                           {fileMessage}
                       </p>
                   )}
               </div>

               {/* Special Offers Upload */}
               <div className="border-b pb-6">
                   <h3 className="font-semibold text-lg mb-3 text-rose-600">{t('uploadSpecialOffers')}</h3>
                   <p className="text-xs text-slate-500 mb-3">{t('uploadSpecialOffersNote')}</p>
                   <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-grow w-full">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Upload Special Offer Items (Excel/CSV)</label>
                          <input 
                              type="file" 
                              accept=".csv, .xlsx, .xls" 
                              onChange={(e) => setSpecialOfferFile(e.target.files ? e.target.files[0] : null)}
                              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                          />
                      </div>
                      <Button 
                        onClick={() => specialOfferFile && handleUpload(specialOfferFile, true)} 
                        disabled={!specialOfferFile}
                        className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
                      >
                          <UploadIcon className="h-4 w-4 mr-2" />
                          Update Specials
                      </Button>
                   </div>
                   {specialOfferMessage && (
                       <p className={`mt-2 text-sm ${specialOfferMessage.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
                           {specialOfferMessage}
                       </p>
                   )}
               </div>

               <div className="bg-blue-50 p-4 rounded-md mt-4 border border-blue-100">
                   <h4 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                       <ExclamationTriangleIcon className="h-4 w-4" />
                       {t('importantNote')}
                   </h4>
                   <p className="text-xs text-blue-700">
                       {t('imageUploadNote')}
                   </p>
               </div>
          </Card>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b flex items-center gap-4">
                  <h3 className="font-bold text-lg">{t('productCatalog')} ({products.length})</h3>
                  <Input 
                      placeholder={t('searchPlaceholder')} 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="max-w-xs"
                  />
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                          <tr>
                              <th className="p-3">{t('image')}</th>
                              <th className="p-3">{t('edit')}</th>
                              <th className="p-3">Name</th>
                              <th className="p-3">{t('category')}</th>
                              <th className="p-3">{t('subCategory')}</th>
                              <th className="p-3">{t('brand')}</th>
                              <th className="p-3">{t('weight')}</th>
                              <th className="p-3">{t('price')}</th>
                              <th className="p-3">{t('status')}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredProducts.slice(0, 100).map(p => (
                              <tr key={p.id} className={`hover:bg-slate-50 ${p.isSpecialOffer ? 'bg-rose-50 hover:bg-rose-100' : ''}`}>
                                  <td className="p-3">
                                      <img src={p.imageUrl} alt="" className="h-10 w-10 rounded object-cover border" referrerPolicy="no-referrer" />
                                  </td>
                                  <td className="p-3">
                                      <button 
                                          onClick={() => setEditingProduct(p)}
                                          className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                                      >
                                          <PencilIcon className="h-4 w-4" />
                                      </button>
                                  </td>
                                  <td className="p-3">
                                      <div className="font-medium text-slate-800 flex items-center gap-2">
                                          {p.name}
                                          {p.isSpecialOffer && <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] rounded font-bold">SALE</span>}
                                      </div>
                                      {p.nameAr && <div className="text-xs text-slate-500">{p.nameAr}</div>}
                                  </td>
                                  <td className="p-3">
                                      <div>{p.category}</div>
                                      {p.categoryAr && <div className="text-xs text-slate-500">{p.categoryAr}</div>}
                                  </td>
                                  <td className="p-3">
                                      <div className="text-slate-600">{p.subCategory}</div>
                                      {p.subCategoryAr && <div className="text-xs text-slate-500">{p.subCategoryAr}</div>}
                                  </td>
                                  <td className="p-3 font-medium text-slate-700">{p.brand}</td>
                                  <td className="p-3">{p.weight}</td>
                                  <td className="p-3">${p.defaultPrice.toFixed(2)}</td>
                                  <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.stockStatus === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                          {p.stockStatus === 'in' ? 'In Stock' : 'Out'}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                          {filteredProducts.length === 0 && (
                              <tr>
                                  <td colSpan={9} className="p-8 text-center text-slate-500">
                                      No products found.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
                  {filteredProducts.length > 100 && (
                      <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 border-t">
                          Showing first 100 results. Use search to find specific items.
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
};
