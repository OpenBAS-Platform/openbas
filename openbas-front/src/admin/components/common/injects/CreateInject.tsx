import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Chip, Grid, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { KeyboardArrowRight } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import { searchInjectorContracts } from '../../../../actions/InjectorContracts';
import computeAttackPatterns from '../../../../utils/injector_contract/InjectorContractUtils';
import type { FilterGroup, Inject, InjectorContractOutput, SearchPaginationInput } from '../../../../utils/api-types';
import { initSorting } from '../../../../components/common/pagination/Page';
import useFiltersState from '../../../../components/common/filter/useFiltersState';
import { emptyFilterGroup } from '../../../../components/common/filter/FilterUtils';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { AttackPatternHelper } from '../../../../actions/attack_patterns/attackpattern-helper';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchAttackPatterns } from '../../../../actions/AttackPattern';
import Drawer from '../../../../components/common/Drawer';
import CreateInjectDetails from './CreateInjectDetails';
import type { AttackPatternStore } from '../../../../actions/attack_patterns/AttackPattern';
import InjectIcon from './InjectIcon';
import type { InjectorHelper } from '../../../../actions/injectors/injector-helper';
import PlatformIcon from '../../../../components/PlatformIcon';
import type { KillChainPhaseHelper } from '../../../../actions/kill_chain_phases/killchainphase-helper';
import { fetchKillChainPhases } from '../../../../actions/KillChainPhase';
import { isNotEmptyField } from '../../../../utils/utils';

