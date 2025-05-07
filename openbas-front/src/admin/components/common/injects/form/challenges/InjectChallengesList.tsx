import { EmojiEventsOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import { type ChallengeHelper } from '../../../../../../actions/helper';
import { useFormatter } from '../../../../../../components/i18n';
import ItemTags from '../../../../../../components/ItemTags';
import { useHelper } from '../../../../../../store';
import type { Challenge } from '../../../../../../utils/api-types';
import ChallengePopover from '../../../../components/challenges/ChallengePopover';
import InjectAddChallenges from './InjectAddChallenges';

const useStyles = makeStyles()(theme => ({
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
  },
  bodyItem: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: theme.typography.h3.fontSize,
  },
}));

interface Props { readOnly?: boolean }

const InjectChallengesList = ({ readOnly = false }: Props) => {
  const { t } = useFormatter();
  const { control, setValue } = useFormContext();
  const { classes } = useStyles();
  const [sortedChallenges, setSortedChallenges] = useState<Challenge[]>([]);

  const injectChallengeIds = useWatch({
    control,
    name: 'inject_content.challenges',
  }) as string[];
  const { challengesMap } = useHelper((helper: ChallengeHelper) => ({ challengesMap: helper.getChallengesMap() }));

  useEffect(() => {
    const challenges: Challenge[] = (injectChallengeIds ?? [])
      .map(a => challengesMap[a])
      .filter(a => a !== undefined)
      .toSorted((a, b) => (a.challenge_name ?? '').localeCompare(b.challenge_name ?? ''));

    setSortedChallenges(challenges);
  }, [injectChallengeIds]);

  const addChallenge = (ids: string[]) => setValue('inject_content.challenges', [...ids, ...injectChallengeIds]);
  const removeChallenge = (challengeId: string) => setValue('inject_content.challenges', injectChallengeIds.filter(id => id !== challengeId));

  return (
    <>
      <List>
        {sortedChallenges.map(challenge => (
          <ListItem
            key={challenge.challenge_id}
            divider
            secondaryAction={(
              <ChallengePopover
                inline
                challenge={challenge}
                onRemoveChallenge={removeChallenge}
                disabled={readOnly}
              />
            )}
          >
            <ListItemIcon>
              <EmojiEventsOutlined />
            </ListItemIcon>
            <ListItemText
              primary={(
                <div className={classes.columns}>
                  <div className={classes.bodyItem}>
                    {t(challenge.challenge_category ?? 'Unknown')}
                  </div>
                  <div className={classes.bodyItem}>
                    {challenge.challenge_name}
                  </div>
                  <div className={classes.bodyItem}>
                    <ItemTags
                      variant="reduced-view"
                      tags={challenge.challenge_tags}
                    />
                  </div>
                </div>
              )}
            />
          </ListItem>
        ))}
      </List>
      <InjectAddChallenges
        injectChallengesIds={injectChallengeIds ?? []}
        handleAddChallenges={addChallenge}
        disabled={readOnly}
      />
    </>

  );
};

export default InjectChallengesList;
