import { Box, BoxProps } from '@mui/material'
import Grid from '../Grid/Grid.tsx'

interface InterfaceBoxProps {
  props: BoxProps | any
  [key: string]: any
}

function InterfaceBox({ props, componentId = '', dragRef = { current: '' }, ingrid = false }: InterfaceBoxProps) {
  return (
    <Box {...props} className='border-1 p-2   h-100 w-100 box-sizing-border-box '>
      <form
        className='nested_grid'
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Grid dragRef={dragRef} ingrid={ingrid} gridId={componentId} />
      </form>
    </Box>
  )
}
export default InterfaceBox
