import React from 'react'
import { useDispatch } from 'react-redux'
import { Accordion, AccordionActionsProps, AccordionDetails, AccordionDetailsProps, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { addInterfaceContext } from '@/store/interface/interfaceSlice'

interface InterfaceAccordionProps {
  props: AccordionActionsProps | AccordionDetailsProps | any
  gridId: string
  componentId: string
}

function InterfaceAccordion({ props, gridId, componentId }: InterfaceAccordionProps) {
  const dispatch = useDispatch()

  const debouncedDispatch = (value: boolean) => {
    let timeoutId: NodeJS.Timeout;
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dispatch(addInterfaceContext({ gridId, componentId, value }));
        resolve(true);
      }, 400);
    });
  };

  const handleChange = (e: any) => {
    const { value } = e.target
    debouncedDispatch(value)
  }

  return (
    <Accordion {...props} onChange={handleChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
        <Typography>{props?.title || 'Accordion'}</Typography>
      </AccordionSummary>
      <AccordionDetails className='bg-white flex-start-center'>
        <Typography>{props?.description || 'Accordion Description'}</Typography>
      </AccordionDetails>
    </Accordion>
  )
}

export default InterfaceAccordion
