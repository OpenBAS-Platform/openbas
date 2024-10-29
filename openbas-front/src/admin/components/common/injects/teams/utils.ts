import { useTheme } from '@mui/styles';
import * as R from 'ramda';

import type { TeamStore } from '../../../../../actions/teams/Team';
import type { Theme } from '../../../../../components/Theme';
import { colors } from '../../../../../utils/Charts';

// eslint-disable-next-line import/prefer-default-export
export const getTeamsColors: (teams: TeamStore[]) => Record<string, string> = (teams: TeamStore[]) => {
  const theme = useTheme<Theme>();

  const mapIndexed = R.addIndex(R.map);
  return R.pipe(
    mapIndexed((a: TeamStore, index: number) => [
      a.team_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(teams);
};
