import { saveClientDetails } from "@/config/helloApi";
import { LocalStorageEventRegistryInstance } from "@/hooks/CORE/eventHandlers/localStorage/localStorageEventsHandler";
import { setClientInfo, setHelloKeysData } from "@/store/hello/helloSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";


const useHelloLocalStorageEventHandlers = (eventHandler: LocalStorageEventRegistryInstance) => {

    const dispatch = useDispatch()

    const syncDataInRedux = (event: CustomEvent<{ key: string, value: string | boolean }>) => {
        const { key, value } = event.detail;
        dispatch(setHelloKeysData({ [key]: value }))
    }

    const handleClientDataChange = (event: CustomEvent<{ key: string, value: string | boolean }>) => {
        const { value } = event.detail;
        const clientInfo = typeof value === 'string' ? JSON.parse(value) : value
        const clientData = {
            ...clientInfo,
            Name: clientInfo?.name,
            Phonenumber: clientInfo?.number ? `${clientInfo?.country_code}${clientInfo?.number}` : undefined,
            Email: clientInfo?.mail,
            country_code: clientInfo?.country_code,
            number_without_CC: clientInfo?.number,
        }
        delete clientData?.name; delete clientData?.number; delete clientData?.country_code; delete clientData?.mail;
        saveClientDetails(clientData).then((data) => {
            dispatch(setClientInfo({ clientInfo: { name: data?.name, mail: data?.mail, number: data?.number } }))
        })
    }

    useEffect(() => {

        ['k_clientId', 'a_clientId', 'is_anon'].forEach((key) => {
            eventHandler.addEventHandler(key, syncDataInRedux)
        })

        eventHandler.addEventHandler('clientInfo', handleClientDataChange)

    }, [])

    return null
}

export default useHelloLocalStorageEventHandlers;