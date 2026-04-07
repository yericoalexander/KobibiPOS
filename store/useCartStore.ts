import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // productId
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  note?: string;
}

interface CartState {
  items: CartItem[];
  tableNumber: string;
  customerName: string;
  addItem: (item: Omit<CartItem, 'subtotal'>) => void;
  updateQty: (id: string, qty: number) => void;
  updateNote: (id: string, note: string) => void;
  removeItem: (id: string) => void;
  setTableNumber: (num: string) => void;
  setCustomerName: (name: string) => void;
  clearCart: () => void;
  loadCart: (items: CartItem[], customerName: string, tableNumber: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      tableNumber: '',
      customerName: '',
      
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map(i => 
              i.id === item.id 
                ? { ...i, qty: i.qty + item.qty, subtotal: (i.qty + item.qty) * i.price } 
                : i
            )
          };
        }
        return { items: [...state.items, { ...item, subtotal: item.qty * item.qty * 0 + item.qty * item.price }] };
      }),

      updateQty: (id, qty) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, qty, subtotal: qty * i.price } : i)
      })),

      updateNote: (id, note) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, note } : i)
      })),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),

      setTableNumber: (num) => set({ tableNumber: num }),
      setCustomerName: (name) => set({ customerName: name }),

      clearCart: () => set({ items: [], tableNumber: '', customerName: '' }),
      
      loadCart: (items, customerName, tableNumber) => set({ items, customerName, tableNumber }),
    }),
    {
      name: 'pos-cart-store'
    }
  )
);
