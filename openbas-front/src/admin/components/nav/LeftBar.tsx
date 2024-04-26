import React, { LegacyRef, MutableRefObject, ReactNode, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Drawer, ListItemText, Toolbar, MenuList, MenuItem, ListItemIcon, Divider, Tooltip, tooltipClasses, Collapse, Popover } from '@mui/material';
import {
  DashboardOutlined,
  MovieFilterOutlined,
  HubOutlined,
  ExtensionOutlined,
  SettingsOutlined,
  Groups3Outlined,
  ChevronLeft,
  ChevronRight,
  DnsOutlined,
  DescriptionOutlined,
  AutoAwesomeOutlined,
  VerifiedUserOutlined,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  PersonOutlined,
  GroupsOutlined,
  DomainOutlined,
  RowingOutlined,
  AttachMoneyOutlined,
  DevicesOtherOutlined,
  SmartButtonOutlined,
  OnlinePredictionOutlined,
  SubscriptionsOutlined,
} from '@mui/icons-material';
import { DramaMasks, NewspaperVariantMultipleOutline, PostOutline, SelectGroup, Target } from 'mdi-material-ui';
import { createStyles, makeStyles, styled, useTheme } from '@mui/styles';
import { fileUri, MESSAGING$ } from '../../../utils/Environment';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import type { UsersHelper } from '../../../actions/helper';
import type { Theme } from '../../../components/Theme';
import logoFiligranDark from '../../../static/images/logo_filigran_dark.png';
import logoFiligranLight from '../../../static/images/logo_filigran_light.png';
import logoFiligranTextDark from '../../../static/images/logo_filigran_text_dark.png';
import logoFiligranTextLight from '../../../static/images/logo_filigran_text_light.png';
import useDimensions from '../../../utils/hooks/useDimensions';

