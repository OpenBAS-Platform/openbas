import React, { FunctionComponent, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Button, Typography } from '@mui/material';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchKillChainPhases } from '../../../../actions/KillChainPhase';
import { useAppDispatch } from '../../../../utils/hooks';
import type { AttackPattern, KillChainPhase } from '../../../../utils/api-types';
import type { KillChainPhaseHelper } from '../../../../actions/kill_chain_phases/killchainphase-helper';
import { fetchAttackPatterns } from '../../../../actions/AttackPattern';
import type { AttackPatternHelper } from '../../../../actions/attack_patterns/attackpattern-helper';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import { buildEmptyFilter } from '../../../../components/common/filter/FilterUtils';
import { FilterHelpers } from '../../../../components/common/filter/FilterHelpers';
import type { AttackPatternStore } from '../../../../actions/attack_patterns/AttackPattern';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    gap: 10,
  },
  button: {
    whiteSpace: 'nowrap',
    width: '100%',
    textTransform: 'capitalize',
    borderRadius: 4,
    color: theme.palette.chip.main,
  },
}));

interface KillChainPhaseComponentProps {
  killChainPhase: KillChainPhase;
  attackPatterns: AttackPattern[];
  helpers: FilterHelpers;
  onClick: () => void;
}

const computeTechnique = (attackPatterns: AttackPattern[]) => {
  return attackPatterns.filter((attackPattern) => attackPattern.attack_pattern_external_id.indexOf('.') < 0);
};
const computeSubTechnique = (attackPatterns: AttackPattern[]) => {
  return attackPatterns.filter((attackPattern) => attackPattern.attack_pattern_external_id.indexOf('.') > -1);
};

export const MITRE_FILTER_KEY = 'injector_contract_attack_patterns';

const KillChainPhaseColumn: FunctionComponent<KillChainPhaseComponentProps> = ({
  killChainPhase,
  attackPatterns,
  helpers,
  onClick,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  // Attack Pattern
  const sortAttackPattern = (attackPattern1: AttackPattern, attackPattern2: AttackPattern) => {
    if (attackPattern1.attack_pattern_name < attackPattern2.attack_pattern_name) {
      return -1;
    }
    if (attackPattern1.attack_pattern_name > attackPattern2.attack_pattern_name) {
      return 1;
    }
    return 0;
  };

  // Techniques
  const techniques = computeTechnique(attackPatterns);

  // Sub techniques
  const subTechniquesComponent = (attackPattern: AttackPattern) => {
    const subTechniques = computeSubTechnique(attackPatterns)
      .filter((a) => a.attack_pattern_external_id.includes(attackPattern.attack_pattern_external_id));
    if (subTechniques.length > 0) {
      return (<span>&nbsp;({subTechniques.length})</span>);
    }
    return (<></>);
  };

  const handleOnClick = (attackPattern: AttackPattern) => {
    helpers.handleAddSingleValueFilter(
      MITRE_FILTER_KEY,
      attackPattern.attack_pattern_external_id,
    );
    onClick();
  };

  return (
    <div>
      <div style={{ marginBottom: 10, textAlign: 'center' }}>
        <div>{killChainPhase.phase_name}</div>
        <div style={{ textWrap: 'nowrap' }}>({techniques.length} {t('techniques')})</div>
      </div>
      <div>
        {techniques.sort(sortAttackPattern)
          .map((attackPattern) => (
            <Button
              key={attackPattern.attack_pattern_id}
              variant="outlined"
              className={classes.button}
              onClick={() => handleOnClick(attackPattern)}
              style={{ justifyContent: 'start' }}
            >
              <Typography variant="caption">
                {`[${attackPattern.attack_pattern_external_id}] `}
                {attackPattern.attack_pattern_name}
                {subTechniquesComponent(attackPattern)}
              </Typography>
            </Button>
          ))}
      </div>
    </div>
  );
};

interface MitreFilterProps {
  helpers: FilterHelpers;
  onClick: () => void;
}

const MitreFilter: FunctionComponent<MitreFilterProps> = ({
  helpers,
  onClick,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Fetching data
  const { attackPatterns, killChainPhases } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper) => ({
    attackPatterns: helper.getAttackPatterns(),
    killChainPhases: helper.getKillChainPhases(),
  }));
  useDataLoader(() => {
    dispatch(fetchKillChainPhases());
    dispatch(fetchAttackPatterns());
  });

  // Filters
  useEffect(() => {
    helpers.handleAddFilterWithEmptyValue(buildEmptyFilter(MITRE_FILTER_KEY, 'contains'));
  }, []);

  // Kill Chain Phase
  const sortKillChainPhase = (k1: KillChainPhase, k2: KillChainPhase) => {
    return (k1.phase_order ?? 0) - (k2.phase_order ?? 0);
  };

  // Attack Pattern
  const getAttackPatterns = (killChainPhase: KillChainPhase) => {
    return attackPatterns.filter((attackPattern: AttackPatternStore) => attackPattern.attack_pattern_kill_chain_phases?.includes(killChainPhase.phase_id));
  };

  return (
    <div className={classes.container}>
      {killChainPhases.sort(sortKillChainPhase)
        .map((killChainPhase: KillChainPhase) => (
          <KillChainPhaseColumn
            key={killChainPhase.phase_id}
            killChainPhase={killChainPhase}
            attackPatterns={getAttackPatterns(killChainPhase)}
            helpers={helpers}
            onClick={onClick}
          />
        ))}
    </div>
  );
};
export default MitreFilter;
