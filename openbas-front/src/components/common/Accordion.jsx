import { ArrowForwardIosSharp } from '@mui/icons-material';
import { Accordion as MuiAccordion, AccordionSummary as MuiAccordionSummary } from '@mui/material';
import { styled } from '@mui/material/styles';
// eslint should not lint this file with TS rules yet here we are
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

export const Accordion = styled(props => (<MuiAccordion disableGutters elevation={0} square {...props} />))(() => ({
  'border': '1px solid rgba(255, 255, 255, 0.7)',
  '&:before': { display: 'none' },
  'borderRadius': '4px',
  'backgroundColor': 'rgba(255, 255, 255, 0)',
}));

export const AccordionSummary = styled(props => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharp sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  'backgroundColor': theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  'flexDirection': 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(90deg)' },
  '& .MuiAccordionSummary-content': { marginLeft: theme.spacing(1) },
}));
