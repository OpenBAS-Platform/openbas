import React, { FunctionComponent, useState } from 'react';
import { Box, Button, Typography, Stepper, Step, StepLabel } from '@mui/material';
import ButtonCreate from '../../../components/common/ButtonCreate';
import { useFormatter } from '../../../components/i18n';
import FullPageDrawer from '../../../components/common/FullPageDrawer';
import CreationInjectType from './creation/CreationInjectType';
import CreationInjectDetails from './creation/CreationInjectDetails';

interface Props {

}

const AtomicTestingCreation: FunctionComponent<Props> = () => {
  // Standard hooks
  const [open, setOpen] = useState(false);
  const { t } = useFormatter();
  const steps = ['Inject type', 'Inject details'];
  const [activeStep, setActiveStep] = React.useState(0);
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleReset = () => {
    setActiveStep(0);
  };
  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
      <FullPageDrawer
        open={open}
        handleClose={() => setOpen(false)}
        title={t('Create a new atomic test')}
      >

        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            marginBottom: 4,
            width: '80%',
            marginTop: 5,
            marginLeft: 10,
          }}
        >
          <Stepper activeStep={activeStep}>
            {steps.map((label) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === steps.length ? (
            <React.Fragment>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you&apos;re finished
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Typography sx={{ mt: 2, mb: 1 }}>
                {
                  activeStep === 0 && <CreationInjectType />
                }
                {
                  activeStep === 1 && <CreationInjectDetails />
                }
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleNext}>
                  {activeStep === steps.length - 1 ? <Button
                    color="secondary"
                    type="submit"
                                                     >
                    Create
                  </Button> : 'Next'}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Box>

      </FullPageDrawer>
    </>
  );
};

export default AtomicTestingCreation;
