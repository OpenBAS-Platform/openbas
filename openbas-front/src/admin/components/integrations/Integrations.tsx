import React, { CSSProperties, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useFormatter } from '../../../components/i18n';
import { searchInjectorContracts } from '../../../actions/Inject';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import { initSorting } from '../../../components/common/pagination/Page';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../utils/hooks';
import { fetchAttackPatterns } from '../../../actions/AttackPattern';
import { fetchKillChainPhases } from '../../../actions/KillChainPhase';
import type { InjectorContractStore } from '../../../actions/injectorcontract/InjectorContract';
import type { AttackPatternHelper } from '../../../actions/attackpattern/attackpattern-helper';
import type { KillChainPhaseHelper } from '../../../actions/killchainphase/killchainphase-helper';
import Empty from '../../../components/Empty';
import type { SearchPaginationInput } from '../../../utils/api-types';
import type { Theme } from '../../../components/Theme';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
  },
  itemHead: {
    textTransform: 'uppercase',
  },
  item: {
    height: 50,
  },
  bodyItemHeader: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 700,
  },
  bodyItem: {
    fontSize: theme.typography.h3.fontSize,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const inlineStyles: Record<string, CSSProperties> = {
  injector_contract_labels: {
    width: '30%',
  },
  injectors_contracts_kill_chain_phases: {
    width: '30%',
  },
  injectors_contracts_attack_patterns: {
    width: '30%',
  },
};

const Integrations = () => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const { tPick } = useFormatter();
  const dispatch = useAppDispatch();

  const [contracts, setContracts] = useState<InjectorContractStore[]>([]);

  const [searchPaginationInput, _setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('injector_contract_labels'),
  });

  // Fetching data
  const { attackPatternsMap, killChainPhasesMap } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper) => ({
    attackPatternsMap: helper.getAttackPatternsMap(),
    killChainPhasesMap: helper.getKillChainPhasesMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchAttackPatterns());
    dispatch(fetchKillChainPhases());
  });

  const computeMatrix = (contract: InjectorContractStore) => {
    const killChainPhases: string[] = [];
    const attackPatterns: string[] = [];
    contract.injectors_contracts_attack_patterns?.forEach((a) => {
      const killChainPhaseId = attackPatternsMap[a]?.attack_pattern_kill_chain_phases;
      const phaseName = killChainPhasesMap[killChainPhaseId]?.phase_name;
      if (killChainPhaseId && phaseName) {
        killChainPhases.push(phaseName);
      }

      const attackPattern = attackPatternsMap[a]?.attack_pattern_name;
      if (attackPattern) {
        attackPatterns.push(attackPattern);
      }
    });
    return [killChainPhases.join(', '), attackPatterns.join(', ')];
  };

  // Headers
  const headers = [
    {
      field: 'injector_contract_labels',
      label: 'Title',
      isSortable: false,
      value: (contract: InjectorContractStore) => tPick(contract.injector_contract_labels),
    },
    {
      field: 'injectors_contracts_kill_chain_phases',
      label: 'Kill chain phases',
      isSortable: false,
      value: (contract: InjectorContractStore) => computeMatrix(contract)[0],
    },
    {
      field: 'injectors_contracts_attack_patterns',
      label: 'Attack patterns',
      isSortable: true,
      value: (contract: InjectorContractStore) => computeMatrix(contract)[1],
    },
  ];

  return (
    <>
      <PaginationComponent
        fetch={searchInjectorContracts}
        searchPaginationInput={searchPaginationInput}
        setContent={setContracts}
      />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon>
            <span
              style={{
                padding: '0 8px 0 8px',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              &nbsp;
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <div className={classes.container}>
                {headers.map((header) => (
                  <div key={header.field}
                    className={classes.bodyItemHeader}
                    style={inlineStyles[header.field]}
                  >
                    <span>{t(header.label)}</span>
                  </div>
                ))}
              </div>
            }
          />
        </ListItem>
        {contracts.map((contract) => {
          return (
            <ListItem
              key={contract.injector_contract_id}
              classes={{ root: classes.item }}
              divider
            >
              <ListItemText
                primary={
                  <>
                    {headers.map((header) => (
                      <div
                        key={header.field}
                        className={classes.bodyItem}
                        style={inlineStyles[header.field]}
                      >
                        {header.value(contract)}
                      </div>
                    ))}
                  </>
                }
              />
            </ListItem>
          );
        })}
        {!contracts ? (
          <Empty message={t('No data available')} />
        ) : null}
      </List>
    </>
  );
};

export default Integrations;
