import React from 'react'
import { Link, LinkProps } from '@mui/material'

interface InterfaceLinkProps {
  props: LinkProps
}

function InterfaceLink({ props }: InterfaceLinkProps) {
  return <Link {...props} data-testid="chatbot-interface-link" />
}

export default InterfaceLink
