import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { AttachMoneyOutlined, CastForEducationOutlined, EmojiEventsOutlined } from '@mui/icons-material';
import { NewspaperVariantMultipleOutline } from 'mdi-material-ui';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../components/i18n';
import type { Exercise } from '../../../utils/api-types';
import type { Theme } from '../../../components/Theme';

const useStyles = makeStyles((theme: Theme) => ({
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

const DefinitionMenu: React.FC<Props> = ({ exerciseId }) => {
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
          to={`/admin/exercises/${exerciseId}/definition/audiences`}
          selected={
            location.pathname
            === `/admin/exercises/${exerciseId}/definition/audiences`
          }
          classes={{ root: classes.item }}
        >
          <ListItemIcon>
            <CastForEducationOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Audiences')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/admin/exercises/${exerciseId}/definition/media`}
          selected={
            location.pathname
            === `/admin/exercises/${exerciseId}/definition/media`
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
          to={`/admin/exercises/${exerciseId}/definition/challenges`}
          selected={
            location.pathname
            === `/admin/exercises/${exerciseId}/definition/challenges`
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
          to={`/admin/exercises/${exerciseId}/definition/variables`}
          selected={
            location.pathname
            === `/admin/exercises/${exerciseId}/definition/variables`
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
