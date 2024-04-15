import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PlayArrowOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingOutput, InjectStatus, InjectStatusExecution } from '../../../../utils/api-types';
import { fetchAtomicTesting, tryAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import AtomicPopover from './Popover';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  containerTitle: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  title: {
    textTransform: 'uppercase',
    marginTop: 5,
    marginBottom: 5,
  },
}));

const AtomicTestingHeader = () => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { atomicId } = useParams() as { atomicId: AtomicTestingOutput['atomic_id'] };
  const [injectResult, setInjectResult] = useState<InjectStatus | null>(null);
  const [openResult, setOpenResult] = useState(false);

  // Fetching data
  const { atomic }: { atomic: AtomicTestingOutput } = useHelper((helper: AtomicTestingHelper) => ({
    atomic: helper.getAtomicTesting(atomicId),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTesting(atomicId));
  });

  // Launch atomic testing
  const [open, setOpen] = useState(false);
  const [availableLaunch, setAvailableLaunch] = useState(true);

  const submitTry = () => {
    setOpen(false);
    setAvailableLaunch(false);
    dispatch(tryAtomicTesting(atomic.atomic_id)).then((payload: InjectStatus) => {
      setInjectResult(payload);
      setOpenResult(true);
    });
  };

  const handleCloseResult = () => {
    setOpenResult(false);
    setInjectResult(null);
    setAvailableLaunch(true);
  };

  return (
    <div className={classes.container}>
      <div className={classes.containerTitle}>
        <Typography variant="h1" gutterBottom classes={{ root: classes.title }}>
          {atomic.atomic_title}
        </Typography>
        <AtomicPopover atomic={atomic} />
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          TransitionComponent={Transition}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              <span>{t('Do you want to try this inject?')}</span>
            </DialogContentText>
            <Alert severity="info" style={{ marginTop: 20 }}>
              {t('The inject will only be sent to you.')}
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              onClick={submitTry}
            >
              {t('Confirm')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openResult}
          TransitionComponent={Transition}
          onClose={handleCloseResult}
          fullWidth
          maxWidth="md"
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            {/* TODO: selectable={false} */}
            <Table size="small">
              {/* TODO: displayRowCheckbox={false} */}
              <TableBody>
                {injectResult
                  && Object.entries(injectResult).map(
                    ([key, value]) => {
                      if (key === 'status_traces') {
                        return (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>
                              {/* TODO: selectable={false} */}
                              <Table size="small" key={key}>
                                {/* TODO: displayRowCheckbox={false} */}
                                <TableBody>
                                  <>
                                    {value?.filter((trace: InjectStatusExecution) => !!trace.execution_message)
                                      .map((trace: InjectStatusExecution) => (
                                        <TableRow key={trace.execution_category}>
                                          <TableCell>
                                            {trace.execution_message}
                                          </TableCell>
                                          <TableCell>
                                            {trace.execution_status}
                                          </TableCell>
                                          <TableCell>{trace.execution_time}</TableCell>
                                        </TableRow>
                                      ))}
                                  </>
                                </TableBody>
                              </Table>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return (
                        <TableRow key={key}>
                          <TableCell>{key}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      );
                    },
                  )}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResult}>
              {t('Close')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <Button
        variant="contained"
        startIcon={<PlayArrowOutlined />}
        color="info"
        onClick={() => setOpen(true)}
        sx={{ width: 120, height: 40 }}
        disabled={!availableLaunch}
      >
        {t('Launch')}
      </Button>
    </div>
  );
};

export default AtomicTestingHeader;