type entry = {
  type?: string,
  link: string,
  label: string,
  icon?: ReactNode,
  granted?: boolean,
  exact?: boolean,
};

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
  menuItemIcon: {
    color: theme.palette.text?.primary,
  },
  menuItem: {
    paddingRight: 2,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuHoverItem: {
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuSubItem: {
    paddingLeft: 20,
    height: 25,
    fontWeight: 500,
    fontSize: 12,
  },
  menuItemText: {
    padding: '1px 0 0 15px',
    fontWeight: 500,
    fontSize: 14,
  },
  menuSubItemText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '1px 0 0 10px',
    fontWeight: 500,
    fontSize: 12,
  },
  menuCollapseOpen: {
    width: 180,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuCollapse: {
    width: 55,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuLogoOpen: {
    width: 180,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuLogo: {
    width: 55,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
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
  const navigate = useNavigate();
  const ref = useRef<LegacyRef<HTMLDivElement> | undefined>();
  const { t } = useFormatter();
  const anchors: Record<string, MutableRefObject<HTMLAnchorElement | null>> = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    assets: useRef<HTMLAnchorElement | null>(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    teams: useRef<HTMLAnchorElement | null>(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    components: useRef<HTMLAnchorElement | null>(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    settings: useRef<HTMLAnchorElement | null>(),
  };
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(
    localStorage.getItem('navOpen') === 'true',
  );
  const classes = useStyles({ navOpen });
  const handleToggle = () => {
    setSelectedMenu(null);
    localStorage.setItem('navOpen', String(!navOpen));
    setNavOpen(!navOpen);
    MESSAGING$.toggleNav.next('toggle');
  };
  const handleSelectedMenuOpen = (menu: string) => {
    setSelectedMenu(menu);
  };
  const handleSelectedMenuClose = () => {
    setSelectedMenu(null);
  };
  const handleSelectedMenuToggle = (menu: string) => {
    setSelectedMenu(selectedMenu === menu ? null : menu);
  };
  const handleGoToPage = (link: string) => {
    navigate(link);
  };
  const userAdmin = useHelper((helper: UsersHelper) => {
    const me = helper.getMe();
    return me?.user_admin ?? false;
  });
  const { dimension } = useDimensions();
  const isMobile = dimension.width < 768;
  const generateSubMenu = (menu: string, entries: entry[]) => {
    return navOpen ? (
      <Collapse in={selectedMenu === menu} timeout="auto" unmountOnExit={true}>
        <MenuList component="nav" disablePadding={true}>
          {entries.filter((entry) => entry.granted !== false).map((entry) => {
            return (
              <StyledTooltip key={entry.label} title={t(entry.label)} placement="right">
                <MenuItem
                  component={Link}
                  to={entry.link}
                  selected={entry.exact ? location.pathname === entry.link : location.pathname.includes(entry.link)}
                  dense={true}
                  classes={{ root: classes.menuSubItem }}
                >
                  {entry.icon && <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    {entry.icon}
                  </ListItemIcon>}
                  <ListItemText
                    classes={{ primary: classes.menuSubItemText }}
                    primary={t(entry.label)}
                  />
                </MenuItem>
              </StyledTooltip>
            );
          })}
        </MenuList>
      </Collapse>
    ) : (
      <Popover
        sx={{ pointerEvents: 'none' }}
        open={selectedMenu === menu}
        anchorEl={anchors[menu]?.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handleSelectedMenuClose}
        disableRestoreFocus={true}
        disableScrollLock={true}
        slotProps={{
          paper: {
            elevation: 1,
            onMouseEnter: () => handleSelectedMenuOpen(menu),
            onMouseLeave: handleSelectedMenuClose,
            sx: {
              pointerEvents: 'auto',
            },
          },
        }}
      >
        <MenuList component="nav">
          {entries.filter((entry) => entry.granted !== false).map((entry) => {
            return (
              <MenuItem
                key={entry.label}
                component={Link}
                to={entry.link}
                selected={entry.exact ? location.pathname === entry.link : location.pathname.includes(entry.link)}
                dense={true}
                classes={{ root: classes.menuHoverItem }}
                onClick={handleSelectedMenuClose}
              >
                {entry.icon && <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {entry.icon}
                </ListItemIcon>}
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t(entry.label)}
                />
              </MenuItem>
            );
          })}
        </MenuList>
      </Popover>
    );
  };
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
      <div ref={ref.current}>
        <MenuList component="nav">
          <StyledTooltip title={!navOpen && t('Home')} placement="right">
            <MenuItem
              component={Link}
              to="/admin"
              selected={location.pathname === '/admin'}
              dense={true}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <DashboardOutlined />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t('Home')}
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
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
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
          <StyledTooltip title={!navOpen && t('Atomic testings')} placement="right">
            <MenuItem
              component={Link}
              to="/admin/atomic_testings"
              selected={location.pathname.includes('/admin/atomic_testings')}
              dense={true}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <Target />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t('Atomic testings')}
                />
              )}
            </MenuItem>
          </StyledTooltip>
        </MenuList>
        <Divider />
        <MenuList component="nav">
          <StyledTooltip title={!navOpen && t('Scenarios')} placement="right">
            <MenuItem
              component={Link}
              to="/admin/scenarios"
              selected={location.pathname.includes('/admin/scenarios')}
              dense={true}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
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
          <MenuItem
            aria-label="Assets"
            ref={anchors.assets}
            href="assets"
            selected={!navOpen && location.pathname.includes('/admin/assets')}
            dense={true}
            classes={{ root: classes.menuItem }}
            onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('assets') : handleGoToPage('/admin/assets'))}
            onMouseEnter={() => !navOpen && handleSelectedMenuOpen('assets')}
            onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
          >
            <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
              <DnsOutlined />
            </ListItemIcon>
            {navOpen && (
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t('Assets')}
              />
            )}
            {navOpen && (selectedMenu === 'assets' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
          </MenuItem>
          {generateSubMenu(
            'assets',
            [
              { type: 'Endpoint', link: '/admin/assets/endpoints', label: 'Endpoints', icon: <DevicesOtherOutlined fontSize="small" /> },
              { type: 'AssetGroup', link: '/admin/assets/asset_groups', label: 'Asset groups', icon: <SelectGroup fontSize="small" /> },
            ],
          )}
          <MenuItem
            ref={anchors.teams}
            href="teams"
            selected={!navOpen && location.pathname.includes('/admin/teams')}
            dense={true}
            classes={{ root: classes.menuItem }}
            onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('teams') : handleGoToPage('/admin/teams'))}
            onMouseEnter={() => !navOpen && handleSelectedMenuOpen('teams')}
            onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
          >
            <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
              <Groups3Outlined />
            </ListItemIcon>
            {navOpen && (
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t('Teams')}
              />
            )}
            {navOpen && (selectedMenu === 'teams' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
          </MenuItem>
          {generateSubMenu(
            'teams',
            [
              { type: 'User', link: '/admin/teams/players', label: 'Players', icon: <PersonOutlined fontSize="small" /> },
              { type: 'Team', link: '/admin/teams/teams', label: 'Teams', icon: <GroupsOutlined fontSize="small" /> },
              { type: 'Organization', link: '/admin/teams/organizations', label: 'Organizations', icon: <DomainOutlined fontSize="small" /> },
            ],
          )}
          <MenuItem
            ref={anchors.components}
            href="components"
            selected={!navOpen && location.pathname.includes('/admin/components')}
            dense={true}
            classes={{ root: classes.menuItem }}
            onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('components') : handleGoToPage('/admin/components'))}
            onMouseEnter={() => !navOpen && handleSelectedMenuOpen('components')}
            onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
          >
            <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
              <NewspaperVariantMultipleOutline />
            </ListItemIcon>
            {navOpen && (
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t('Components')}
              />
            )}
            {navOpen && (selectedMenu === 'components' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
          </MenuItem>
          {generateSubMenu(
            'components',
            [
              { type: 'Document', link: '/admin/components/documents', label: 'Documents', icon: <DescriptionOutlined fontSize="small" /> },
              { type: 'Variable', link: '/admin/components/variables', label: 'Custom variables', icon: <AttachMoneyOutlined fontSize="small" /> },
              { type: 'Payload', link: '/admin/components/payloads', label: 'Payloads', icon: <SubscriptionsOutlined fontSize="small" /> },
              { type: 'Persona', link: '/admin/components/personas', label: 'Personas', icon: <DramaMasks fontSize="small" /> },
              { type: 'Channel', link: '/admin/components/channels', label: 'Channels', icon: <PostOutline fontSize="small" /> },
              { type: 'Challenge', link: '/admin/components/challenges', label: 'Challenges', icon: <RowingOutlined fontSize="small" /> },
            ],
          )}
        </MenuList>
        <Divider />
        <MenuList component="nav">
          <StyledTooltip title={!navOpen && t('Reports')} placement="right">
            <MenuItem
              component={Link}
              to="/admin/reports"
              selected={location.pathname.includes('/admin/reports')}
              dense={true}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
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
          <StyledTooltip title={!navOpen && t('Skills')} placement="right">
            <MenuItem
              component={Link}
              to="/admin/skills"
              selected={location.pathname === '/admin/skills'}
              dense={true}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <AutoAwesomeOutlined />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t('Skills')}
                />
              )}
            </MenuItem>
          </StyledTooltip>
          <StyledTooltip title={!navOpen && t('Mitigations')} placement="right">
            <MenuItem
              component={Link}
              to="/admin/mitigations"
              selected={location.pathname === '/admin/mitigations'}
              dense={true}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <VerifiedUserOutlined />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t('Mitigations')}
                />
              )}
            </MenuItem>
          </StyledTooltip>
          <StyledTooltip title={!navOpen && t('Integrations')} placement="right">
            <>
              <MenuItem
                ref={anchors.integrations}
                href="integrations"
                selected={!navOpen && location.pathname.includes('/admin/integrations')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('integrations') : handleGoToPage('/admin/integrations'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('integrations')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  <ExtensionOutlined />
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t('Integrations')}
                  />
                )}
                {navOpen && (selectedMenu === 'integrations' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
              </MenuItem>
              {generateSubMenu(
                'integrations',
                [
                  { type: 'Injectors', link: '/admin/integrations/injectors', label: 'Injectors', icon: <SmartButtonOutlined fontSize="small" /> },
                  { type: 'Collectors', link: '/admin/integrations/collectors', label: 'Collectors', icon: <OnlinePredictionOutlined fontSize="small" /> },
                ],
              )}
            </>
          </StyledTooltip>
        </MenuList>
        <Divider />
        <MenuList component="nav">
          {userAdmin && (
            <MenuItem
              ref={anchors.settings}
              href="settings"
              selected={!navOpen && location.pathname.includes('/admin/settings')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('settings') : handleGoToPage('/admin/settings'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('settings')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <SettingsOutlined />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t('Settings')}
                />
              )}
              {navOpen && (selectedMenu === 'settings' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
          )}
          {userAdmin && generateSubMenu(
            'settings',
            [
              { link: '/admin/settings', label: 'Parameters', exact: true },
              { link: '/admin/settings/security', label: 'Security' },
              { link: '/admin/settings/taxonomies', label: 'Taxonomies' },
            ],
          )}
        </MenuList>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <MenuList component="nav">
          <MenuItem
            dense={true}
            classes={{
              root: navOpen ? classes.menuLogoOpen : classes.menuLogo,
            }}
            onClick={() => window.open('https://filigran.io/', '_blank')}
          >
            <Tooltip title={'By Filigran'}>
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <img
                  src={fileUri(theme.palette.mode === 'dark' ? logoFiligranDark : logoFiligranLight)}
                  alt="logo"
                  width={20}
                />
              </ListItemIcon>
            </Tooltip>
            {navOpen && (
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20, padding: '4px 0 0 15px' }}>
                <img
                  src={fileUri(theme.palette.mode === 'dark' ? logoFiligranTextDark : logoFiligranTextLight)}
                  alt="logo"
                  width={50}
                />
              </ListItemIcon>
            )}
          </MenuItem>
          <MenuItem
            dense={true}
            classes={{
              root: navOpen ? classes.menuCollapseOpen : classes.menuCollapse,
            }}
            onClick={() => handleToggle()}
          >
            <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
              {navOpen ? <ChevronLeft /> : <ChevronRight />}
            </ListItemIcon>
            {navOpen && (
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t('Collapse')}
              />
            )}
          </MenuItem>
        </MenuList>
      </div>
    </Drawer>
  );
};

export default LeftBar;
