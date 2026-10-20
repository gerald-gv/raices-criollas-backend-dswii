import { useMemo, useSyncExternalStore } from "react";

export type Cantidades = Record<number, number>;

interface CartState {
    cantidades: Cantidades;
    ready: boolean;
}

const EMPTY: CartState = { cantidades: {}, ready: false };

let state: CartState = EMPTY;
const listeners = new Set<() => void>();

const set = (next: CartState) => {
    state = next;
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const MAX_POR_PLATO = 99;

export const cart = {
    isReady: () => state.ready,

    // Reemplaza todo con lo que dice el servidor
    load(items: { platoId: number; cantidad: number }[]) {
        set({ cantidades: Object.fromEntries(items.map((i) => [i.platoId, i.cantidad])), ready: true });
    },

    // Cierre de sesion
    reset() {
        if (state !== EMPTY) set(EMPTY);
    },

    add(platoId: number, delta = 1) {
        const nueva = Math.min(Math.max((state.cantidades[platoId] ?? 0) + delta, 0), MAX_POR_PLATO);
        cart.set(platoId, nueva);
    },

    // Fija la cantidad exacta, con 0 el plato sale del carrito
    set(platoId: number, cantidad: number) {
        const cantidades = { ...state.cantidades };
        if (cantidad > 0) cantidades[platoId] = cantidad;
        else delete cantidades[platoId];
        set({ ...state, cantidades });
    },

    clear() {
        set({ ...state, cantidades: {} });
    },
};

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

export const useCartState = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

// Total de unidades para la bolsa del Header
export const useCartCount = () => {
    const { cantidades } = useCartState();
    return useMemo(() => Object.values(cantidades).reduce((suma, n) => suma + n, 0), [cantidades]);
};
