import * as R from 'ramda';

import type { TeamStore } from '../../../../../actions/teams/Team';
import type { Theme } from '../../../../../components/Theme';
import type { Organization } from '../../../../../utils/api-types';
import { colors } from '../../../../../utils/Charts';

const mapIndexed = R.addIndex(R.map);
export const computeTeamsColors = (teams: TeamStore[], theme: Theme) => R.pipe(
  mapIndexed((a: TeamStore, index: number) => [
    a.team_id,
    colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
  ]),
  R.fromPairs,
)(teams);

export const computeOrganizationsColors = (organizations: Organization[], theme: Theme) => R.pipe(
  mapIndexed((o: Organization, index: number) => [
    o.organization_id,
    colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
  ]),
  R.fromPairs,
)(organizations);
