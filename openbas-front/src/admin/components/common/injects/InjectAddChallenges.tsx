import { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { ControlPointOutlined, EmojiEventsOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import SearchFilter from '../../../../components/SearchFilter';
import { useFormatter } from '../../../../components/i18n';
import { fetchChallenges } from '../../../../actions/Challenge';
import CreateChallenge from '../../components/challenges/CreateChallenge';
import { truncate } from '../../../../utils/String';
import Transition from '../../../../components/common/Transition';
import TagsFilter from '../filters/TagsFilter';
import type { Theme } from '../../../../components/Theme';
import type { Option } from '../../../../utils/Option';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ChallengeHelper } from '../../../../actions/helper';
import { PermissionsContext } from '../Context';
import type { Challenge } from '../../../../utils/api-types';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    width: '100%',
    minHeight: '100%',
    padding: 20,
    border: '1px dashed rgba(255, 255, 255, 0.3)',
  },
  chip: {
    margin: '0 10px 10px 0',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

interface Props {
  handleAddChallenges: (challengeIds: string[]) => void;
  injectChallengesIds: string[];
}

const InjectAddChallenges: FunctionComponent<Props> = ({
  handleAddChallenges,
  injectChallengesIds,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);

  const { challenges, challengesMap } = useHelper((helper: ChallengeHelper) => ({
    challenges: helper.getChallenges(),
    challengesMap: helper.getChallengesMap(),
  }));

  useDataLoader(() => {
    dispatch(fetchChallenges());
  });

  const [open, setopen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [challengesIds, setChallengesIds] = useState<string[]>([]);
  const [tags, setTags] = useState<Option[]>([]);

  const handleOpen = () => setopen(true);

  const handleClose = () => {
    setopen(false);
    setKeyword('');
    setChallengesIds([]);
  };

  const handleSearchChallenges = (value?: string) => {
    setKeyword(value || '');
  };

  const handleAddTag = (value: Option) => {
    if (value) {
      setTags([value]);
    }
  };

  const handleClearTag = () => {
    setTags([]);
  };

  const addChallenge = (challengeId: string) => {
    setChallengesIds(R.append(challengeId, challengesIds));
  };

  const removeChallenge = (challengeId: string) => {
    setChallengesIds(challengesIds.filter((u) => u !== challengeId));
  };

  const submitAddChallenges = () => {
    handleAddChallenges(challengesIds);
    handleClose();
  };

  const onCreate = (result: string) => {
    addChallenge(result);
  };

  const filterByKeyword = (n: Challenge) => keyword === ''
    || (n.challenge_name || '').toLowerCase().indexOf(keyword.toLowerCase())
    !== -1
    || (n.challenge_content || '')
      .toLowerCase()
      .indexOf(keyword.toLowerCase()) !== -1
    || (n.challenge_category || '')
      .toLowerCase()
      .indexOf(keyword.toLowerCase()) !== -1;
  const filteredChallenges = R.pipe(
    R.filter(
      (n: Challenge) => tags.length === 0
        || R.any(
          (filter: string) => R.includes(filter, n.challenge_tags),
          R.pluck('id', tags),
        ),
    ),
    R.filter(filterByKeyword),
    R.take(10),
  )(challenges);
  return (
    <div>
      <ListItem
        classes={{ root: classes.item }}
        button
        divider
        onClick={handleOpen}
        color="primary"
        disabled={permissions.readOnly}
      >
        <ListItemIcon color="primary">
          <ControlPointOutlined color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={t('Add challenges')}
          classes={{ primary: classes.text }}
        />
      </ListItem>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          elevation: 1,
          sx: {
            minHeight: 580,
            maxHeight: 580,
          },
        }}
      >
        <DialogTitle>{t('Add challenge in this inject')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} style={{ marginTop: -15 }}>
            <Grid item xs={8}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <SearchFilter
                    onChange={handleSearchChallenges}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TagsFilter
                    onAddTag={handleAddTag}
                    onClearTag={handleClearTag}
                    currentTags={tags}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <List>
                {filteredChallenges.map((challenge: Challenge) => {
                  const disabled = challengesIds.includes(challenge.challenge_id)
                    || injectChallengesIds.includes(challenge.challenge_id);
                  return (
                    <ListItem
                      key={challenge.challenge_id}
                      disabled={disabled}
                      button
                      divider
                      dense
                      onClick={() => addChallenge(challenge.challenge_id)}
                    >
                      <ListItemIcon>
                        <EmojiEventsOutlined />
                      </ListItemIcon>
                      <ListItemText
                        primary={challenge.challenge_name}
                        secondary={challenge.challenge_category}
                      />
                    </ListItem>
                  );
                })}
                <CreateChallenge
                  inline
                  onCreate={onCreate}
                />
              </List>
            </Grid>
            <Grid item xs={4}>
              <Box className={classes.box}>
                {challengesIds.map((challengeId) => {
                  const challenge = challengesMap[challengeId];
                  return (
                    <Chip
                      key={challengeId}
                      onDelete={() => removeChallenge(challengeId)}
                      label={truncate(challenge?.challenge_name || '', 22)}
                      icon={<EmojiEventsOutlined />}
                      classes={{ root: classes.chip }}
                    />
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('Cancel')}</Button>
          <Button
            color="secondary"
            onClick={submitAddChallenges}
          >
            {t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InjectAddChallenges;
