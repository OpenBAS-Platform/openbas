import { HelpOutlineOutlined, SecurityOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { searchRoles } from '../../../../actions/roles/roles-actions';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { initSorting } from '../../../../components/common/queryable/Page';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../components/common/queryable/sort/SortHeadersComponentV2';
import useBodyItemsStyles from '../../../../components/common/queryable/style/style';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import { useFormatter } from '../../../../components/i18n';
import PaginatedListLoader from '../../../../components/PaginatedListLoader';
import type { Role, SearchPaginationInput } from '../../../../utils/api-types';
import SecurityMenu from '../SecurityMenu';
import CreateRole from './CreateRole';
import RolePopover from './RolePopover';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
  container: { display: 'flex' },
  bodyItems: { flexGrow: 1 },
}));

const inlineStyles = {
  role_name: { width: '50%' },
  role_creation_date: { width: '25%' },
  role_modification_date: { width: '25%' },
};

const Roles = () => {
  const { classes } = useStyles();
  const { t } = useFormatter();

  const bodyItemsStyles = useBodyItemsStyles();

  // Headers
  const headers = useMemo(() => [
    {
      field: 'role_name',
      label: t('Name'),
      isSortable: true,
    },
    {
      field: 'role_creation_date',
      label: t('Platform creation date'),
      isSortable: true,
    },
    {
      field: 'role_modification_date',
      label: t('Modification date'),
      isSortable: true,
    },
  ], []);

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('role', buildSearchPagination({
    sorts: initSorting('role_name', 'ASC'),
    textSearch: search,
  }));

  const searchRolesToLoad = (input: SearchPaginationInput) => {
    setLoading(true);
    return searchRoles(input).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.bodyItems}>
        <Breadcrumbs
          variant="list"
          elements={[{ label: t('Settings') }, { label: t('Security') }, {
            label: t('Roles'),
            current: true,
          }]}
        />
        <PaginationComponentV2
          fetch={searchRolesToLoad}
          searchPaginationInput={searchPaginationInput}
          setContent={setRoles}
          entityPrefix="role"
          queryableHelpers={queryableHelpers}
          disablePagination
          disableFilters
        />
        <List>
          <ListItem
            classes={{ root: classes.itemHead }}
            divider={false}
            style={{ paddingTop: 0 }}
            secondaryAction={<>&nbsp;</>}
          >
            <ListItemIcon />
            <ListItemText
              primary={(
                <SortHeadersComponentV2
                  headers={headers}
                  inlineStylesHeaders={inlineStyles}
                  sortHelpers={queryableHelpers.sortHelpers}
                />
              )}
            />
          </ListItem>
          {loading
            ? <PaginatedListLoader Icon={HelpOutlineOutlined} headers={headers} headerStyles={inlineStyles} />
            : (
                <div>
                  {roles.map((role: Role) => (
                    <ListItem
                      key={role.role_id}
                      classes={{ root: classes.item }}
                      divider={true}
                    >
                      <ListItemIcon>
                        <SecurityOutlined sx={{ color: '#96F426' }} />
                      </ListItemIcon>
                      <ListItemText primary={(
                        <div style={bodyItemsStyles.bodyItems}>
                          {Object.keys(inlineStyles).map(key => (
                            <div
                              key={key}
                              style={{
                                ...bodyItemsStyles.bodyItem,
                                ...inlineStyles[key as keyof typeof inlineStyles],
                              }}
                            >
                              {role[key as keyof typeof role]}
                            </div>
                          ))}

                        </div>

                      )}
                      />
                      <RolePopover
                        onDelete={result => setRoles(roles.filter(r => (r.role_id !== result)))}
                        onUpdate={result => setRoles(roles.map(r => (r.role_id !== result.role_id ? r : result)))}
                        role={{ ...role }}
                      />
                    </ListItem>
                  ),
                  )}
                </div>
              )}
        </List>
        <CreateRole onCreate={(result: Role) => setRoles([...roles, result])} />

      </div>
      <SecurityMenu />

    </div>
  );
};

export default Roles;
