import { AnalyticsOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { type CSSProperties, useCallback, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { searchCustomDashboards } from '../../../../actions/custom_dashboards/customdashboard-action';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { initSorting } from '../../../../components/common/queryable/Page';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../components/common/queryable/sort/SortHeadersComponentV2';
import useBodyItemsStyles from '../../../../components/common/queryable/style/style';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import type { Header } from '../../../../components/common/SortHeadersList';
import { useFormatter } from '../../../../components/i18n';
import type { CustomDashboard } from '../../../../utils/api-types';
import CustomDashboardCreation from './CustomDashboardCreation';
import CustomDashboardPopover from './CustomDashboardPopover';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

const inlineStyles: Record<string, CSSProperties> = {
  custom_dashboard_name: { width: '10%' },
  custom_dashboard_description: { width: '10%' },
};

const CustomDashboards = () => {
  // Standard hooks
  const { t } = useFormatter();
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();

  // Pagination
  const [customDashboards, setCustomDashboards] = useState<CustomDashboard[]>([]);
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('custom_dashboards', buildSearchPagination({ sorts: initSorting('custom_dashboard_name') }));
  const availableFilterNames = ['custom_dashboard_name'];

  // Headers
  const headers: Header[] = useMemo(() => [
    {
      field: 'custom_dashboard_name',
      label: 'Name',
      isSortable: true,
      value: (customDashboard: CustomDashboard) => customDashboard.custom_dashboard_name,
    },
    {
      field: 'custom_dashboard_description',
      label: 'Description',
      isSortable: false,
      value: (customDashboard: CustomDashboard) => customDashboard.custom_dashboard_description ?? '',
    },
  ], []);

  const handleUpdate = useCallback(
    (customDashboard: CustomDashboard) => {
      setCustomDashboards(prev => prev.map(d =>
        d.custom_dashboard_id === customDashboard.custom_dashboard_id ? customDashboard : d,
      ));
    },
    [],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setCustomDashboards(prev => prev.filter(d => d.custom_dashboard_id !== id));
    },
    [],
  );

  return (
    <>
      <Breadcrumbs
        variant="list"
        elements={[{ label: t('Dashboards') }, {
          label: t('Custom dashboards'),
          current: true,
        }]}
      />
      <PaginationComponentV2
        fetch={searchCustomDashboards}
        searchPaginationInput={searchPaginationInput}
        setContent={setCustomDashboards}
        entityPrefix="custom_dashboard"
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
      />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          sx={{ pt: 0 }}
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
        {customDashboards.map((customDashboard: CustomDashboard) => {
          return (
            (
              <ListItem
                key={customDashboard.custom_dashboard_id}
                classes={{ root: classes.item }}
                divider
                secondaryAction={(
                  <CustomDashboardPopover
                    customDashboard={customDashboard}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                )}
                disablePadding
              >
                <ListItemIcon>
                  <AnalyticsOutlined color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={(
                    <div style={bodyItemsStyles.bodyItems}>
                      {headers.map(header => (
                        <div
                          key={header.field}
                          style={{
                            ...bodyItemsStyles.bodyItem,
                            ...inlineStyles[header.field],
                          }}
                        >
                          {header.value?.(customDashboard)}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </ListItem>
            )
          );
        })}
      </List>
      <CustomDashboardCreation
        onCreate={(result: CustomDashboard) => setCustomDashboards([result, ...customDashboards])}
      />
    </>
  );
};

export default CustomDashboards;
