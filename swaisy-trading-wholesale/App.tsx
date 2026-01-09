
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { OrderList } from './components/OrderList';
import { ProductSelection } from './components/ProductSelection';
import { OrderCart } from './components/OrderCart';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { Inventory } from './components/Inventory';
import { Gallery } from './components/Gallery';
import { Order, DraftOrder, Product, User, OrderStatus, GalleryItem } from './types';
import { getOrders, getProducts, setProducts as apiSetProducts, updateOrderStatus, deleteOrder, updateProduct, createOrder, getGallery } from './services/api';
import { LanguageProvider } from './contexts/LanguageContext';

type AppView = 'shop' | 'cart' | 'recent_orders' | 'admin' | 'inventory' | 'gallery';

const INITIAL_DRAFT_ORDER: DraftOrder = {
  storeName: '',
  phoneNumber: '',
  address: '',
  items: [],
  notes: '',
  discount: 0
};

const initialCSVData = `ITEM NAME,item name ar,desc,desc ar,CATEGORY,category ar,sub category,sub category ar,BRAND,WEIGHT,packaging,unit per pack,min qty,in/out stock,,price,tva,imag,notes
Rice Premium,أرز ممتاز,Long grain rice,أرز حبة طويلة,Grains,حبوب,Rice,أرز,Swaisy,1kg,bag,10,,in,,2.5,0,,
Olive Oil,زيت زيتون,Extra virgin,زيت زيتون بكر,Oils,زيوت,Olive Oil,زيت زيتون,Swaisy,500ml,bottle,12,,in,,8.0,11,,
Tomato Paste,معجون طماطم,Double concentrated,معجون طماطم,Canned,معلبات,Paste,معجون,Swaisy,400g,can,24,,in,,1.2,11,,`;

