import React, { FunctionComponent, useEffect, useState } from 'react';
import { Box, Button, Typography, Stepper, Step, StepLabel, Chip, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import ButtonCreate from '../../../components/common/ButtonCreate';
import { useFormatter } from '../../../components/i18n';
import CreationInjectDetails from './creation/CreationInjectDetails';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import { searchInjectorContracts } from '../../../actions/Inject';
import MitreFilter, { MITRE_FILTER_KEY } from '../components/atomictestings/MitreFilter';
import computeAttackPattern from '../../../utils/injectorcontract/InjectorContractUtils';
import type { InjectorContractStore } from '../../../actions/injectorcontract/InjectorContract';
import type { FilterGroup, SearchPaginationInput } from '../../../utils/api-types';
import { initSorting } from '../../../components/common/pagination/Page';
import useFiltersState from '../../../components/common/filter/useFiltersState';
import { isEmptyFilter } from '../../../components/common/filter/FilterUtils';
import { useAppDispatch } from '../../../utils/hooks';
import { useHelper } from '../../../store';
import type { AttackPatternHelper } from '../../../actions/attackpattern/attackpattern-helper';
import useDataLoader from '../../../utils/ServerSideEvent';
import { fetchAttackPatterns } from '../../../actions/AttackPattern';
import Drawer from '../../../components/common/Drawer';

const useStyles = makeStyles(() => ({
  menuContainer: {
    marginLeft: 30,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

interface Props {

}

const AtomicTestingCreation: FunctionComponent<Props> = () => {
  // Standard hooks
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t, tPick } = useFormatter();

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

  // Fetching data
  const { attackPatternsMap } = useHelper((helper: AttackPatternHelper) => ({
    attackPatternsMap: helper.getAttackPatternsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchAttackPatterns());
  });

  // Filter
  const [openMitreFilter, setOpenMitreFilter] = React.useState(false);

  // Contracts
  const [contracts, setContracts] = useState<InjectorContractStore[]>([]);
  // as we don't know the type of the content of a contract we need to put any here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parsedContentContracts, setParsedContentContracts] = useState<any[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('injector_contract_labels'),
    filterGroup: {
      mode: 'and',
      filters: [
        {
          key: 'injector_contract_atomic_testing',
          operator: 'eq',
          values: ['true'],
        }],
    },
  });

  const iniFilter: FilterGroup = {
    mode: 'and',
    filters: [
      {
        key: 'injector_contract_atomic_testing',
        operator: 'eq',
        values: ['true'],
      }],
  };

  const [filterGroup, helpers] = useFiltersState(iniFilter, (f: FilterGroup) => setSearchPaginationInput({ ...searchPaginationInput, filterGroup: f }));

  const [selectedContract, setSelectedContract] = useState<number | null>(null);

  const handleCloseDrawer = () => {
    setOpen(false);
    handleReset();
  };

  useEffect(() => {
    if (contracts && contracts.length > 0) {
      setParsedContentContracts(contracts.map((c) => JSON.parse(c.injector_contract_content)));
    }
  }, [contracts]);

  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
      <Drawer
        open={open}
        handleClose={handleCloseDrawer}
        title={t('Create a new atomic test')}
        variant={'full'}
      >

        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'transparent',
            marginBottom: 4,
            width: '90%',
            marginTop: 2,
            marginLeft: 10,
          }}
        >
          <Stepper sx={{ marginBottom: 6 }} activeStep={activeStep}>
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

          {
            activeStep === 0
            && <div className={classes.menuContainer}>
              <PaginationComponent
                fetch={searchInjectorContracts}
                searchPaginationInput={searchPaginationInput}
                setContent={setContracts}
              />
              <div className={classes.container} style={{ marginTop: 10 }}>
                <div>
                  {!isEmptyFilter(filterGroup, MITRE_FILTER_KEY)
                    && <Chip
                      label={`Attack pattern = ${filterGroup.filters?.filter((f) => f.key === MITRE_FILTER_KEY)?.[0]?.values?.map((id) => attackPatternsMap[id].attack_pattern_name)}`}
                      onDelete={() => helpers.handleClearAllFilters()}
                      component="a"
                       />
                  }
                </div>
                <Button
                  variant="outlined"
                  color="inherit"
                  type="submit"
                  onClick={() => setOpenMitreFilter(true)}
                >
                  {t('Mitre Filter')}
                </Button>
              </div>
              <List>
                {contracts.map((contract, index) => {
                  const [attackPattern] = computeAttackPattern(contract, attackPatternsMap);
                  return (
                    <ListItem key={contract.injector_contract_id} divider>
                      <ListItemButton
                        onClick={() => {
                          setSelectedContract(index);
                          handleNext();
                        }}
                      >
                        <ListItemText
                          primary={<div className={classes.container}>
                            <div>
                              {attackPattern
                                && <span>
                                  [{attackPattern.attack_pattern_external_id}]
                                  {' - '}
                                </span>
                              }
                              <span>
                                {tPick(contract.injector_contract_labels)}
                              </span>
                            </div>

                            <Typography variant="h3" sx={{ m: 0 }}>{attackPattern?.attack_pattern_name}</Typography>
                          </div>}
                        />
                      </ListItemButton>

                    </ListItem>
                  );
                })}
              </List>
              <Drawer
                open={openMitreFilter}
                handleClose={() => setOpenMitreFilter(false)}
                title={t('ATT&CK Matrix')}
                variant={'full'}
              >
                <MitreFilter helpers={helpers} onClick={() => setOpenMitreFilter(false)} />
              </Drawer>
            </div>
          }
          {
            activeStep === 1 && selectedContract !== null
            && <CreationInjectDetails
              contractId={contracts[selectedContract].injector_contract_id}
              contractContent={parsedContentContracts[selectedContract]}
              handleClose={() => setOpen(false)}
              handleBack={handleBack}
              handleReset={handleReset}
               />
          }
        </Box>
      </Drawer>
    </>
  );
};

export default AtomicTestingCreation;
