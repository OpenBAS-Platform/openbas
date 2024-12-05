import { useParams } from 'react-router';

import { fetchScenarioArticles } from '../../../../../actions/channels/article-action';
import type { ArticlesHelper } from '../../../../../actions/channels/article-helper';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { useHelper } from '../../../../../store';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import Articles from '../../../common/articles/Articles';
import { ArticleContext } from '../../../common/Context';
import articleContextForScenario from './articleContextForScenario';

const ScenarioArticles = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const articles = useHelper((helper: ArticlesHelper) => helper.getScenarioArticles(scenarioId));
  useDataLoader(() => {
    dispatch(fetchScenarioArticles(scenarioId));
  });
  const context = articleContextForScenario(scenarioId);
  return (
    <ArticleContext.Provider value={context}>
      <Articles articles={articles} />
    </ArticleContext.Provider>
  );
};

export default ScenarioArticles;
