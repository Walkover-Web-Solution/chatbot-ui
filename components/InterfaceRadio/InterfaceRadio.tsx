import { addInterfaceContext } from '@/store/interface/interfaceSlice'
import { Box, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { useDispatch } from 'react-redux'

interface InterfaeRadioProps {
  props: any
  gridId: string
  componentId: string
}

function InterfaceRadio({ props, gridId, componentId }: InterfaeRadioProps) {
  const dispatch = useDispatch()

  const debouncedDispatch = (() => {
    let timeoutId: any;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dispatch(addInterfaceContext({ gridId, componentId, value }));
      }, 400);
    };
  })();

  const handleChange = (e: any) => {
    const { value } = e.target
    debouncedDispatch(value)
  }
  return (
    <Box className='w-100 h-100 flex-center-center p-2 box-sizing-border-box'>
      <FormControl fullWidth>
        <RadioGroup {...props} defaultValue={typeof props?.options[0] === 'object' ? props?.options[0]?.value : props?.options[0] || ''} onChange={handleChange} data-testid={`chatbot-interface-radio-${componentId || 'default'}`}>
          {props?.options.map((option: any, index: number) => {
            const optionValue = typeof option === 'object' && option !== null ? option.value : option
            const optionLabel = typeof option === 'object' && option !== null ? option.label : option
            return (
              <FormControlLabel key={`${optionValue}-${index}`} value={optionValue} control={<Radio onMouseDown={(e) => e.stopPropagation()} />} label={optionLabel} />
            )
          })}
        </RadioGroup>
      </FormControl>
    </Box>
  )
}

export default InterfaceRadio
