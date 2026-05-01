import { addInterfaceContext } from '@/store/interface/interfaceSlice'
import { Select, MenuItem, SelectProps, FormControl, InputLabel, SelectChangeEvent } from '@mui/material'
import debounce from 'lodash.debounce'
import { useDispatch } from 'react-redux'

interface InterfaceDropdownProps {
  props: SelectProps
  gridId: string
  componentId: string
  inpreview: boolean
}

function InterfaceDropdown({ props, gridId, componentId, inpreview }: InterfaceDropdownProps) {
  const dispatch = useDispatch()

  const debouncedDispatch = debounce((value) => {
    dispatch(addInterfaceContext({ gridId, componentId, value }))
  }, 400)

  const handleChange = (e: SelectChangeEvent) => {
    const { value } = e.target
    debouncedDispatch(value)
  }

  return (
    <FormControl fullWidth>
      <InputLabel id='demo-simple-select-label'>{props?.label}</InputLabel>
      <Select
        {...props}
        labelId='demo-simple-select-label'
        defaultValue={typeof props?.options[0] === 'object' ? props?.options[0]?.value : props?.options[0] || 'Dropdown'}
        fullWidth
        className='h-100'
        onChange={handleChange}
        readOnly={!inpreview}
        data-testid={`chatbot-interface-dropdown-${componentId || 'default'}`}
      >
        {props?.options?.length > 0 ? (
          props?.options?.map((option: any, index: number) => {
            const optionValue = typeof option === 'object' && option !== null ? option.value : option
            const optionLabel = typeof option === 'object' && option !== null ? option.label : option
            return (
              <MenuItem key={`${optionValue}-${index}`} value={optionValue}>
                {optionLabel}
              </MenuItem>
            )
          })
        ) : (
          <MenuItem key='Dropdown' value='Dropdown'>
            Dropdown
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )
}

export default InterfaceDropdown