const useStyles = makeStyles(() => ({
  container: {
    height: 30,
    display: 'flex',
    alignItems: 'center',
  },
  containerItem: {
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 20,
  },
  chipInList: {
    fontSize: 12,
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 80,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
}));

const inlineStyles = {
  killChainPhase: {
    width: '20%',
  },
  label: {
    width: '45%',
  },
  platform: {
    width: '12%',
  },
  attackPatterns: {
    width: '20%',
  },
};

interface Props {
  title: string
  onCreateInject: (data: Inject) => Promise<void>
  isAtomic?: boolean
  open?: boolean
  handleClose: () => void
  presetValues?: {
    inject_depends_duration_days?: number,
    inject_depends_duration_hours?: number,
    inject_depends_duration_minutes?: number,
  }
}

const atomicFilter: FilterGroup = {
  mode: 'and',
  filters: [
    {
      key: 'injector_contract_atomic_testing',
      operator: 'eq',
      values: ['true'],
    }],
};

const CreateInject: FunctionComponent<Props> = ({ title, onCreateInject, open = false, handleClose, isAtomic = false, presetValues, ...props }) => {
  // Standard hooks
  const classes = useStyles();
  const drawerRef = useRef(null);
  const dispatch = useAppDispatch();
  const { t, tPick } = useFormatter();

  // Fetching data
  const { attackPatterns, attackPatternsMap, killChainPhasesMap } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper & InjectorHelper) => ({
    attackPatterns: helper.getAttackPatterns(),
    attackPatternsMap: helper.getAttackPatternsMap(),
    killChainPhasesMap: helper.getKillChainPhasesMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchKillChainPhases());
    dispatch(fetchAttackPatterns());
  });

  // Contracts
  const [contracts, setContracts] = useState<InjectorContractOutput[]>([]);
  // as we don't know the type of the content of a contract we need to put any here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parsedContentContracts, setParsedContentContracts] = useState<any[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('injector_contract_labels'),
    filterGroup: isAtomic ? atomicFilter : emptyFilterGroup,
    size: 100,
  });
  const [filterGroup, helpers] = useFiltersState(isAtomic ? atomicFilter : emptyFilterGroup, (f: FilterGroup) => setSearchPaginationInput({
    ...searchPaginationInput,
    filterGroup: f,
  }));
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const selectContract = (contract: number) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    drawerRef.current.scrollTop = 0;
    setSelectedContract(contract);
  };
  const handleCloseDrawer = () => {
    setSelectedContract(null);
    handleClose();
  };
  useEffect(() => {
    if (contracts && contracts.length > 0) {
      setParsedContentContracts(contracts.map((c) => JSON.parse(c.injector_contract_content)));
    }
    setSelectedContract(null);
  }, [contracts]);

  let selectedContractKillChainPhase = null;
  if (selectedContract !== null && contracts[selectedContract] !== undefined) {
    const selectedContractAttackPatterns = computeAttackPatterns(contracts[selectedContract], attackPatternsMap);
    // eslint-disable-next-line max-len
    const killChainPhaseforSelection = selectedContractAttackPatterns.map((contractAttackPattern: AttackPatternStore) => contractAttackPattern.attack_pattern_kill_chain_phases ?? []).flat().at(0);
    selectedContractKillChainPhase = killChainPhaseforSelection && killChainPhasesMap[killChainPhaseforSelection] && killChainPhasesMap[killChainPhaseforSelection].phase_name;
  }

  return (
    <>
      <Drawer
        open={open}
        handleClose={handleCloseDrawer}
        title={title}
        variant="full"
        PaperProps={{
          ref: drawerRef,
        }}
        disableEnforceFocus={true}
      >
        <Grid container spacing={3}>
          <Grid item xs={7} style={{ paddingTop: 30 }}>
            <PaginationComponent
              fetch={searchInjectorContracts}
              searchPaginationInput={searchPaginationInput}
              setContent={setContracts}
              entityPrefix="injector_contract"
              availableFilters={['injector_contract_kill_chain_phases', 'injector_contract_attack_patterns']}
              helpers={helpers}
              filterGroup={filterGroup}
              disablePagination
              attackPatterns={attackPatterns}
            />
            <List>
              {contracts.map((contract, index) => {
                const contractAttackPatterns = computeAttackPatterns(contract, attackPatternsMap);
                // eslint-disable-next-line max-len
                const contractKillChainPhase = contractAttackPatterns.map((contractAttackPattern: AttackPatternStore) => contractAttackPattern.attack_pattern_kill_chain_phases ?? []).flat().at(0);
                const resolvedContractKillChainPhase = contractKillChainPhase && killChainPhasesMap[contractKillChainPhase];
                return (
                  <ListItemButton
                    key={contract.injector_contract_id}
                    divider
                    onClick={() => selectContract(index)}
                    selected={selectedContract === index}
                    disabled={(selectedContract !== null && selectedContract !== index)}
                  >
                    <ListItemIcon>
                      <InjectIcon
                        variant="list"type={contract.injector_contract_payload_type ?? contract.injector_contract_injector_type}
                        isPayload={isNotEmptyField(contract.injector_contract_payload_type)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div className={classes.container}>
                          <div className={classes.containerItem} style={inlineStyles.killChainPhase}>
                            {resolvedContractKillChainPhase ? resolvedContractKillChainPhase.phase_name : t('Unknown')}
                          </div>
                          <Tooltip title={tPick(contract.injector_contract_labels)}>
                            <div className={classes.containerItem} style={inlineStyles.label}>
                              {tPick(contract.injector_contract_labels)}
                            </div>
                          </Tooltip>
                          <div className={classes.containerItem} style={inlineStyles.platform}>
                            {contract.injector_contract_platforms?.map((platform) => <PlatformIcon key={platform} width={20} platform={platform} marginRight={10} />)}
                          </div>
                          <div className={classes.containerItem} style={inlineStyles.attackPatterns}>
                            {contractAttackPatterns.map((contractAttackPattern) => (
                              <Chip
                                key={`${contract.injector_contract_id}-${contractAttackPattern.attackPatternId}`}
                                variant="outlined"
                                classes={{ root: classes.chipInList }}
                                color="primary"
                                label={contractAttackPattern.attack_pattern_external_id}
                              />
                            ))}
                          </div>
                        </div>
                      }
                    />
                    <ListItemIcon classes={{ root: classes.goIcon }}>
                      <KeyboardArrowRight />
                    </ListItemIcon>
                  </ListItemButton>
                );
              })}
            </List>
          </Grid>
          <Grid item xs={5} style={{ paddingTop: 10 }}>
            <CreateInjectDetails
              drawerRef={drawerRef}
              contractId={selectedContract !== null && contracts?.length ? contracts[selectedContract]?.injector_contract_id : null}
              contractContent={selectedContract !== null ? parsedContentContracts[selectedContract] : null}
              contract={selectedContract !== null ? contracts[selectedContract] : null}
              setSelectedContract={setSelectedContract}
              selectedContractKillChainPhase={selectedContractKillChainPhase}
              handleClose={handleCloseDrawer}
              onCreateInject={onCreateInject}
              isAtomic={isAtomic}
              presetValues={presetValues}
              {...props}
            />
          </Grid>
        </Grid>
      </Drawer>
    </>
  );
};

export default CreateInject;
