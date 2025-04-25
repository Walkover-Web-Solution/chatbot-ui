import React from 'react'
import { Divider, DividerProps } from '@mui/material'

interface InterfaceDividerProps {
  props: DividerProps
}

function InterfaceDivider({ props }: InterfaceDividerProps) {
  return <Divider {...props} variant='fullWidth' orientation={props?.type || 'horizontal'} className='h-100' />
}

export default InterfaceDivider
