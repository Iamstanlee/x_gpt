import {useState} from "react";

const useStorage = <T>(key: string, initialValue?: T) => {
    const [storedValue, setStoredValue] = useState<T | undefined>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const saveLocally = (value: T) => {
        window.localStorage.setItem(key, JSON.stringify(value));
        setStoredValue(value);
    }

    const clear = () => {
        window.localStorage.clear();
        setStoredValue(undefined);
    };

    return {
        storedValue,
        saveLocally,
        clear,
    }
}

export default useStorage;