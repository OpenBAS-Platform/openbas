import React, { FunctionComponent } from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CastForEducationOutlined, DnsOutlined, LanOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import ChannelExpectation from '../expectations/ChannelExpectation';
import ChallengeExpectation from '../expectations/ChallengeExpectation';
import TechnicalExpectationAsset from '../expectations/TechnicalExpectationAsset';
import TechnicalExpectationAssetGroup from '../expectations/TechnicalExpectationAssetGroup';
import ManualExpectations from '../expectations/ManualExpectations';
import type { EndpointStore } from '../../../../assets/endpoints/Endpoint';
import type { AssetGroupStore } from '../../../../assets/asset_groups/AssetGroup';
import type { Inject, Team } from '../../../../../../utils/api-types';
import type { InjectExpectationsStore } from '../../../../common/injects/expectations/Expectation';
import { useAppDispatch } from '../../../../../../utils/hooks';
import { useHelper } from '../../../../../../store';
import useDataLoader from '../../../../../../utils/hooks/useDataLoader';
import { fetchChannels } from '../../../../../../actions/channels/channel-action';
import { fetchExerciseTeams } from '../../../../../../actions/Exercise';
import { fetchExerciseChallenges } from '../../../../../../actions/Challenge';
import { fetchEndpoints } from '../../../../../../actions/assets/endpoint-actions';
import { fetchAssetGroups } from '../../../../../../actions/asset_groups/assetgroup-action';
import type { AssetGroupsHelper } from '../../../../../../actions/asset_groups/assetgroup-helper';
import type { EndpointsHelper } from '../../../../../../actions/assets/asset-helper';
import type { ChallengesHelper } from '../../../../../../actions/helper';
import type { ArticlesHelper } from '../../../../../../actions/channels/article-helper';
import type { ChannelsHelper } from '../../../../../../actions/channels/channel-helper';
import type { TeamsHelper } from '../../../../../../actions/teams/team-helper';
import { fetchExerciseArticles } from '../../../../../../actions/channels/article-action';
import type { Contract } from '../../../../../../actions/contract/contract';

const useStyles = makeStyles(() => ({
  item: {
    height: 40,
  },
  bodyItem: {
    height: '100%',
    float: 'left',
    fontSize: 13,
  },
}));

interface Props {
  exerciseId: string;
  inject: Inject;
  injectContract: Contract;
  expectationsByInject: InjectExpectationsStore[];
  id: string;
  expectations: InjectExpectationsStore[];
}

const TeamOrAssetLine: FunctionComponent<Props> = ({
  exerciseId,
  inject,
  injectContract,
  expectationsByInject,
  id,
  expectations,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Fetching data
  const {
    teamsMap,
    assetsMap,
    assetGroupsMap,
    challengesMap,
    articlesMap,
    channelsMap,
  } = useHelper((helper: ArticlesHelper & AssetGroupsHelper & EndpointsHelper & ChallengesHelper & ChannelsHelper & TeamsHelper) => {
    return {
      articlesMap: helper.getArticlesMap(),
      assetsMap: helper.getEndpointsMap(),
      assetGroupsMap: helper.getAssetGroupMaps(),
      challengesMap: helper.getChallengesMap(),
      channelsMap: helper.getChannelsMap(),
      teamsMap: helper.getTeamsMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchChannels());
    dispatch(fetchExerciseTeams(exerciseId));
    dispatch(fetchExerciseArticles(exerciseId));
    dispatch(fetchExerciseChallenges(exerciseId));
    dispatch(fetchEndpoints());
    dispatch(fetchAssetGroups());
  });

  const team: Team = teamsMap[id];
  const asset: EndpointStore = assetsMap[id];
  const assetGroup: AssetGroupStore = assetGroupsMap[id];

  const groupedByExpectationType = (es: InjectExpectationsStore[]) => {
    return es.reduce((group, expectation) => {
      const { inject_expectation_type } = expectation;
      if (inject_expectation_type) {
        const values = group.get(inject_expectation_type) ?? [];
        values.push(expectation);
        group.set(inject_expectation_type, values);
      }
      return group;
    }, new Map());
  };

  return (
    <div key={id}>
      <ListItem
        divider
        sx={{ pl: 4 }}
        classes={{ root: classes.item }}
      >
        <ListItemIcon>
          {!!team && <CastForEducationOutlined fontSize="small" />}
          {!!asset && <DnsOutlined fontSize="small" />}
          {!!assetGroup && <LanOutlined fontSize="small" />}
        </ListItemIcon>
        <ListItemText
          primary={
            <div className={classes.bodyItem} style={{ width: '20%' }}>
              {team?.team_name || asset?.asset_name || assetGroup?.asset_group_name}
            </div>
          }
        />
      </ListItem>
      <List component="div" disablePadding>
        {Array.from(groupedByExpectationType(expectations)).map(([expectationType, es]) => {
          if (expectationType === 'ARTICLE') {
            const expectation = es[0];
            const article = articlesMap[expectation.inject_expectation_article] || {};
            const channel = channelsMap[article.article_channel] || {};
            return (
              <ChannelExpectation key={expectationType} channel={channel} article={article} expectation={expectation} />
            );
          }
          if (expectationType === 'CHALLENGE') {
            const expectation = es[0];
            const challenge = challengesMap[expectation.inject_expectation_challenge] || {};
            return (
              <ChallengeExpectation key={expectationType} challenge={challenge} expectation={expectation} />
            );
          }
          if (expectationType === 'PREVENTION' || expectationType === 'DETECTION') {
            const expectation = es[0];
            if (asset) {
              return (
                <TechnicalExpectationAsset
                  key={expectationType}
                  expectation={expectation}
                  injectContract={injectContract}
                />
              );
            }
            if (assetGroup) {
              const relatedExpectations = expectationsByInject.filter((e) => assetGroup.asset_group_assets?.includes(e.inject_expectation_asset ?? '')) ?? [];

              return (
                <TechnicalExpectationAssetGroup
                  key={expectationType}
                  expectation={expectation}
                  injectContract={injectContract}
                  relatedExpectations={relatedExpectations}
                  team={team}
                  assetGroup={assetGroup}
                />
              );
            }
            return (<div key={expectationType}></div>);
          }
          return (
            <ManualExpectations key={expectationType} exerciseId={exerciseId} inject={inject} expectations={es} />
          );
        })}
      </List>
    </div>
  );
};

export default TeamOrAssetLine;
