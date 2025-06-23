import { List as MuiList, ListItem as MuiListItem, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { initSorting } from '../../../../../../../components/common/queryable/Page';
import { buildSearchPagination } from '../../../../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../../../../components/common/queryable/sort/SortHeadersComponentV2';
import { useQueryableWithLocalStorage } from '../../../../../../../components/common/queryable/useQueryableWithLocalStorage';
import { type Header } from '../../../../../../../components/common/SortHeadersList';
import { type EsBase, type EsEndpoint } from '../../../../../../../utils/api-types';
import { type Widget } from '../../../../../../../utils/api-types-custom';
import DefaultElementStyles from './elements/default/DefaultElementStyles';
import DefaultListElement from './elements/default/DefaultListElement';
import EndpointElementStyles from './elements/endpoint/EndpointElementStyles';
import EndpointListElement from './elements/endpoint/EndpointListElement';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

type Props = {
  config: Widget['widget_config'];
  elements: EsBase[];
};

const List = (props: Props) => {
  const { classes } = useStyles();

  const headersFromColumns = (columns: string[]): Header[] => {
    return columns.map((col) => {
      return {
        field: col,
        label: col,
        isSortable: false,
      };
    });
  };

  const stylesFromEntityType = (entityType: string) => {
    switch (entityType) {
      case 'endpoint': return EndpointElementStyles;
      default: return DefaultElementStyles;
    }
  };

  const { queryableHelpers } = useQueryableWithLocalStorage('asset', buildSearchPagination({ sorts: initSorting('asset_name') }));

  const getTypedUiElement = (element: EsBase, columns: string[]) => {
    switch (element.base_entity) {
      case 'endpoint': return (<EndpointListElement element={element as EsEndpoint} columns={columns} />);
      default: return (<DefaultListElement columns={columns} element={element} />);
    }
  };

  const columns = (widget_config: Widget['widget_config']) => {
    if (widget_config.widget_configuration_type === 'list') {
      return widget_config.columns;
    }
    throw 'Bad configuration: must be configuration of type list';
  };

  return (
    <MuiList>
      <MuiListItem
        classes={{ root: classes.itemHead }}
        style={{ paddingTop: 0 }}
      >
        <ListItemIcon />
        <ListItemText
          primary={(
            <SortHeadersComponentV2
              headers={headersFromColumns(columns(props.config))}
              inlineStylesHeaders={stylesFromEntityType(props.elements[0].base_entity)}
              sortHelpers={queryableHelpers.sortHelpers}
            />
          )}
        />
      </MuiListItem>
      {props.elements.map(e =>
        <MuiListItem key={e.base_id} divider disablePadding>{getTypedUiElement(e, columns(props.config))}</MuiListItem>,
      )}
    </MuiList>
  );
};

export default List;
