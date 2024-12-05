import { DeleteOutlined, MarkEmailReadOutlined } from '@mui/icons-material';
import { IconButton, List, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FunctionComponent, useState } from 'react';
import { Link } from 'react-router';

import { deleteComcheck, fetchComchecks } from '../../../../../actions/Comcheck';
import type { ComCheckHelper } from '../../../../../actions/comchecks/comcheck-helper';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import DialogDelete from '../../../../../components/common/DialogDelete';
import Empty from '../../../../../components/Empty';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import type { Comcheck } from '../../../../../utils/api-types';
import { usePermissions } from '../../../../../utils/Exercise';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import ComcheckState from '../controls/ComcheckState';

const useStyles = makeStyles(() => ({
  item: {
    height: 50,
  },
  bodyContainer: {
    display: 'flex',
  },
  bodyItem: {
    lineHeight: '25px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

interface Props {
  exercise: ExerciseStore;
}

const ExerciseControlComChecks: FunctionComponent<Props> = ({
  exercise,
}) => {
  // Standard hooks
  const { t, nsd } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Fetching data
  const { comchecks } = useHelper((helper: ComCheckHelper) => {
    const com = helper.getExerciseComchecks(exercise.exercise_id);
    return { comchecks: com };
  });
  useDataLoader(() => {
    dispatch(fetchComchecks(exercise.exercise_id));
  });

  const permissions = usePermissions(exercise.exercise_id);
  const [openComcheckDelete, setOpenComcheckDelete] = useState<string | null>(null);

  const submitComcheckDelete = () => {
    dispatch(deleteComcheck(exercise.exercise_id, openComcheckDelete));
    setOpenComcheckDelete(null);
  };

  return (
    <>
      {comchecks.length > 0 ? (
        <List style={{ paddingTop: 0 }}>
          {comchecks.map((comcheck: Comcheck) => (
            <ListItemButton
              key={comcheck.comcheck_id}
              dense
              classes={{ root: classes.item }}
              divider
              component={Link}
              to={`/admin/simulations/${exercise.exercise_id}/controls/comchecks/${comcheck.comcheck_id}`}
            >
              <ListItemIcon>
                <MarkEmailReadOutlined />
              </ListItemIcon>
              <ListItemText
                primary={(
                  <div className={classes.bodyContainer}>
                    <div
                      className={classes.bodyItem}
                      style={{ width: '30%' }}
                    >
                      {comcheck.comcheck_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={{ width: '15%' }}
                    >
                      {nsd(comcheck.comcheck_end_date)}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={{ width: '20%' }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {comcheck.comcheck_users_number}
                        {' '}
&nbsp;
                      </span>
                      {t('players')}
                    </div>
                    <div className={classes.bodyItem}>
                      <ComcheckState
                        state={comcheck.comcheck_state}
                        variant="list"
                      />
                    </div>
                  </div>
                )}
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => setOpenComcheckDelete(comcheck.comcheck_id)}
                  aria-haspopup="true"
                  size="large"
                  disabled={permissions.readOnlyBypassStatus}
                >
                  <DeleteOutlined />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Empty message={t('No comcheck in this simulation.')} />
      )}
      <DialogDelete
        open={Boolean(openComcheckDelete)}
        handleClose={() => setOpenComcheckDelete(null)}
        handleSubmit={submitComcheckDelete}
        text={t('Do you want to delete this comcheck?')}
      />
    </>
  );
};

export default ExerciseControlComChecks;
