import { Injectable, signal, computed } from '@angular/core';
import { Cart, CartItem } from '../../shared/models/cart.model';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private readonly CART_STORAGE_KEY = 'smm_cart_';

    // Signal to hold cart items
    private cartSignal = signal<CartItem[]>([]);

    // Computed signals
    items = computed(() => this.cartSignal());
    itemCount = computed(() => this.cartSignal().reduce((sum, item) => sum + item.quantity, 0));
    total = computed(() => this.cartSignal().reduce((sum, item) => sum + (item.rate * item.quantity / 1000), 0));

    constructor() {
        this.loadCart();
    }

    /**
     * Get the current user ID from localStorage
     */
    private getCurrentUserId(): string {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.id || userData._id || 'guest';
            } catch (e) {
                return 'guest';
            }
        }
        return 'guest';
    }

    /**
     * Get the storage key for the current user
     */
    private getStorageKey(): string {
        const userId = this.getCurrentUserId();
        return `${this.CART_STORAGE_KEY}${userId}`;
    }

    /**
     * Load cart from localStorage for current user
     */
    private loadCart(): void {
        try {
            const storageKey = this.getStorageKey();
            const cartData = localStorage.getItem(storageKey);
            if (cartData) {
                const cart: Cart = JSON.parse(cartData);
                this.cartSignal.set(cart.items || []);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.cartSignal.set([]);
        }
    }

    /**
     * Save cart to localStorage for current user
     */
    private saveCart(): void {
        try {
            const userId = this.getCurrentUserId();
            const cart: Cart = {
                userId,
                items: this.cartSignal(),
                total: this.total(),
                itemCount: this.itemCount(),
            };
            const storageKey = this.getStorageKey();
            localStorage.setItem(storageKey, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    /**
     * Add item to cart
     */
    addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
        const currentItems = this.cartSignal();
        const existingItemIndex = currentItems.findIndex(
            (i) => i.serviceId === item.serviceId
        );

        if (existingItemIndex > -1) {
            // Item exists, update quantity
            const updatedItems = [...currentItems];
            const newQuantity = updatedItems[existingItemIndex].quantity + (item.quantity || item.min);
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: Math.min(newQuantity, item.max),
            };
            this.cartSignal.set(updatedItems);
        } else {
            // New item, add to cart
            const newItem: CartItem = {
                ...item,
                quantity: item.quantity || item.min,
            };
            this.cartSignal.set([...currentItems, newItem]);
        }

        this.saveCart();
    }

    /**
     * Remove item from cart
     */
    removeItem(serviceId: number): void {
        const currentItems = this.cartSignal();
        const updatedItems = currentItems.filter((item) => item.serviceId !== serviceId);
        this.cartSignal.set(updatedItems);
        this.saveCart();
    }

    /**
     * Update item quantity
     */
    updateQuantity(serviceId: number, quantity: number): void {
        const currentItems = this.cartSignal();
        const itemIndex = currentItems.findIndex((i) => i.serviceId === serviceId);

        if (itemIndex > -1) {
            const updatedItems = [...currentItems];
            const item = updatedItems[itemIndex];

            // Ensure quantity is within min/max bounds
            const newQuantity = Math.max(item.min, Math.min(quantity, item.max));

            updatedItems[itemIndex] = {
                ...item,
                quantity: newQuantity,
            };

            this.cartSignal.set(updatedItems);
            this.saveCart();
        }
    }

    /**
     * Increase item quantity
     */
    increaseQuantity(serviceId: number, step: number = 100): void {
        const currentItems = this.cartSignal();
        const item = currentItems.find((i) => i.serviceId === serviceId);

        if (item) {
            const newQuantity = item.quantity + step;
            this.updateQuantity(serviceId, newQuantity);
        }
    }

    /**
     * Decrease item quantity
     */
    decreaseQuantity(serviceId: number, step: number = 100): void {
        const currentItems = this.cartSignal();
        const item = currentItems.find((i) => i.serviceId === serviceId);

        if (item) {
            const newQuantity = item.quantity - step;
            this.updateQuantity(serviceId, newQuantity);
        }
    }

    /**
     * Clear all items from cart
     */
    clearCart(): void {
        this.cartSignal.set([]);
        this.saveCart();
    }

    /**
     * Get item by service ID
     */
    getItem(serviceId: number): CartItem | undefined {
        return this.cartSignal().find((item) => item.serviceId === serviceId);
    }

    /**
     * Check if item is in cart
     */
    isInCart(serviceId: number): boolean {
        return this.cartSignal().some((item) => item.serviceId === serviceId);
    }

    /**
     * Calculate total for a specific item
     */
    getItemTotal(item: CartItem): number {
        return (item.rate * item.quantity) / 1000;
    }
}
