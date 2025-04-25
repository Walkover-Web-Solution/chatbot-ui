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
        defaultValue={props?.options[0] || 'Dropdown'}
        fullWidth
        className='h-100'
        onChange={handleChange}
        readOnly={!inpreview}
      >
        {props?.options?.length > 0 ? (
          props?.options?.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))
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
