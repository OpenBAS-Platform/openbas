import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { InsertChartOutlinedOutlined, SchoolOutlined, ContentPasteOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../components/i18n';
import type { Exercise } from '../../../utils/api-types';
import type { Theme } from '../../../components/Theme';

const useStyles = makeStyles<Theme>((theme) => ({
  drawer: {
    minHeight: '100vh',
    width: 200,
    position: 'fixed',
    overflow: 'auto',
    padding: 0,
  },
  toolbar: theme.mixins.toolbar,
  item: {
    paddingTop: 10,
    paddingBottom: 10,
  },
}));

interface Props {
  exerciseId: Exercise['exercise_id'];
}

const ResultsMenu: React.FC<Props> = ({ exerciseId }) => {
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
          to={`/admin/exercises/${exerciseId}/results/dashboard`}
          selected={
            location.pathname
            === `/admin/exercises/${exerciseId}/results/dashboard`
          }
          dense={false}
          classes={{ root: classes.item }}
        >
          <ListItemIcon style={{ minWidth: 35 }}>
            <InsertChartOutlinedOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Statistics')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/admin/exercises/${exerciseId}/results/lessons`}
          selected={
            location.pathname
            === `/admin/exercises/${exerciseId}/results/lessons`
          }
          dense={false}
          classes={{ root: classes.item }}
        >
          <ListItemIcon style={{ minWidth: 35 }}>
            <SchoolOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Lessons learned')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/admin/exercises/${exerciseId}/results/reports`}
          selected={location.pathname.includes(
            `/admin/exercises/${exerciseId}/results/reports`,
          )}
          dense={false}
          classes={{ root: classes.item }}
        >
          <ListItemIcon style={{ minWidth: 35 }}>
            <ContentPasteOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Reports')} />
        </MenuItem>
      </MenuList>
    </Drawer>
  );
};

export default ResultsMenu;
