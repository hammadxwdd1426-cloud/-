import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  RestaurantProfile,
  DEFAULT_RESTAURANT_PROFILE,
  MenuCategory,
  MenuItem,
  Order
} from '../types';

const RESTAURANT_DOC_ID = 'main';

// RESTAURANT PROFILE
export async function getRestaurantProfile(): Promise<RestaurantProfile> {
  try {
    const docRef = doc(db, 'restaurants', RESTAURANT_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_RESTAURANT_PROFILE, ...(snap.data() as RestaurantProfile) };
    } else {
      // First-time initialization
      await setDoc(docRef, DEFAULT_RESTAURANT_PROFILE);
      return DEFAULT_RESTAURANT_PROFILE;
    }
  } catch (error) {
    console.error('Error fetching restaurant profile:', error);
    return DEFAULT_RESTAURANT_PROFILE;
  }
}

export function subscribeRestaurantProfile(callback: (profile: RestaurantProfile) => void) {
  const docRef = doc(db, 'restaurants', RESTAURANT_DOC_ID);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback({ ...DEFAULT_RESTAURANT_PROFILE, ...(snap.data() as RestaurantProfile) });
    } else {
      callback(DEFAULT_RESTAURANT_PROFILE);
    }
  }, (err) => {
    console.error('Snapshot error for restaurant profile:', err);
    callback(DEFAULT_RESTAURANT_PROFILE);
  });
}

export async function updateRestaurantProfile(profile: Partial<RestaurantProfile>): Promise<void> {
  const docRef = doc(db, 'restaurants', RESTAURANT_DOC_ID);
  await setDoc(docRef, profile, { merge: true });
}

// MENU CATEGORIES
export function subscribeCategories(callback: (categories: MenuCategory[]) => void) {
  const q = query(collection(db, 'menuCategories'), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const categories: MenuCategory[] = [];
    snapshot.forEach((d) => {
      categories.push({ id: d.id, ...d.data() } as MenuCategory);
    });
    callback(categories);
  }, (err) => {
    console.error('Categories subscription error:', err);
    callback([]);
  });
}

export async function addCategory(category: Omit<MenuCategory, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'menuCategories'), category);
  return ref.id;
}

export async function updateCategory(id: string, updates: Partial<MenuCategory>): Promise<void> {
  const docRef = doc(db, 'menuCategories', id);
  await updateDoc(docRef, updates);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'menuCategories', id));
}

// MENU ITEMS
export function subscribeMenuItems(callback: (items: MenuItem[]) => void) {
  const q = query(collection(db, 'menuItems'), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const items: MenuItem[] = [];
    snapshot.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as MenuItem);
    });
    callback(items);
  }, (err) => {
    console.error('MenuItems subscription error:', err);
    callback([]);
  });
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'menuItems'), item);
  return ref.id;
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
  const docRef = doc(db, 'menuItems', id);
  await updateDoc(docRef, updates);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'menuItems', id));
}

// ORDERS
export function subscribeOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((d) => {
      orders.push({ id: d.id, ...d.data() } as Order);
    });
    callback(orders);
  }, (err) => {
    console.error('Orders subscription error:', err);
    callback([]);
  });
}

export async function saveOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
  const ref = await addDoc(collection(db, 'orders'), orderData);
  return { id: ref.id, ...orderData };
}

export async function fetchOrdersByPhone(phone: string): Promise<Order[]> {
  try {
    const trimmed = phone.trim();
    if (!trimmed) return [];
    
    // Query orders matching customer phone, sorted by creation date descending
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const results: Order[] = [];
    snap.forEach((d) => {
      const data = d.data();
      // Match phone directly or normalized
      if (
        data.customerPhone?.replace(/\s+/g, '') === trimmed.replace(/\s+/g, '') ||
        data.customerPhone?.endsWith(trimmed.slice(-8))
      ) {
        results.push({ ...(data as Omit<Order, 'id'>), id: d.id });
      }
    });
    return results;
  } catch (error) {
    console.error('Error fetching orders by phone:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, { status });
}