const initializeProducts = () => {
    const rows = initialCSVData.trim().split('\n').map(l => l.split(','));
    const products: Product[] = rows.slice(1).map((row, i): Product | null => {
        const name = row[0];
        if (!name) return null;
        return {
            id: name.toUpperCase().replace(/\s+/g, '-') + `-${i}`,
            name: name,
            nameAr: row[1] || '',
            description: row[2] || '',
            descriptionAr: row[3] || '',
            category: row[4] || 'Uncategorized',
            categoryAr: row[5] || '',
            subCategory: row[6] || 'N/A',
            subCategoryAr: row[7] || '',
            brand: row[8] || 'Generic',
            weight: row[9] || '',
            packaging: row[10] || '',
            unitPerPack: row[11] || '',
            stockStatus: (row[13] || 'in').toLowerCase(),
            defaultPrice: parseFloat(row[15]) || 0,
            imageUrl: row[17] || `https://picsum.photos/seed/${name}/400`,
            isSpecialOffer: false
        };
    }).filter((p): p is Product => p !== null);
    apiSetProducts(products);
}

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [draftOrder, setDraftOrder] = useState<DraftOrder>(INITIAL_DRAFT_ORDER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([
      { id: 'u1', username: 'admin', password: 'admin', role: 'admin' },
      { id: 'u2', username: 'salesman', password: 'password', role: 'salesman' },
  ]);

  useEffect(() => {
      const init = async () => {
          const currentProducts = await getProducts();
          if (currentProducts.length === 0) {
              initializeProducts();
          } else {
              setProducts(currentProducts);
          }
          fetchGallery();
      };
      init();
  }, []);

  const fetchProducts = () => { getProducts().then(setProducts); };
  const fetchGallery = () => { getGallery().then(setGallery); }

  const refreshOrders = useCallback(async () => {
      if (!user || user.role === 'editor') return;
      setIsLoading(true);
      try {
          const fetchedOrders = await getOrders(user);
          setOrders(fetchedOrders);
      } catch (err) {
          setError('Failed to load orders');
      } finally {
          setIsLoading(false);
      }
  }, [user]);

  useEffect(() => {
      if (currentView === 'recent_orders') refreshOrders();
  }, [currentView, refreshOrders]);

  const handleLogin = (u, p) => {
      const foundUser = users.find(user => user.username === u && user.password === p);
      if (foundUser) {
          setUser(foundUser);
          setCurrentView('shop');
          setLoginError(null);
      } else {
          setLoginError('Invalid credentials');
      }
  };

  const handleLogout = () => {
      setUser(null);
      setDraftOrder(INITIAL_DRAFT_ORDER);
      setCurrentView('shop');
  };

  const handleAddToCart = (product: Product, qty: number) => {
      setDraftOrder(current => {
          const existing = current.items.find(i => i.itemId === product.id);
          let newItems;
          if (existing) {
              newItems = current.items.map(i => i.itemId === product.id ? { ...i, qty: i.qty + qty } : i);
          } else {
              newItems = [...current.items, { itemId: product.id, itemName: product.name, qty, price: product.defaultPrice }];
          }
          return { ...current, items: newItems };
      });
  };

  const handleUpdateDraft = (newDraft: DraftOrder) => { setDraftOrder(newDraft); };

  const handleOrderCreated = () => {
      setDraftOrder(INITIAL_DRAFT_ORDER);
      setCurrentView('recent_orders');
      refreshOrders();
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
      try {
          const updatedOrder = await updateOrderStatus(orderId, status);
          setOrders(prev => prev.map(o => o.orderId === orderId ? updatedOrder : o));
      } catch (e) { alert("Failed to update status"); }
  };

  const handleDeleteOrder = async (orderId: string) => {
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
      try { await deleteOrder(orderId); } catch (e) { alert("Deletion failed"); refreshOrders(); }
  };

  const handleProductUpdate = async (product: Product) => {
      try {
          const updated = await updateProduct(product);
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      } catch (e) { alert("Update failed"); }
  };

  if (!user) return <Login onLogin={handleLogin} error={loginError} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
        <Header 
            user={user} 
            onLogout={handleLogout} 
            currentView={currentView} 
            onNavigate={setCurrentView}
            cartItemCount={draftOrder.items.reduce((acc, i) => acc + i.qty, 0)}
        />
        <main className="container mx-auto px-4 md:px-8 py-6">
            {currentView === 'shop' && (
                <ProductSelection 
                    products={products}
                    gallery={gallery}
                    onProductSelect={handleAddToCart} 
                    onProceedToCart={() => setCurrentView('cart')}
                    cartItemCount={draftOrder.items.reduce((acc, i) => acc + i.qty, 0)}
                    currentUser={user}
                    onProductUpdate={handleProductUpdate}
                />
            )}
            {currentView === 'cart' && (
                <OrderCart 
                    products={products}
                    orderData={draftOrder}
                    onUpdateOrder={handleUpdateDraft}
                    onOrderCreated={handleOrderCreated}
                    onBackToProducts={() => setCurrentView('shop')}
                    currentUser={user}
                />
            )}
            {currentView === 'recent_orders' && (
                <OrderList 
                    orders={orders} 
                    isLoading={isLoading} 
                    error={error} 
                    currentUser={user}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteOrder={handleDeleteOrder}
                    products={products}
                    users={users}
                />
            )}
            {currentView === 'inventory' && (
                <Inventory 
                    products={products}
                    onLoadProducts={(newProds) => { apiSetProducts(newProds); fetchProducts(); }}
                    onProductUpdate={handleProductUpdate}
                    currentUser={user}
                />
            )}
            {currentView === 'gallery' && (
                <Gallery 
                    products={products}
                    gallery={gallery}
                    onGalleryUpdate={() => { fetchProducts(); fetchGallery(); }}
                />
            )}
            {currentView === 'admin' && (
                <AdminDashboard 
                    users={users}
                    currentUser={user}
                    onAddUser={async (userData) => { setUsers([...users, { ...userData, id: `u${Date.now()}` } as User]); }}
                    onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
                    onUpdateUser={(u) => setUsers(users.map(old => old.id === u.id ? u : old))}
                />
            )}
        </main>
    </div>
  );
};

const App = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
);

export default App;
