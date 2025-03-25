import { Box } from '@mui/material'
import Grid from '../Grid/Grid.tsx'
import './InterfaceForm.css'

export default function InterfaceForm({ props, componentId = '', dragRef = { current: '' }, ingrid = false }) {
  return (
    <Box className={`${ingrid ? 'interface-chatbot' : ''} p-3 h-100 w-100 box-sizing-border-box interface-form `} {...props}>
      <form
        className='nested_grid'
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Grid dragRef={dragRef} ingrid={ingrid} gridId={componentId} loadInterface={false} />
      </form>
    </Box>
  )
}
