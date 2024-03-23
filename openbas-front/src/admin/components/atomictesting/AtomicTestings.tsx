import React from 'react';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../utils/hooks';
import { useFormatter } from '../../../components/i18n';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import type { UsersHelper } from '../../../actions/helper';
import useDataLoader from '../../../utils/ServerSideEvent';
import Injects from '../components/injects/Injects';
import { InjectHelper } from '../../../actions/injects/inject-helper';
import { fetchInjectsForAtomicTestings } from '../../../actions/Inject';

const useStyles = makeStyles(() => ({}));

const AtomicTestings: React.FC = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  // Filter and sort hook
  const filtering = useSearchAnFilter('inject', 'title', ['title']);
  // Fetching data
  const { injects } = useHelper((helper: InjectHelper & UsersHelper) => ({
    injects: helper.getInjectsForAtomicTestings(),
  }));

  useDataLoader(() => {
    dispatch(fetchInjectsForAtomicTestings());
  });

  // Fetching data
  return (
    <Injects injects={injects} teams={undefined} articles={undefined} variables={undefined} uriVariable={undefined}
      allUsersNumber={undefined} usersNumber={undefined} teamsUsers={undefined}
    />
  );
};

export default AtomicTestings;
