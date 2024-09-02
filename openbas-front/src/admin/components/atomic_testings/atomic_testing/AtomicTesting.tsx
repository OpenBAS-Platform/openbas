import React, { useContext, useEffect, useState } from 'react';
import { Chip, Grid, List, Paper, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { AttackPattern, InjectTargetWithResult, KillChainPhase } from '../../../../utils/api-types';
import ResponsePie from '../../common/injects/ResponsePie';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import TargetResultsDetail from './TargetResultsDetail';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import TargetListItem from './TargetListItem';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import ItemStatus from '../../../../components/ItemStatus';
import SearchFilter from '../../../../components/SearchFilter';
import InjectIcon from '../../common/injects/InjectIcon';
import PlatformIcon from '../../../../components/PlatformIcon';
import Loader from '../../../../components/Loader';
import { InjectResultDtoContext, InjectResultDtoContextType } from '../InjectResultDtoContext';
import { isNotEmptyField } from '../../../../utils/utils';

const useStyles = makeStyles(() => ({
  chip: {
    fontSize: 12,
    height: 25,
    margin: '0 7px 7px 0',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 180,
  },
  gridContainer: {
    marginBottom: 20,
  },
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: 15,
    borderRadius: 4,
  },
}));

const AtomicTesting = () => {
  // Standard hooks
  const classes = useStyles();
  const { t, tPick, fldt } = useFormatter();
  const [selectedTarget, setSelectedTarget] = useState<InjectTargetWithResult>();
  const [currentParentTarget, setCurrentParentTarget] = useState<InjectTargetWithResult>();
  const filtering = useSearchAnFilter('', 'name', ['name']);

  // Fetching data
  const { injectResultDto } = useContext<InjectResultDtoContextType>(InjectResultDtoContext);
  useEffect(() => {
    setSelectedTarget(selectedTarget || currentParentTarget || injectResultDto?.inject_targets[0]);
  }, [injectResultDto]);

  const sortedTargets: InjectTargetWithResult[] = filtering.filterAndSort(injectResultDto?.inject_targets ?? []);

  // Handles
  const handleTargetClick = (target: InjectTargetWithResult, currentParent?: InjectTargetWithResult) => {
    setSelectedTarget(target);
    if (currentParent) {
      setCurrentParentTarget(currentParent);
    }
  };

  if (!injectResultDto) {
    return <Loader variant="inElement" />;
  }

  return (
    <Grid
      container
      spacing={3}
      classes={{ container: classes.gridContainer }}
    >
      <Grid item xs={6} style={{ paddingTop: 10 }}>
        <Typography variant="h4" gutterBottom>
          {t('Information')}
        </Typography>
        <Paper classes={{ root: classes.paper }} variant="outlined">
          <Grid container spacing={3}>
            <Grid item xs={12} style={{ paddingTop: 10 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Description')}
              </Typography>
              <ExpandableMarkdown
                source={injectResultDto.inject_description}
                limit={300}
              />
            </Grid>
            <Grid item xs={4} style={{ paddingTop: 10 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Type')}
              </Typography>
              <div style={{ display: 'flex' }}>
                <InjectIcon
                  variant="inline"
                  isPayload={isNotEmptyField(injectResultDto.inject_injector_contract?.injector_contract_payload)}
                  type={
                        injectResultDto.inject_injector_contract?.injector_contract_payload
                          ? injectResultDto.inject_injector_contract.injector_contract_payload?.payload_collector_type
                            || injectResultDto.inject_injector_contract.injector_contract_payload?.payload_type
                          : injectResultDto.inject_type
                    }
                />
                <Tooltip title={tPick(injectResultDto.inject_injector_contract?.injector_contract_labels)}>
                  <div style={{
                    marginLeft: 10,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  >
                    {tPick(injectResultDto.inject_injector_contract?.injector_contract_labels)}
                  </div>
                </Tooltip>
              </div>
            </Grid>
            <Grid item xs={4} style={{ paddingTop: 10 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Last execution date')}
              </Typography>
              <div style={{ display: 'flex' }}>
                {fldt(injectResultDto.inject_updated_at)}
              </div>
            </Grid>
            <Grid item xs={4} style={{ paddingTop: 10 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Status')}
              </Typography>
              <ItemStatus isInject={true} status={injectResultDto.inject_status?.status_name} label={t(injectResultDto.inject_status?.status_name ?? 'Unknown')} />
            </Grid>
            <Grid item xs={4} style={{ paddingTop: 10 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Platforms')}
              </Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {injectResultDto.inject_injector_contract?.injector_contract_platforms?.map((platform: string) => (
                  <div key={platform} style={{ display: 'flex', marginRight: 15 }}>
                    <PlatformIcon width={20} platform={platform} marginRight={5} />
                    {platform}
                  </div>
                ))}
              </div>
            </Grid>
            <Grid item xs={4} style={{ paddingTop: 10 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Kill Chain Phases')}
              </Typography>
              {(injectResultDto.inject_kill_chain_phases ?? []).length === 0 && '-'}
              {injectResultDto.inject_kill_chain_phases?.map((killChainPhase: KillChainPhase) => (
                <Chip
                  key={killChainPhase.phase_id}
                  variant="outlined"
                  classes={{ root: classes.chip }}
                  color="error"
                  label={killChainPhase.phase_name}
                />
              ))}
            </Grid>
            <Grid item xs={4} style={{ paddingTop: 10 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Attack Patterns')}
              </Typography>
              {(injectResultDto.inject_attack_patterns ?? []).length === 0 && '-'}
              {injectResultDto.inject_attack_patterns?.map((attackPattern: AttackPattern) => (
                <Tooltip key={attackPattern.attack_pattern_id} title={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}>
                  <Chip
                    variant="outlined"
                    classes={{ root: classes.chip }}
                    color="primary"
                    label={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}
                  />
                </Tooltip>
              ))}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ paddingTop: 10 }}>
        <Typography variant="h4" gutterBottom>
          {t('Results')}
        </Typography>
        <Paper classes={{ root: classes.paper }} variant="outlined" style={{ display: 'flex', alignItems: 'center' }}>
          <ResponsePie expectationResultsByTypes={injectResultDto.inject_expectation_results} />
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 30 }}>
        <Typography variant="h4" gutterBottom style={{ float: 'left' }}>
          {t('Targets')}
        </Typography>
        <div style={{ float: 'right', marginTop: -15 }}>
          <SearchFilter
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
            placeholder={t('Search by target name')}
          />
        </div>
        <div className="clearfix" />
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {sortedTargets.length > 0 ? (
            <List>
              {sortedTargets.map((target) => (
                <div key={target?.id} style={{ marginBottom: 15 }}>
                  <TargetListItem onClick={() => handleTargetClick(target)} target={target} selected={selectedTarget?.id === target.id} />
                  <List component="div" disablePadding>
                    {target?.children?.map((child) => (
                      <TargetListItem key={child?.id} isChild onClick={() => handleTargetClick(child, target)}
                        target={child} selected={selectedTarget?.id === child.id && currentParentTarget?.id === target.id}
                      />
                    ))}
                  </List>
                </div>
              ))}
            </List>
          ) : (
            <Empty message={t('No target configured.')} />
          )}
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 29 }}>
        <Typography variant="h4" gutterBottom>
          {t('Results by target')}
        </Typography>
        <Paper classes={{ root: classes.paper }} variant="outlined" style={{ marginTop: 18 }}>
          {selectedTarget && !!injectResultDto.inject_type && (
          <TargetResultsDetail
            inject={injectResultDto}
            parentTargetId={currentParentTarget?.id}
            target={selectedTarget}
            lastExecutionStartDate={injectResultDto.inject_status?.tracking_sent_date || ''}
            lastExecutionEndDate={injectResultDto.inject_status?.tracking_end_date || ''}
          />
          )}
          {!selectedTarget && (
          <Empty message={t('No target data available.')} />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AtomicTesting;
