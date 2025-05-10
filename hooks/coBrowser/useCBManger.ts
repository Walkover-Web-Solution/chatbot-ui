import { $ReduxCoreType } from '@/types/reduxCore'
import { useCustomSelector } from '@/utils/deepCheckSelector'
import { OpenInFull } from '@mui/icons-material'
import React, { useEffect } from 'react'
import { CBManger } from './CBManger'

function useCBManger() {
    const {a_clientId , k_clientId} = useCustomSelector((state:$ReduxCoreType)=>({
        a_clientId : state.Hello.a_clientId,
        k_clientId : state.Hello.k_clientId
    }))
    useEffect(()=>{
        if(!a_clientId && !k_clientId) return
        CBManger.updateDeviceId(k_clientId || a_clientId)

    },[a_clientId,k_clientId])
}

export default useCBManger