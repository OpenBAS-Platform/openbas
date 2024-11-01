import { ControlPointOutlined, GroupsOutlined } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';

import { fetchTags } from '../../../../actions/Tag';
import type { TeamStore } from '../../../../actions/teams/Team';
import { findTeams } from '../../../../actions/teams/team-actions';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import { useQueryable } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import SelectList, { SelectListElements } from '../../../../components/common/SelectList';
import Transition from '../../../../components/common/Transition';
import { useFormatter } from '../../../../components/i18n';
import ItemTags from '../../../../components/ItemTags';
import type { Theme } from '../../../../components/Theme';
import type { TeamOutput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import type { EndpointStore } from '../../assets/endpoints/Endpoint';
import CreateTeam from '../../components/teams/CreateTeam';
import { PermissionsContext, TeamContext } from '../Context';

const useStyles = makeStyles((theme: Theme) => ({
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
  handleAddTeams: (teamIds: string[]) => void;
  injectTeamsIds: string[];
}

const InjectAddTeams: FunctionComponent<Props> = ({
  handleAddTeams,
  injectTeamsIds,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);
  const { searchTeams } = useContext(TeamContext);

  // Fetch datas
  useDataLoader(() => {
    dispatch(fetchTags());
  });

  const [teamValues, setTeamValues] = useState<TeamOutput[]>([]);
  const [selectedTeamValues, setSelectedTeamValues] = useState<TeamOutput[]>([]);

  // Dialog
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setSelectedTeamValues([]);
  };

  const submitAddTeams = () => {
    handleAddTeams(selectedTeamValues.map(v => v.team_id).filter(id => !injectTeamsIds.includes(id)));
    handleClose();
  };

  useEffect(() => {
    if (open) {
      findTeams(injectTeamsIds).then(result => setSelectedTeamValues(result.data));
    }
  }, [open, injectTeamsIds]);

  // Pagination
  const addTeam = (_teamId: string, team: TeamOutput) => setSelectedTeamValues([...selectedTeamValues, team]);
  const removeTeam = (teamId: string) => setSelectedTeamValues(selectedTeamValues.filter(v => v.team_id !== teamId));

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

  const paginationComponent = (
    <PaginationComponentV2
      fetch={input => searchTeams(input, true)}
      searchPaginationInput={searchPaginationInput}
      setContent={setTeamValues}
      entityPrefix="team"
      availableFilterNames={availableFilterNames}
      queryableHelpers={queryableHelpers}
    />
  );

  return (
    <div>
      <ListItem
        classes={{ root: classes.item }}
        button
        divider
        onClick={() => setOpen(true)}
        color="primary"
        disabled={permissions.readOnly}
      >
        <ListItemIcon color="primary">
          <ControlPointOutlined color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={t('Add target teams')}
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
        <DialogTitle>{t('Add target teams in this inject')}</DialogTitle>
        <DialogContent>
          <Box sx={{ marginTop: 2 }}>
            <SelectList
              values={teamValues}
              selectedValues={selectedTeamValues}
              elements={elements}
              prefix="team"
              onSelect={addTeam}
              onDelete={removeTeam}
              paginationComponent={paginationComponent}
              buttonComponent={(
                <CreateTeam
                  inline
                  onCreate={(team) => {
                    setTeamValues([...teamValues, team]);
                    setSelectedTeamValues([...selectedTeamValues, team]);
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitAddTeams}>
            {t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default InjectAddTeams;
