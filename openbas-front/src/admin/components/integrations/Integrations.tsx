import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import { RouteOutlined } from '@mui/icons-material';
import { LockPattern } from 'mdi-material-ui';
import * as R from 'ramda';
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

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
}));

const Integrations = () => {
  // Standard hooks
  const classes = useStyles();
  const { tPick } = useFormatter();
  const dispatch = useAppDispatch();

  const [contracts, setContracts] = useState<InjectorContractStore[]>([]);

  const [searchPaginationInput, _setSearchPaginationInput] = useState({
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

  return (
    <div className={classes.root}>
      <PaginationComponent
        fetch={searchInjectorContracts}
        searchPaginationInput={searchPaginationInput}
        setContent={setContracts}
      />
      <div className="clearfix" />
      <Grid container spacing={3}>
        {contracts.map((contract) => {
          const [killChainPhase, attackPattern] = computeMatrix(contract);
          return (
            <Grid
              key={contract.injector_contract_id}
              item
              xs={6}
            >
              <Card variant="outlined">
                <CardHeader
                  title={tPick(contract.injector_contract_labels)}
                />
                <CardContent>
                  <div className={classes.container}>
                    <RouteOutlined color={R.isEmpty(killChainPhase) ? 'disabled' : 'secondary'} />
                    <Typography variant="h4" component="div" sx={{ m: 0 }}>
                      {killChainPhase}
                    </Typography>
                  </div>
                  <div className={classes.container} style={{ marginTop: 10 }}>
                    <LockPattern color={R.isEmpty(attackPattern) ? 'disabled' : 'secondary'} />
                    <Typography variant="h4" component="div" sx={{ m: 0 }}>
                      {attackPattern}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default Integrations;
