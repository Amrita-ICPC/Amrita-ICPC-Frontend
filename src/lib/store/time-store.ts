import { Store } from "@tanstack/react-store";

export const timeStore = new Store({
    serverDelta: 0,
});

export const updateServerDelta = (serverTimestamp: number) => {
    const delta = serverTimestamp - Date.now();
    timeStore.setState((state) => ({
        ...state,
        serverDelta: delta,
    }));
};

export const getServerTime = () => {
    return Date.now() + timeStore.state.serverDelta;
};
