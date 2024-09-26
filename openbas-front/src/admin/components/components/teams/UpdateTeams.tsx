import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Add, GroupsOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import ItemTags from '../../../../components/ItemTags';
import Transition from '../../../../components/common/Transition';
import { useFormatter } from '../../../../components/i18n';
import { findTeams } from '../../../../actions/teams/team-actions';
import type { Team, TeamOutput } from '../../../../utils/api-types';
import type { TeamStore } from '../../../../actions/teams/Team';
import SelectList, { SelectListElements } from '../../../../components/common/SelectList';
import type { EndpointStore } from '../../assets/endpoints/Endpoint';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { useQueryable } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import { TeamContext } from '../../common/Context';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchTags } from '../../../../actions/Tag';
import { useAppDispatch } from '../../../../utils/hooks';
import CreateTeam from './CreateTeam';

const useStyles = makeStyles(() => ({
  createButton: {
    float: 'left',
    marginTop: -15,
  },
}));

interface Props {
  addedTeamIds: Team['team_id'][];
  setTeamIds: (ids: string[]) => void;
}

const UpdateTeams: React.FC<Props> = ({
  addedTeamIds,
  setTeamIds,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { searchTeams, onReplaceTeam } = useContext(TeamContext);

  // Fetch datas
  useDataLoader(() => {
    dispatch(fetchTags());
  });

  const [teams, setTeams] = useState<TeamOutput[]>([]);
  const [teamValues, setTeamValues] = useState<TeamOutput[]>([]);

  // Dialog
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setTeamValues([]);
  };

  const handleSubmit = async () => {
    setOpen(false);
    onReplaceTeam?.(teamValues.map((v) => v.team_id)).then((result) => setTeamIds(result.result));
  };

  useEffect(() => {
    findTeams(addedTeamIds).then((result) => setTeamValues(result.data));
  }, [addedTeamIds]);

  // Pagination
  const addTeam = (_teamId: string, team: TeamOutput) => setTeamValues([...teamValues, team]);
  const removeTeam = (teamId: string) => setTeamValues(teamValues.filter((v) => v.team_id !== teamId));

  // Headers
  const elements: SelectListElements<EndpointStore> = useMemo(() => ({
    icon: {
      value: () => <GroupsOutlined />,
    },
    headers: [
      {
        field: 'team_name',
        value: (team: TeamStore) => team.team_name,
        width: 70,
      },
      {
        field: 'team_tags',
        value: (team: TeamStore) => <ItemTags variant="reduced-view" tags={team.team_tags} />,
        width: 30,
      },
    ],
  }), []);

  const availableFilterNames = [
    'team_tags',
  ];
  const { queryableHelpers, searchPaginationInput } = useQueryable(buildSearchPagination({}));

  const paginationComponent = <PaginationComponentV2
    fetch={(input) => searchTeams(input)}
    searchPaginationInput={searchPaginationInput}
    setContent={setTeams}
    entityPrefix="team"
    availableFilterNames={availableFilterNames}
    queryableHelpers={queryableHelpers}
                              />;

  return (
    <>
      <IconButton
        color="primary"
        aria-label="Add"
        onClick={() => setOpen(true)}
        classes={{ root: classes.createButton }}
        size="large"
      >
        <Add fontSize="small" />
      </IconButton>
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
        <DialogTitle>{t('Update teams')}</DialogTitle>
        <DialogContent>
          <Box sx={{ marginTop: 2 }}>
            <SelectList
              values={teams}
              selectedValues={teamValues}
              elements={elements}
              prefix="team"
              onSelect={addTeam}
              onDelete={removeTeam}
              paginationComponent={paginationComponent}
              buttonComponent={<CreateTeam
                inline
                onCreate={(team) => setTeamValues([...teamValues, team])}
                               />}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={handleSubmit}>
            {t('Update')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateTeams;
