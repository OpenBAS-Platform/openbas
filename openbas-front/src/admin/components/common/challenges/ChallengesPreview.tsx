import {
  Alert,
  Button,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as R from 'ramda';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { fetchMe } from '../../../../actions/Application';
import { fetchSimulationObserverChallenges, tryChallenge } from '../../../../actions/Challenge';
import { fetchSimulationPlayerDocuments } from '../../../../actions/Document';
import { fetchExercise } from '../../../../actions/Exercise';
import { type ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import type { DocumentHelper, SimulationChallengesReaderHelper } from '../../../../actions/helper';
import Dialog from '../../../../components/common/Dialog';
import Empty from '../../../../components/Empty';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { useHelper } from '../../../../store';
import { type Challenge, type ChallengeResult, type ChallengeTryInput, type Exercise as ExerciseType, type SimulationChallengesReader } from '../../../../utils/api-types';
import { useQueryParameter } from '../../../../utils/Environment';
import { usePermissions } from '../../../../utils/Exercise';
import { useAppDispatch } from '../../../../utils/hooks';
import ChallengeTryForm from '../../components/challenges/ChallengeTryForm';
import ChallengeCard from './ChallengeCard';
import ChallengesPreviewDocumentsList from './ChallengesPreviewDocumentsList';

const useStyles = makeStyles()(theme => ({
  root: {
    position: 'relative',
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  logo: {
    width: 100,
    margin: '0px 0px 10px 0px',
  },
  container: {
    margin: '0 auto',
    width: '90%',
  },
}));

const ChallengesPreview = () => {
  const theme = useTheme();
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentResult, setCurrentResult] = useState<ChallengeResult | null>(null);
  const [userId, challengeId] = useQueryParameter(['user', 'challenge']);

  const { exerciseId } = useParams() as { exerciseId: ExerciseType['exercise_id'] };
  const { challengesReader, fullExercise }: {
    fullExercise: ExerciseType;
    challengesReader: SimulationChallengesReader;
  } = useHelper((helper: SimulationChallengesReaderHelper & DocumentHelper & ExercisesHelper) => ({
    fullExercise: helper.getExercise(exerciseId),
    challengesReader: helper.getChallengesReader(exerciseId),
  }));

  const { exercise_information: exercise, exercise_challenges: challenges } = challengesReader ?? {};

  // Pass the full exercise because the exercise is never loaded in the store at this point
  const permissions = usePermissions(exerciseId, fullExercise);

  const handleClose = () => {
    setCurrentChallenge(null);
    setCurrentResult(null);
  };

  useEffect(() => {
    dispatch(fetchMe());
    if (exerciseId) {
      dispatch(fetchExercise(exerciseId));
      dispatch(fetchSimulationObserverChallenges(exerciseId, userId));
      dispatch(fetchSimulationPlayerDocuments(exerciseId, userId));
    }
  }, [dispatch, exerciseId, userId]);

  const submit = (cid: string | undefined, data: ChallengeTryInput) => {
    if (cid) {
      return dispatch(tryChallenge(cid, data)).then((result: { result: ChallengeResult }) => {
        setCurrentResult(result.result);
      });
    }
    return null;
  };

  if (exercise) {
    const groupChallenges = R.groupBy(
      R.path(['challenge_detail', 'challenge_category']),
    );
    const sortedChallenges = groupChallenges(challenges);
    return (
      <div className={classes.root}>
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="secondary"
            variant="outlined"
            component={Link}
            to={`/challenges/${exerciseId}?challenge=${challengeId}&user=${userId}&preview=false`}
            style={{
              position: 'absolute',
              top: theme.spacing(2),
              right: theme.spacing(2),
            }}
          >
            {t('Switch to player mode')}
          </Button>
        )}
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="primary"
            variant="outlined"
            component={Link}
            to={`/admin/simulations/${exerciseId}/definition/challenges`}
            style={{
              position: 'absolute',
              top: theme.spacing(2),
              left: theme.spacing(2),
            }}
          >
            {t('Back to administration')}
          </Button>
        )}
        <div className={classes.container}>
          <div style={{
            margin: '0 auto',
            textAlign: 'center',
          }}
          >
            <img src={theme.logo} alt="logo" className={classes.logo} />
          </div>
          <Typography
            variant="h1"
            style={{
              textAlign: 'center',
              fontSize: 40,
            }}
          >
            {exercise.name}
          </Typography>
          <Typography
            variant="h2"
            style={{ textAlign: 'center' }}
          >
            {exercise.description}
          </Typography>
          {challenges && challenges.length === 0 && (
            <div style={{ marginTop: theme.spacing(19) }}>
              <Empty message={t('No challenge in this simulation yet.')} />
            </div>
          )}
          {Object.keys(sortedChallenges).map((category: string) => {
            return (
              <div key={category}>
                <Typography variant="h1" style={{ margin: '40px 0 30px 0' }}>
                  {category !== 'null' ? category : t('No category')}
                </Typography>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: theme.spacing(3),
                }}
                >
                  {sortedChallenges[category].map(({ challenge_detail: challenge }: { challenge_detail: Challenge }) => (
                    <ChallengeCard
                      key={challenge.challenge_id}
                      challenge={challenge}
                      onClick={() => {
                        setCurrentChallenge(challenge);
                      }}
                      clickable
                    />
                  ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Dialog
          open={currentChallenge !== null}
          handleClose={handleClose}
          maxWidth="md"
          title={currentChallenge?.challenge_name}
        >
          <>
            <ExpandableMarkdown
              source={currentChallenge?.challenge_content}
              limit={5000}
            />
            {(currentChallenge?.challenge_documents || []).length > 0 && (
              <div>
                <Typography variant="h2" style={{ marginTop: theme.spacing(3) }}>
                  {t('Documents')}
                </Typography>
                <ChallengesPreviewDocumentsList currentChallenge={currentChallenge} />
              </div>
            )}
            <Typography variant="h2" style={{ marginTop: theme.spacing(3) }}>
              {t('Results')}
            </Typography>
            {currentResult !== null && (
              <div>
                {currentResult.result === true ? (
                  <Alert severity="success">
                    {t('Flag is correct! It has been successfully submitted.')}
                  </Alert>
                ) : (
                  <Alert
                    severity="error"
                    onClose={() => setCurrentResult(null)}
                  >
                    {t('Flag is not correct! Try again...')}
                  </Alert>
                )}
                <div style={{
                  float: 'right',
                  marginTop: theme.spacing(2),
                }}
                >
                  <Button onClick={handleClose} style={{ marginRight: theme.spacing(1) }}>
                    {t('Close')}
                  </Button>
                </div>
              </div>
            )}
            {currentResult === null && (
              <ChallengeTryForm onSubmit={data => submit(currentChallenge?.challenge_id, data)} handleClose={handleClose} />
            )}
          </>
        </Dialog>
      </div>
    );
  }
  return <Loader />;
};

export default ChallengesPreview;
