import classNames from 'classnames';
import { Card, CardActionArea, CardContent } from '@mui/material';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import ItemCategory from '../../../components/ItemCategory';
import { scenarioCategories } from './ScenarioForm';
import type { Theme } from '../../../components/Theme';
import { useFormatter } from '../../../components/i18n';
import type { ScenarioStatistic, SearchPaginationInput } from '../../../utils/api-types';
import { fetchScenarioStatistic } from '../../../actions/scenarios/scenario-actions';
import { FilterHelpers } from '../../../components/common/queryable/filter/FilterHelpers';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    overflow: 'hidden',
    width: 250,
    height: 100,
    marginRight: 20,
  },
  cardSelected: {
    border: `1px solid ${theme.palette.secondary.main}`,
  },
  area: {
    width: '100%',
    height: '100%',
  },
}));

export const CATEGORY_FILTER_KEY = 'scenario_category';

interface ScenarioCardProps {
  helpers: FilterHelpers;
  searchPaginationInput: SearchPaginationInput;
  category: string;
  count: number;
}

const ScenarioCard: FunctionComponent<ScenarioCardProps> = ({
  helpers,
  searchPaginationInput,
  category,
  count,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const handleOnClickCategory = () => {
    helpers.handleAddSingleValueFilter(
      CATEGORY_FILTER_KEY,
      category,
    );
  };

  const hasCategory = searchPaginationInput.filterGroup?.filters?.find((f) => f.key === CATEGORY_FILTER_KEY)?.values?.includes(category);

  return (
    <Card
      classes={{ root: classes.card }} variant="outlined"
      onClick={handleOnClickCategory}
      className={classNames({ [classes.cardSelected]: hasCategory })}
    >
      <CardActionArea classes={{ root: classes.area }}>
        <CardContent>
          <div style={{ marginBottom: 10 }}>
            <ItemCategory category={category} size="small" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {t(scenarioCategories.get(category) ?? category)}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500 }}>
            {count} {t('scenarios')}
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

interface ScenariosCardProps {
  helpers: FilterHelpers;
  searchPaginationInput: SearchPaginationInput;
}

const ScenariosCard: FunctionComponent<ScenariosCardProps> = ({
  helpers,
  searchPaginationInput,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const handleOnClickCategory = () => {
    helpers.handleAddMultipleValueFilter(
      CATEGORY_FILTER_KEY,
      [],
    );
  };

  const noCategory = () => {
    const categoryFilter = searchPaginationInput.filterGroup?.filters?.find((f) => f.key === CATEGORY_FILTER_KEY);
    if (categoryFilter) {
      return !categoryFilter.values || categoryFilter.values.length === 0;
    }
    return false;
  };

  // Statistic
  const [statistic, setStatistic] = useState<ScenarioStatistic>();
  const fetchStatistics = () => {
    fetchScenarioStatistic().then((result: { data: ScenarioStatistic }) => setStatistic(result.data));
  };
  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <div style={{ display: 'flex', marginBottom: 30 }}>
      <Card
        key="all"
        classes={{ root: classes.card }} variant="outlined"
        onClick={handleOnClickCategory}
        className={classNames({ [classes.cardSelected]: noCategory() })}
      >
        <CardActionArea classes={{ root: classes.area }}>
          <CardContent>
            <div style={{ marginBottom: 10 }}>
              <ItemCategory category="all" size="small" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {t('All categories')}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500 }}>
              {statistic?.scenarios_global_count ?? '-'} {t('scenarios')}
            </div>
          </CardContent>
        </CardActionArea>
      </Card>
      {Object.entries(statistic?.scenarios_attack_scenario_count ?? {}).map(([key, value]) => (
        <ScenarioCard
          key={key}
          helpers={helpers}
          searchPaginationInput={searchPaginationInput}
          category={key}
          count={value}
        />
      ))}
    </div>
  );
};

export default ScenariosCard;
