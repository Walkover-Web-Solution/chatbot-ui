import React from 'react'
import { Box, Typography } from '@mui/material'

function InterfaceErrorPage() {
  return (
    <Box data-testid="chatbot-interface-error-page">
      <Typography className='text-center'>Interface: Your session has expired.</Typography>
      <Typography>Please refresh the page, and if the issue persists, kindly reach out to our support team.</Typography>
    </Box>
  )
}

export default InterfaceErrorPage
