import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { AttachMoneyOutlined, GroupsOutlined, EmojiEventsOutlined } from '@mui/icons-material';
import { NewspaperVariantMultipleOutline } from 'mdi-material-ui';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../components/i18n';
import type { Exercise, Scenario } from '../../../utils/api-types';
import type { Theme } from '../../../components/Theme';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    minHeight: '100vh',
    width: 200,
    position: 'fixed',
    overflow: 'auto',
    padding: 0,
    backgroundColor: theme.palette.background.nav,
  },
  toolbar: theme.mixins.toolbar,
  item: {
    paddingTop: 10,
    paddingBottom: 10,
  },
}));

interface Props {
  base: string;
  id: Exercise['exercise_id'] | Scenario['scenario_id'];
}

const DefinitionMenu: React.FC<Props> = ({ base, id }) => {
  const location = useLocation();
  const classes = useStyles();
  const { t } = useFormatter();

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      classes={{ paper: classes.drawer }}
    >
      <div className={classes.toolbar} />
      <MenuList component="nav">
        <MenuItem
          component={Link}
          to={`${base}/${id}/definition/teams`}
          selected={
            location.pathname
            === `${base}/${id}/definition/teams`
          }
          classes={{ root: classes.item }}
        >
          <ListItemIcon>
            <GroupsOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Teams')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={`${base}/${id}/definition/articles`}
          selected={
            location.pathname
            === `${base}/${id}/definition/articles`
          }
          classes={{ root: classes.item }}
        >
          <ListItemIcon>
            <NewspaperVariantMultipleOutline />
          </ListItemIcon>
          <ListItemText primary={t('Media pressure')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={`${base}/${id}/definition/challenges`}
          selected={
            location.pathname
            === `${base}/${id}/definition/challenges`
          }
          classes={{ root: classes.item }}
        >
          <ListItemIcon>
            <EmojiEventsOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Challenges')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={`${base}/${id}/definition/variables`}
          selected={
            location.pathname
            === `${base}/${id}/definition/variables`
          }
          classes={{ root: classes.item }}
        >
          <ListItemIcon>
            <AttachMoneyOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Variables')} />
        </MenuItem>
      </MenuList>
    </Drawer>
  );
};

export default DefinitionMenu;
