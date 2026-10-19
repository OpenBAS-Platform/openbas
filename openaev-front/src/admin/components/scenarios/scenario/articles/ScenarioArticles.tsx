import { useParams } from 'react-router';

import { type ArticlesHelper } from '../../../../../actions/channels/article-helper';
import { useHelper } from '../../../../../store';
import { type Scenario } from '../../../../../utils/api-types';
import Articles from '../../../common/articles/Articles';
import { ArticleContext } from '../../../common/Context';
import useScenarioStoreData from '../scenarioStoreQueries';
import articleContextForScenario from './articleContextForScenario';

const ScenarioArticles = () => {
  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };
  const { articles } = useHelper((helper: ArticlesHelper) => ({ articles: helper.getScenarioArticles(scenarioId) }));
  useScenarioStoreData(scenarioId, ['articles', 'documents', 'channels']);
  const context = articleContextForScenario(scenarioId);
  return (
    <ArticleContext.Provider value={context}>
      <Articles articles={articles} />
    </ArticleContext.Provider>
  );
};

export default ScenarioArticles;
