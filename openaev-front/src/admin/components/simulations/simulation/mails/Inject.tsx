import { Button } from '@filigran/design-system';
import { ReplyOutlined } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, Grid, Paper, Typography } from '@mui/material';
import { type FunctionComponent, useContext, useState } from 'react';
import { useParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { fetchInjectCommunications } from '../../../../../actions/Communication';
import { type CommunicationHelper } from '../../../../../actions/communications/communication-helper';
import { type ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import { type UserHelper } from '../../../../../actions/helper';
import { executeInject } from '../../../../../actions/Inject';
import { type InjectHelper } from '../../../../../actions/injects/inject-helper';
import { SectionLabel } from '../../../../../components/common/detail/EntityDetailCommon';
import Transition from '../../../../../components/common/Transition';
import { useFormatter } from '../../../../../components/i18n';
import ItemTags from '../../../../../components/ItemTags';
import Loader from '../../../../../components/Loader';
import { useHelper } from '../../../../../store';
import { type Communication as CommunicationType, type Exercise } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { simulationKey } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';
import { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../../utils/query/useNotifiedQuery';
import useStoreQuery from '../../../../../utils/query/useStoreQuery';
import { isFeatureEnabled } from '../../../../../utils/utils';
import { PermissionsContext } from '../../../common/Context';
import ExecutionMenu from '../ExecutionMenu';
import useSimulationStoreData from '../simulationStoreQueries';
import CommunicationItem from './Communication';
import CommunicationForm from './CommunicationForm';

const useStyles = makeStyles()(theme => ({
  container: {
    margin: theme.spacing(0, 0, 6.25, 0),
    padding: theme.spacing(0, 25, 0, 0),
  },
  section: { marginTop: 0 },
  mailsSection: { marginTop: theme.spacing(5) },
  replyAction: { marginBottom: theme.spacing(2.5) },
  paper: {
    position: 'relative',
    padding: theme.spacing(2.5, 2.5, 0, 2.5),
    overflow: 'hidden',
    height: '100%',
  },
}));

// Communication enriched with the list of sender/recipient email addresses
type CommunicationWithMails = CommunicationType & { communication_mails: string[] };

// Topic = a root communication with its replies attached
type Topic = CommunicationWithMails & { communication_communications: CommunicationWithMails[] };

type ReplyFormData = {
  communication_subject: string;
  communication_content: string;
  communication_file?: File[];
};

// Store query of the communications of one inject, under the simulation key.
const injectCommunicationsKey = (simulationId: string, injectId: string) => [...simulationKey(simulationId), 'communications', injectId] as const;

const InjectComponent: FunctionComponent = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const [reply, setReply] = useState<string | null>(null);
  const { t, fndt, fldt } = useFormatter();
  const { injectId, exerciseId } = useParams() as {
    injectId: string;
    exerciseId: string;
  };
  const { permissions } = useContext(PermissionsContext);

  // Fetching data
  const { exercise, inject, communications, usersMap } = useHelper(
    (helper: ExercisesHelper & InjectHelper & UserHelper & CommunicationHelper) => ({
      exercise: helper.getExercise(exerciseId),
      inject: helper.getInject(injectId),
      communications: helper.getInjectCommunications(injectId),
      usersMap: helper.getUsersMap(),
    }),
  );

  // With live updates on, store queries under simulationKey(id): the topic 'simulation:<id>'
  // announces new communications (mails received or sent); the fallback interval covers the rest
  // while the simulation runs. With live updates off, the data loaders load them as before.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const refetchInterval = exercise?.exercise_status === 'RUNNING' ? FALLBACK_REFETCH_INTERVAL_MS : false;
  useSimulationStoreData(exerciseId, ['injects', 'all-players'], { refetchInterval });
  useStoreQuery(injectCommunicationsKey(exerciseId, injectId), () => dispatch(fetchInjectCommunications(exerciseId, injectId)), {
    enabled: liveUpdates,
    refetchInterval,
  });
  useDataLoader(() => {
    if (!liveUpdates) {
      dispatch(fetchInjectCommunications(exerciseId, injectId));
    }
  });

  // --- Event handlers ---

  const handleOpenReply = (communicationId: string) => setReply(communicationId);
  const handleCloseReply = () => setReply(null);

  const onSubmitReply = (topic: Topic, data: ReplyFormData) => {
    const lastCommunication: CommunicationWithMails = topic.communication_communications.length > 0
      ? topic.communication_communications[0]
      : topic;

    let body = data.communication_content;
    body += `<br />
               <hr style=3D"display:inline-block;width:98%" tabindex=3D"-1">
               <div id=3D"divRplyFwdMsg" dir=3D"ltr">
               <font face=3D"Calibri, sans-serif" style=3D"font-size:11pt">
                 <b>From:</b> ${lastCommunication.communication_from
                    .replaceAll('<', '&lt;')
                    .replaceAll('>', '&gt;')}
                 <br><b>Sent:</b> ${fldt(lastCommunication.communication_sent_at)}
                 <br><b>Subject:</b> ${lastCommunication.communication_subject}
               </font>
               </div>
               <blockquote>
                 <div dir=3D"ltr">
                   <div class=3D"x_elementToProof" style=3D"font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt;">
                   ${lastCommunication.communication_content && lastCommunication.communication_content.length > 10
                      ? lastCommunication.communication_content.replaceAll('\n', '<br />')
                      : lastCommunication.communication_content_html}
                   </div>
                 </div>
               </blockquote>`;

    const inputValues = {
      inject_title: 'Manual email',
      inject_description: 'Manual email',
      inject_injector_contract: inject.inject_injector_contract?.injector_contract_id,
      inject_content: {
        inReplyTo: lastCommunication.communication_message_id,
        subject: data.communication_subject,
        body,
      },
      inject_users: topic.communication_users,
    };

    return dispatch(executeInject(exerciseId, inputValues, data.communication_file ?? null))
      .then(() => {
        handleCloseReply();
        // The reply is a new inject and communication that the response does not carry: refetch
        // the screen at once instead of waiting for the stream.
        if (liveUpdates) {
          queryClient.invalidateQueries({ queryKey: simulationKey(exerciseId) });
        }
      });
  };

  if (!inject || !communications) {
    return (
      <div className={classes.container}>
        <ExecutionMenu exerciseId={exerciseId} />
        <Loader />
      </div>
    );
  }

  // --- Data derivation ---

  // Attach flattened email addresses to each communication
  const communicationsWithMails: CommunicationWithMails[] = communications.map(
    (comm: CommunicationType) => ({
      ...comm,
      communication_mails: (comm.communication_users ?? []).map(
        (userId: string) => (usersMap[userId]?.user_email ?? '').toLowerCase(),
      ),
    }),
  );

  // Group: keep only root threads (no "re: " prefix), attach matching replies sorted by date desc
  const topics: Topic[] = communicationsWithMails
    .filter(comm => !comm.communication_subject?.toLowerCase().includes('re: '))
    .map((rootComm) => {
      const replies = communicationsWithMails
        .filter(comm =>
          comm.communication_subject?.toLowerCase().includes('re: ')
          && (
            (comm.communication_animation
              && rootComm.communication_mails.some(mail =>
                comm.communication_to.toLowerCase().includes(mail),
              ))
              || rootComm.communication_mails.some(mail =>
                comm.communication_from.toLowerCase().includes(mail),
              )
          ),
        )
        .sort((a, b) =>
          new Date(b.communication_received_at).getTime() - new Date(a.communication_received_at).getTime(),
        );

      return {
        ...rootComm,
        communication_communications: replies,
      };
    });

  const currentTopic: Topic | undefined = reply
    ? topics.find(n => n.communication_id === reply)
    : undefined;

  const defaultSubject = currentTopic ? `Re: ${currentTopic.communication_subject}` : '';

  return (
    <div className={classes.container}>
      <ExecutionMenu exerciseId={exerciseId} />
      <Grid container={true} spacing={3}>
        <Grid size={6} className={classes.section}>
          <SectionLabel>{t('Inject context')}</SectionLabel>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container={true} spacing={3}>
              <Grid size={6}>
                <Typography variant="h3">{t('Title')}</Typography>
                {inject.inject_title}
              </Grid>
              <Grid size={6}>
                <Typography variant="h3">{t('Description')}</Typography>
                {inject.inject_description}
              </Grid>
              <Grid size={6}>
                <Typography variant="h3">{t('Sent at')}</Typography>
                {fndt(inject.inject_sent_at)}
              </Grid>
              <Grid size={6}>
                <Typography variant="h3">{t('Sender email address')}</Typography>
                {(exercise as Exercise).exercise_mail_from}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={6} className={classes.section}>
          <SectionLabel>{t('Inject details')}</SectionLabel>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container={true} spacing={3}>
              <Grid size={6}>
                <Typography variant="h3">{t('Targeted players')}</Typography>
                {inject.inject_users_number}
              </Grid>
              <Grid size={6}>
                <Typography variant="h3">{t('Tags')}</Typography>
                <ItemTags tags={inject.inject_tags} />
              </Grid>
              <Grid size={6}>
                <Typography variant="h3">{t('Documents')}</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="h3">{t('Teams')}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <br />

      <div className={classes.mailsSection}>
        <SectionLabel>{t('Mails')}</SectionLabel>
        <div className="clearfix" />
        {topics.map((topic) => {
          const topicUsers = (topic.communication_users ?? []).map(
            (userId: string) => usersMap[userId] ?? {},
          );
          return (
            <div key={topic.communication_id}>
              <CommunicationItem
                communication={topic}
                communicationUsers={topicUsers}
                isTopic={true}
              />
              {topic.communication_communications.slice().reverse().map((comm) => {
                const commUsers = (comm.communication_users ?? []).map(
                  (userId: string) => usersMap[userId] ?? {},
                );
                return (
                  <CommunicationItem
                    key={comm.communication_id}
                    communication={comm}
                    communicationUsers={commUsers}
                    isTopic={false}
                  />
                );
              })}
              {permissions.canManage && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
                >
                  <Button type="button" priority="secondary" startIcon={<ReplyOutlined fontSize="small" />} className={classes.replyAction} onClick={() => handleOpenReply(topic.communication_id)}>
                    {t('Reply')}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog
        open={reply !== null}
        slots={{ transition: Transition }}
        onClose={handleCloseReply}
        fullWidth={true}
        maxWidth="md"
        slotProps={{ paper: { elevation: 1 } }}
      >
        <DialogTitle>{t('Reply')}</DialogTitle>
        <DialogContent style={{ overflow: 'hidden' }}>
          {currentTopic && (
            <CommunicationForm
              initialValues={{
                communication_subject: defaultSubject,
                communication_content: '',
              }}
              onSubmit={(data: ReplyFormData) => onSubmitReply(currentTopic, data)}
              handleClose={handleCloseReply}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InjectComponent;
