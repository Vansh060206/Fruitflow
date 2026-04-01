"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load from localStorage (runs once on mount)
    useEffect(() => {
        const savedCart = localStorage.getItem("retailer_cart");
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
        setIsLoaded(true); // Signal that we have finished trying to load
    }, []);

    // 2. Sync to localStorage (runs whenever cartItems changes, BUT only after initial load)
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("retailer_cart", JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded]);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const addMultipleToCart = (products) => {
        setCartItems((prevItems) => {
            const newCart = [...prevItems];
            products.forEach((product) => {
                const existingItemIndex = newCart.findIndex((item) => item.id === product.id);
                if (existingItemIndex > -1) {
                    newCart[existingItemIndex] = {
                        ...newCart[existingItemIndex],
                        quantity: newCart[existingItemIndex].quantity + (product.quantity || 1),
                    };
                } else {
                    newCart.push({ ...product, quantity: product.quantity || 1 });
                }
            });
            return newCart;
        });
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    const value = useMemo(() => ({
        cartItems,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
    }), [cartItems, cartCount, cartTotal]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
