'use client';

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setHelloKeysData } from "@/store/hello/helloSlice";

const useLocalStorageEventHandler = () => {
    const dispatch = useDispatch()

    const handleStorageUpdate = (e: CustomEvent<{ key: string, value: string | boolean }>) => {
        if (e.detail.key === 'k_clientId' || e.detail.key === 'a_clientId') {
            dispatch(setHelloKeysData({ [e.detail.key]: e.detail.value }))
        }
        if (e.detail.key === 'is_anon') {
            dispatch(setHelloKeysData({ is_anon: e.detail.value }));
        }
    };


    useEffect(() => {

        window.addEventListener("localstorage-updated", handleStorageUpdate);
        
        return () => {
            window.removeEventListener("localstorage-updated", handleStorageUpdate);
        };

    }, [handleStorageUpdate]);

    return null
}

export default useLocalStorageEventHandler;
