import React, { CSSProperties } from 'react';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../utils/hooks';
import { useFormatter } from '../../../components/i18n';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import Injects from '../components/injects/Injects';
import { fetchAtomicInjects } from '../../../actions/Inject';
import type { InjectHelper } from '../../../actions/injects/inject-helper';

const useStyles = makeStyles(() => ({
}));

const inlineStylesHeaders: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  test_title: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  test_type: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  test_date: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  test_assets: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  test_players: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  test_status: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  test_tags: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },

};

const inlineStyles: Record<string, CSSProperties> = {
  scenario_name: {
    width: '25%',
  },
  scenario_subtitle: {
    width: '25%',
  },
  scenario_description: {
    width: '25%',
  },
  scenario_tags: {
    width: '25%',
  },
};

const AtomicTestings: React.FC = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  // Filter and sort hook
  const filtering = useSearchAnFilter('inject', 'title', ['title']);
  // Fetching data
  const { injects } = useHelper((helper: InjectHelper) => ({
    injects: helper.getAtomicInjects(),
  }));

  useDataLoader(() => {
    dispatch(fetchAtomicInjects());
  });

  // Fetching data
  return (
    <Injects injects={injects} teams={null} articles={null} variables={null} uriVariable={null}
      allUsersNumber={null} usersNumber={null} teamsUsers={null}
    />
  );
};

export default AtomicTestings;
