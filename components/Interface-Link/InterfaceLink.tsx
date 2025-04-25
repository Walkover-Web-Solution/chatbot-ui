import React from 'react'
import { Link, LinkProps } from '@mui/material'

interface InterfaceLinkProps {
  props: LinkProps
}

function InterfaceLink({ props }: InterfaceLinkProps) {
  return <Link {...props} />
}

export default InterfaceLink
