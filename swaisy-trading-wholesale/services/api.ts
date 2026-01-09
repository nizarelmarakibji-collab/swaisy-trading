
import { Order, OrderItem, Product, User, OrderStatus, GalleryItem } from '../types';

const saveToStorage = (key: string, data: any) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error("Storage failed", e); }
}

const loadFromStorage = (key: string, defaultVal: any) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch (e) { return defaultVal; }
}

let products: Product[] = loadFromStorage('swaisy_products', []);
let orders: Order[] = loadFromStorage('swaisy_orders', []);
orders = orders.map(o => ({ ...o, createdAt: new Date(o.createdAt) }));
let gallery: GalleryItem[] = loadFromStorage('swaisy_gallery', []);

const networkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getProducts = async (): Promise<Product[]> => {
    await networkDelay(100);
    return products.map(p => {
        const galleryItem = gallery.find(g => g.name.toLowerCase().includes(p.name.toLowerCase()));
        return galleryItem ? { ...p, imageUrl: galleryItem.data } : p;
    });
}

export const setProducts = (newProducts: Product[]) => {
    products = newProducts;
    saveToStorage('swaisy_products', products);
}

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
        products[index] = updatedProduct;
        saveToStorage('swaisy_products', products);
        return updatedProduct;
    }
    throw new Error('Not found');
};

export const getOrders = async (user: User): Promise<Order[]> => {
    await networkDelay(200);
    if (user.role === 'admin') return [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return orders.filter(o => o.createdBy === user.username).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createOrder = async (data: any): Promise<Order> => {
    await networkDelay(300);
    const newOrder: Order = {
        orderId: `SW-${Date.now()}`,
        ...data,
        status: 'pending',
        createdAt: new Date(),
        total: data.items.reduce((acc, i) => acc + i.qty * i.price, 0)
    };
    orders.unshift(newOrder);
    saveToStorage('swaisy_orders', orders);
    return newOrder;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
    const idx = orders.findIndex(o => o.orderId === id);
    orders[idx].status = status;
    saveToStorage('swaisy_orders', orders);
    return orders[idx];
}

export const deleteOrder = async (id: string) => {
    orders = orders.filter(o => o.orderId !== id);
    saveToStorage('swaisy_orders', orders);
}

export const getGallery = async () => [...gallery];
export const addToGallery = async (file: File, name?: string): Promise<GalleryItem> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            const item = { id: `gal-${Date.now()}`, name: name || file.name, data: reader.result as string, type: file.type };
            gallery.push(item);
            saveToStorage('swaisy_gallery', gallery);
            resolve(item);
        };
        reader.readAsDataURL(file);
    });
}
export const deleteFromGallery = async (id: string) => {
    gallery = gallery.filter(g => g.id !== id);
    saveToStorage('swaisy_gallery', gallery);
}
