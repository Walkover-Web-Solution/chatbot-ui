import { addInterfaceContext } from '@/store/interface/interfaceSlice'
import { Box } from '@mui/material'
import React from 'react'
import { useDispatch } from 'react-redux'

interface InterfaceDatePickerProps {
  props: any
  gridId: string
  componentId: string
}
function Interfacedatepicker({ props, gridId, componentId }: InterfaceDatePickerProps) {
  const dispatch = useDispatch()
  const [selectedDate, setSelectedDate] = React.useState('')

  const handleDateChange = (e) => {
    const { value } = e.target
    setSelectedDate(value)
    debouncedDispatch(value)
  }
  const debouncedDispatch = (value: string) => {
    let timeoutId: NodeJS.Timeout;
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dispatch(addInterfaceContext({ gridId, componentId, value }));
        resolve(true);
      }, 400);
    });
  };

  return (
    <Box className='w-100 h-100 flex-center-center'>
      <input
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        type='date'
        {...props}
        value={selectedDate}
        onChange={handleDateChange}
      />
    </Box>
  )
}

export default Interfacedatepicker
