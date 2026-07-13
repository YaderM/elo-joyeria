import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // 1. Inicializamos el estado leyendo desde localStorage
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // 2. Sincronizamos con localStorage cada vez que 'cart' cambia
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find(item => item.id_producto === product.id_producto);
            if (existingProduct) {
                return prevCart.map(item =>
                    item.id_producto === product.id_producto 
                        ? { ...item, cantidad: item.cantidad + quantity } 
                        : item
                );
            }
            return [...prevCart, { ...product, cantidad: quantity }];
        });
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id_producto !== id));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);