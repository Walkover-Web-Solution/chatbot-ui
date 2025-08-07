import { LocalStorageEventRegistryInstance } from "@/hooks/CORE/eventHandlers/localStorage/localStorageEventsHandler";
import { setHelloKeysData } from "@/store/hello/helloSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";


const useHelloLocalStorageEventHandlers = (eventHandler: LocalStorageEventRegistryInstance) => {

    const dispatch = useDispatch()

    const syncDataInRedux = (event: CustomEvent<{ key: string, value: string | boolean }>) => {
        const { key, value } = event.detail;
        dispatch(setHelloKeysData({ [key]: value }))
    }

    useEffect(() => {

        ['k_clientId', 'a_clientId'].forEach((key) => {
            eventHandler.addEventHandler(key, syncDataInRedux)
        })
        
    }, [])

    return null
}

export default useHelloLocalStorageEventHandlers;