import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import React from 'react';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { fetchScenarioArticles } from '../../../../../actions/channels/article-action';
import Articles from '../../../components/articles/Articles';
import { useAppDispatch } from '../../../../../utils/hooks';
import DefinitionMenu from '../../../components/DefinitionMenu';
import type { ArticlesHelper } from '../../../../../actions/channels/article-helper';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

const ScenarioArticles = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const articles = useHelper((helper: ArticlesHelper) => helper.getScenarioArticles(scenarioId));
  useDataLoader(() => {
    dispatch(fetchScenarioArticles(scenarioId));
  });

  return (
    <div className={classes.container}>
      <DefinitionMenu base="/admin/scenarios" id={scenarioId} />
      <Articles articles={articles} />
    </div>
  );
};

export default ScenarioArticles;
