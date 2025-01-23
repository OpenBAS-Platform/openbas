import { Divider, Drawer, MenuList, Toolbar } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import * as React from 'react';
import { FunctionComponent } from 'react';

import { computeBannerSettings } from '../../../../public/components/systembanners/utils';
import useAuth from '../../../../utils/hooks/useAuth';
import type { Theme } from '../../../Theme';
import { hasHref, LeftMenuEntries } from './leftmenu-model';
import MenuItemGroup from './MenuItemGroup';
import MenuItemLogo from './MenuItemLogo';
import MenuItemSingle from './MenuItemSingle';
import MenuItemToggle from './MenuItemToggle';
import useLeftMenu from './useLeftMenu';

const useStyles = makeStyles((theme: Theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    backgroundColor: theme.palette.background.nav,
    overflowX: 'hidden',
  },
}));

const LeftMenu: FunctionComponent<{ entries: LeftMenuEntries[] }> = ({
  entries = [],
}) => {
  // Standard hooks
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { settings } = useAuth();
  const { bannerHeightNumber } = computeBannerSettings(settings);

  const { state, helpers } = useLeftMenu(entries);

  return (
    <Drawer
      variant="permanent"
      classes={{ paper: classes.drawerPaper }}
      sx={{
        'width': state.navOpen ? 180 : 55,
        'transition': theme.transitions.create('width', {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: state.navOpen ? 180 : 55,
        },
      }}
    >
      <Toolbar />
      {entries.map((entry, idxList) => {
        return (
          <React.Fragment key={idxList}>
            {idxList !== 0 && <Divider />}
            <MenuList component="nav" style={{ marginTop: bannerHeightNumber }}>
              {(entry.userRight ?? true) && entry.items.map((item) => {
                if (hasHref(item)) {
                  return (
                    <React.Fragment key={item.label}>
                      <MenuItemGroup
                        item={item}
                        state={state}
                        helpers={helpers}
                      />
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={item.label}>
                    <MenuItemSingle item={item} navOpen={state.navOpen} />
                  </React.Fragment>
                );
              })}
            </MenuList>
          </React.Fragment>
        );
      })}
      <div style={{ marginTop: 'auto' }}>
        <MenuList component="nav" style={{ marginBottom: bannerHeightNumber }}>
          <MenuItemLogo
            navOpen={state.navOpen}
            onClick={() => window.open('https://filigran.io/', '_blank')}
          />
          <MenuItemToggle
            navOpen={state.navOpen}
            onClick={helpers.handleToggleDrawer}
          />
        </MenuList>
      </div>
    </Drawer>
  );
};

export default LeftMenu;
