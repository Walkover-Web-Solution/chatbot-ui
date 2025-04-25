interface InterfaceIconProps {
  props: any
}
function InterfaceIcon({ props }: InterfaceIconProps) {
  return <img className='h-100 w-100' alt='Remy Sharp' {...props} style={{ objectFit: 'contain' }} />
}

export default InterfaceIcon
