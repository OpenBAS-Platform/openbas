import {
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
  AttachmentOutlined,
  CrisisAlertOutlined,
  DescriptionOutlined,
  EmojiEventsOutlined,
  OutlinedFlagOutlined,
  PendingActionsOutlined,
  SportsScoreOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as R from 'ramda';
import { useEffect, useState } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { fetchMe } from '../../../actions/Application';
import { fetchPlayerChallenges, validateChallenge } from '../../../actions/Challenge';
import { fetchPlayerDocuments } from '../../../actions/Document';
import DocumentType from '../../../admin/components/components/documents/DocumentType';
import Transition from '../../../components/common/Transition';
import Empty from '../../../components/Empty';
import ExpandableMarkdown from '../../../components/ExpandableMarkdown';
import OldTextField from '../../../components/fields/OldTextField';
import { useFormatter } from '../../../components/i18n';
import ItemTags from '../../../components/ItemTags';
import Loader from '../../../components/Loader';
import { useHelper } from '../../../store';
import { useQueryParameter } from '../../../utils/Environment';
import { usePermissions } from '../../../utils/Exercise';

const useStyles = makeStyles()(() => ({
  root: {
    position: 'relative',
    flexGrow: 1,
    padding: 20,
  },
  logo: {
    width: 100,
    margin: '0px 0px 10px 0px',
  },
  container: {
    margin: '0 auto',
    width: '90%',
  },
  flag: {
    fontSize: 12,
    float: 'left',
    marginRight: 7,
    maxWidth: 300,
  },
  card: { position: 'relative' },
  footer: {
    width: '100%',
    position: 'absolute',
    padding: '0 15px 0 15px',
    left: 0,
    bottom: 10,
  },
  button: { cursor: 'default' },
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItem: {
    height: '100%',
    fontSize: 13,
  },
}));

const inlineStylesHeaders = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  document_name: {
    float: 'left',
    width: '35%',
    fontSize: 12,
    fontWeight: '700',
  },
  document_type: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  document_tags: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  document_name: {
    float: 'left',
    width: '35%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_type: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_tags: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const ChallengesPlayer = () => {
  const theme = useTheme();
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [currentChallengeEntry, setCurrentChallengeEntry] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [userId, challengeId] = useQueryParameter(['user', 'challenge']);
  const [documentsSortBy, setDocumentsSortBy] = useState('document_name');
  const [documentsOrderAsc, setDocumentsOrderAsc] = useState(true);
  const { exerciseId } = useParams();
  const { challengesReader, documentsMap } = useHelper(helper => ({
    challengesReader: helper.getChallengesReader(exerciseId),
    documentsMap: helper.getDocumentsMap(),
  }));
  const { exercise_information: exercise, exercise_challenges: challenges } = challengesReader ?? {};
  const {
    challenge_detail: currentChallenge,
    challenge_expectation: currentExpectation,
  } = currentChallengeEntry ?? {};
  // Pass the full exercise because the exercise is never loaded in the store at this point
  const permissions = usePermissions(exerciseId, exercise);
  const handleClose = () => {
    setCurrentChallengeEntry(null);
    setCurrentResult(null);
  };
  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchPlayerChallenges(exerciseId, userId));
    dispatch(fetchPlayerDocuments(exerciseId, userId));
  }, []);
  const documentsReverseBy = (field) => {
    setDocumentsSortBy(field);
    setDocumentsOrderAsc(!documentsSortBy);
  };
  const documentsSortHeader = (field, label, isSortable) => {
    const sortComponent = documentsOrderAsc
      ? (
          <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
        )
      : (
          <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
        );
    if (isSortable) {
      return (
        <div
          style={inlineStylesHeaders[field]}
          onClick={() => documentsReverseBy(field)}
        >
          <span>{t(label)}</span>
          {documentsSortBy === field ? sortComponent : ''}
        </div>
      );
    }
    return (
      <div style={inlineStylesHeaders[field]}>
        <span>{t(label)}</span>
      </div>
    );
  };
  const validate = (values) => {
    const errors = {};
    const requiredFields = ['challenge_value'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  const submit = (cid, data) => {
    return dispatch(validateChallenge(exerciseId, cid, userId, data)).then(
      (result) => {
        const challengeEntries = result.entities?.challengesreaders[result.result]
          .exercise_challenges || [];
        setCurrentChallengeEntry(
          R.head(
            challengeEntries.filter(
              n => n.challenge_detail.challenge_id === cid,
            ),
          ),
        );
        setCurrentResult('submitted');
      },
    );
  };

  // Result
  const noResult = () => {
    return (currentExpectation?.inject_expectation_results?.length ?? 0) === 0 && currentResult === null;
  };
  const hasResult = () => {
    return (currentExpectation?.inject_expectation_results?.length ?? 0) > 0 || currentResult !== null;
  };
  const validResult = () => {
    return (currentExpectation?.inject_expectation_results?.length ?? 0) > 0;
  };
  const invalidResult = () => {
    return (currentExpectation?.inject_expectation_results?.length ?? 0) === 0 && currentResult !== null;
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
            to={`/challenges/${exerciseId}?challenge=${challengeId}&user=${userId}&preview=true`}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
            }}
          >
            {t('Switch to preview mode')}
          </Button>
        )}
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="primary"
            variant="outlined"
            component={Link}
            to={`/admin/exercises/${exerciseId}/definition`}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
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
            {exercise.exercise_name}
          </Typography>
          <Typography
            variant="h2"
            style={{ textAlign: 'center' }}
          >
            {exercise.exercise_subtitle}
          </Typography>
          {challenges.length === 0 && (
            <div style={{ marginTop: 150 }}>
              <Empty message={t('No challenge in this simulation yet.')} />
            </div>
          )}
          {Object.keys(sortedChallenges).map((category) => {
            return (
              <div key={category}>
                <Typography variant="h1" style={{ margin: '40px 0 30px 0' }}>
                  {category !== 'null' ? category : t('No category')}
                </Typography>
                <Grid container={true} spacing={3}>
                  {sortedChallenges[category].map((challengeEntry) => {
                    const challenge = challengeEntry.challenge_detail;
                    const expectation = challengeEntry.challenge_expectation;
                    return (
                      <Grid key={challenge.challenge_id} item={true} xs={4}>
                        <Card
                          variant="outlined"
                          classes={{ root: classes.card }}
                          sx={{
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          <CardActionArea
                            onClick={() => setCurrentChallengeEntry(challengeEntry)}
                          >
                            <CardHeader
                              avatar={(
                                <Avatar sx={{ bgcolor: '#e91e63' }}>
                                  <EmojiEventsOutlined />
                                </Avatar>
                              )}
                              title={challenge.challenge_name}
                              subheader={challenge.challenge_category}
                              action={(
                                <IconButton
                                  size="large"
                                  color={
                                    (expectation?.inject_expectation_results?.length ?? 0) > 0
                                      ? 'success'
                                      : 'inherit'
                                  }
                                >
                                  <PendingActionsOutlined fontSize="large" />
                                </IconButton>
                              )}
                            />
                            <CardContent style={{ margin: '-20px 0 30px 0' }}>
                              <ExpandableMarkdown
                                source={challenge.challenge_content}
                                limit={500}
                                controlled={true}
                              />
                              <div className={classes.footer}>
                                <div style={{ float: 'left' }}>
                                  {challenge.challenge_flags.map((flag) => {
                                    return (
                                      <Tooltip
                                        key={flag.flag_id}
                                        title={t(flag.flag_type)}
                                      >
                                        <Chip
                                          icon={<OutlinedFlagOutlined />}
                                          classes={{ root: classes.flag }}
                                          variant="outlined"
                                          label={t(flag.flag_type)}
                                        />
                                      </Tooltip>
                                    );
                                  })}
                                </div>
                                <div style={{ float: 'right' }}>
                                  <Button
                                    size="small"
                                    startIcon={<SportsScoreOutlined />}
                                    className={classes.button}
                                  >
                                    {challenge.challenge_score || 0}
                                  </Button>
                                  <Button
                                    size="small"
                                    startIcon={<CrisisAlertOutlined />}
                                    className={classes.button}
                                  >
                                    {challenge.challenge_max_attempts || 0}
                                  </Button>
                                  <Button
                                    size="small"
                                    startIcon={<DescriptionOutlined />}
                                    className={classes.button}
                                  >
                                    {challenge.challenge_documents.length || 0}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </div>
            );
          })}
        </div>
        <Dialog
          TransitionComponent={Transition}
          open={currentChallengeEntry !== null}
          onClose={handleClose}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{currentChallenge?.challenge_name}</DialogTitle>
          <DialogContent>
            <ExpandableMarkdown
              source={currentChallenge?.challenge_content}
              limit={5000}
            />
            {(currentChallenge?.challenge_documents || []).length > 0 && (
              <div>
                <Typography variant="h2" style={{ marginTop: 30 }}>
                  {t('Documents')}
                </Typography>
                <List>
                  <ListItem
                    classes={{ root: classes.itemHead }}
                    divider={false}
                    style={{ paddingTop: 0 }}
                  >
                    <ListItemIcon>
                      <span
                        style={{
                          padding: '0 8px 0 8px',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        &nbsp;
                      </span>
                    </ListItemIcon>
                    <ListItemText
                      primary={(
                        <div>
                          {documentsSortHeader('document_name', 'Name', true)}
                          {documentsSortHeader('document_type', 'Type', true)}
                          {documentsSortHeader('document_tags', 'Tags', true)}
                        </div>
                      )}
                    />
                  </ListItem>
                  {(currentChallenge?.challenge_documents || []).map(
                    (documentId) => {
                      const document = documentsMap[documentId] || {};
                      return (
                        <ListItem
                          key={document.document_id}
                          classes={{ root: classes.item }}
                          divider={true}
                          button={true}
                          component="a"
                          href={`/api/documents/${document.document_id}/file`}
                        >
                          <ListItemIcon>
                            <AttachmentOutlined />
                          </ListItemIcon>
                          <ListItemText
                            primary={(
                              <div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.document_name}
                                >
                                  {document.document_name}
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.document_type}
                                >
                                  <DocumentType
                                    type={document.document_type}
                                    variant="list"
                                  />
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.document_tags}
                                >
                                  <ItemTags
                                    variant="list"
                                    tags={document.document_tags}
                                  />
                                </div>
                              </div>
                            )}
                          />
                        </ListItem>
                      );
                    },
                  )}
                </List>
              </div>
            )}
            <Typography variant="h2" style={{ marginTop: 30 }}>
              {t('Results')}
            </Typography>
            {hasResult() && (
              <div>
                {validResult() && (
                  <Alert severity="success">
                    {t('Flag is correct! It has been successfully submitted.')}
                  </Alert>
                )}
                {invalidResult() && (
                  <Alert
                    severity="error"
                    onClose={() => setCurrentResult(null)}
                  >
                    {t('Flag is not correct! Try again...')}
                  </Alert>
                )}
                <div style={{
                  float: 'right',
                  marginTop: 20,
                }}
                >
                  <Button onClick={handleClose} style={{ marginRight: 10 }}>
                    {t('Close')}
                  </Button>
                </div>
              </div>
            )}
            {noResult() && (
              <Form
                keepDirtyOnReinitialize={true}
                onSubmit={data => submit(currentChallenge?.challenge_id, data)}
                validate={validate}
                mutators={{
                  setValue: ([field, value], state, { changeValue }) => {
                    changeValue(state, field, () => value);
                  },
                }}
              >
                {({ handleSubmit, submitting, errors }) => (
                  <form id="challengeForm" onSubmit={handleSubmit}>
                    <OldTextField
                      variant="standard"
                      name="challenge_value"
                      fullWidth={true}
                      label={t('Flag')}
                    />
                    <div style={{
                      float: 'right',
                      marginTop: 20,
                    }}
                    >
                      <Button
                        onClick={handleClose}
                        style={{ marginRight: 10 }}
                        disabled={submitting}
                      >
                        {t('Cancel')}
                      </Button>
                      <Button
                        color="secondary"
                        type="submit"
                        disabled={
                          submitting || Object.keys(errors).length > 0
                        }
                      >
                        {t('Submit')}
                      </Button>
                    </div>
                  </form>
                )}
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  return <Loader />;
};

export default ChallengesPlayer;
