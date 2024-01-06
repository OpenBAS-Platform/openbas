import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, ListItemText, Toolbar, MenuList, MenuItem, ListItemIcon, Divider, Tooltip, tooltipClasses } from '@mui/material';
import {
  DashboardOutlined,
  PolicyOutlined,
  MovieFilterOutlined,
  HubOutlined,
  ExtensionOutlined,
  SettingsOutlined,
  AccountBalanceOutlined,
  Groups3Outlined,
  EmojiEventsOutlined,
  ChevronLeft,
  ChevronRight,
  DnsOutlined,
  DescriptionOutlined,
} from '@mui/icons-material';
import { NewspaperVariantMultipleOutline } from 'mdi-material-ui';
import { createStyles, makeStyles, styled, useTheme } from '@mui/styles';
import { MESSAGING$ } from '../../../utils/Environment';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import type { UsersHelper } from '../../../actions/helper';
import type { Theme } from '../../../components/Theme';

const useStyles = makeStyles<Theme>((theme) => createStyles({
  drawerPaper: {
    width: 55,
    minHeight: '100vh',
    background: 0,
    backgroundColor: theme.palette.background.nav,
    overflowX: 'hidden',
  },
  drawerPaperOpen: {
    width: 180,
    minHeight: '100vh',
    background: 0,
    backgroundColor: theme.palette.background.nav,
    overflowX: 'hidden',
  },
  menuItem: {
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuItemText: {
    padding: '1px 0 0 20px',
    fontWeight: 500,
    fontSize: 14,
  },
  menuCollapseOpen: {
    width: 180,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
    position: 'fixed',
    left: 0,
    bottom: 10,
  },
  menuCollapse: {
    width: 55,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
    position: 'fixed',
    left: 0,
    bottom: 10,
  },
  menuLogoOpen: {
    width: 180,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
    position: 'fixed',
    left: 0,
    bottom: 45,
  },
  menuLogo: {
    width: 55,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
    position: 'fixed',
    left: 0,
    bottom: 45,
  },
  menuItemSmallText: {
    padding: '1px 0 0 20px',
  },
}));

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }: { theme: Theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

const LeftBar = () => {
  const theme = useTheme<Theme>();
  const location = useLocation();
  const { t } = useFormatter();
  const [navOpen, setNavOpen] = useState(
    localStorage.getItem('navOpen') === 'true',
  );
  const classes = useStyles({ navOpen });
  const handleToggle = () => {
    localStorage.setItem('navOpen', String(!navOpen));
    setNavOpen(!navOpen);
    MESSAGING$.toggleNav.next('toggle');
  };
  const userAdmin = useHelper((helper: UsersHelper) => {
    const me = helper.getMe();
    return me?.user_admin ?? false;
  });
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: navOpen ? classes.drawerPaperOpen : classes.drawerPaper,
      }}
      sx={{
        width: navOpen ? 180 : 55,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar />
      <MenuList component="nav">
        <StyledTooltip title={!navOpen && t('Dashboard')} placement="right">
          <MenuItem
            component={Link}
            to="/admin"
            selected={location.pathname === '/admin'}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <DashboardOutlined />
            </ListItemIcon>
            {navOpen && (
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t('Dashboard')}
              />
            )}
          </MenuItem>
        </StyledTooltip>
      </MenuList>
      <Divider />
      <MenuList component="nav">
        <StyledTooltip title={!navOpen && t('Simulations')} placement="right">
          <MenuItem
            component={Link}
            to="/admin/exercises"
            selected={location.pathname.includes('/admin/exercises')}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <HubOutlined />
            </ListItemIcon>
            {navOpen && (
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t('Simulations')}
              />
            )}
          </MenuItem>
        </StyledTooltip>
        <StyledTooltip title={!navOpen && t('Scenarios')} placement="right">
          <MenuItem
            component={Link}
            to="/admin/scenarios"
            selected={location.pathname.includes('/admin/scenarios')}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <MovieFilterOutlined />
            </ListItemIcon>
            {navOpen && (
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t('Scenarios')}
            />
            )}
          </MenuItem>
        </StyledTooltip>
        <StyledTooltip title={!navOpen && t('Detection')} placement="right">
          <MenuItem
            component={Link}
            to="/admin/detections"
            selected={location.pathname === '/admin/detections'}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <PolicyOutlined />
            </ListItemIcon>
            {navOpen && (
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t('Detections')}
            />
            )}
          </MenuItem>
        </StyledTooltip>
        <StyledTooltip title={!navOpen && t('Reports')} placement="right">
          <MenuItem
            component={Link}
            to="/admin/reports"
            selected={location.pathname === '/admin/reporting'}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <DescriptionOutlined />
            </ListItemIcon>
            {navOpen && (
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t('Reports')}
            />
            )}
          </MenuItem>
        </StyledTooltip>
      </MenuList>
      <Divider />
      <MenuList component="nav">
        <StyledTooltip title={!navOpen && t('Assets')} placement="right">
          <MenuItem
            component={Link}
            to="/admin/assets"
            selected={location.pathname === '/admin/assets'}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <DnsOutlined />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t('Assets')}
            />
          </MenuItem>
        </StyledTooltip>
        <StyledTooltip title={!navOpen && t('Persons')} placement="right">
          <MenuItem
            component={Link}
            to="/admin/persons"
            selected={location.pathname.includes('/admin/persons')}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <Groups3Outlined />
            </ListItemIcon>
            {navOpen && (
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t('Persons')}
            />
            )}
          </MenuItem>
        </StyledTooltip>
        <StyledTooltip title={!navOpen && t('Medias')} placement="right">
          <MenuItem
            component={Link}
            to="/admin/medias"
            selected={location.pathname.includes('/admin/medias')}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <NewspaperVariantMultipleOutline />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t('Medias')}
            />
          </MenuItem>
        </StyledTooltip>
        <StyledTooltip title={!navOpen && t('Challenges')} placement="right">
          <MenuItem
            component={Link}
            to="/admin/challenges"
            selected={location.pathname === '/admin/challenges'}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <EmojiEventsOutlined />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t('Challenges')}
            />
          </MenuItem>
        </StyledTooltip>
        <StyledTooltip
          title={!navOpen && t('Organizations')}
          placement="right"
        >
          <MenuItem
            component={Link}
            to="/admin/organizations"
            selected={location.pathname.includes('/admin/organizations')}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <AccountBalanceOutlined />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t('Organizations')}
            />
          </MenuItem>
        </StyledTooltip>
      </MenuList>
      <Divider />
      <MenuList component="nav">
        <StyledTooltip title={!navOpen && t('Integrations')} placement="right">
          <MenuItem
            component={Link}
            to="/admin/integrations"
            selected={location.pathname === '/admin/integrations'}
            dense={true}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 20 }}>
              <ExtensionOutlined />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t('Integrations')}
            />
          </MenuItem>
        </StyledTooltip>
        {userAdmin && (
          <StyledTooltip title={!navOpen && t('Settings')} placement="right">
            <MenuItem
              component={Link}
              to="/admin/settings"
              selected={location.pathname.includes('/admin/settings')}
              dense={true}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon style={{ minWidth: 20 }}>
                <SettingsOutlined />
              </ListItemIcon>
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t('Settings')}
              />
            </MenuItem>
          </StyledTooltip>
        )}
      </MenuList>
      <MenuItem
        dense={true}
        classes={{
          root: navOpen ? classes.menuCollapseOpen : classes.menuCollapse,
        }}
        onClick={() => handleToggle()}
      >
        <ListItemIcon style={{ minWidth: 20 }}>
          {navOpen ? <ChevronLeft /> : <ChevronRight />}
        </ListItemIcon>
        {navOpen && (
          <ListItemText
            classes={{ primary: classes.menuItemText }}
            primary={t('Collapse')}
          />
        )}
      </MenuItem>
    </Drawer>
  );
};

export default LeftBar;
