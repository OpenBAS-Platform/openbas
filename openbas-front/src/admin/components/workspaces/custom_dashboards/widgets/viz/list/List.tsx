import { List as MuiList, ListItem as MuiListItem, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { initSorting } from '../../../../../../../components/common/queryable/Page';
import { buildSearchPagination } from '../../../../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../../../../components/common/queryable/sort/SortHeadersComponentV2';
import { useQueryableWithLocalStorage } from '../../../../../../../components/common/queryable/useQueryableWithLocalStorage';
import { type Header } from '../../../../../../../components/common/SortHeadersList';
import { type EsBase, type EsEndpoint } from '../../../../../../../utils/api-types';
import { type ListConfiguration, type Widget } from '../../../../../../../utils/api-types-custom';
import buildStyles from './elements/ColumnStyles';
import DefaultElementStyles from './elements/default/DefaultElementStyles';
import DefaultListElement from './elements/default/DefaultListElement';
import EndpointElementSecondaryAction from './elements/endpoint/EndpointElementSecondaryAction';
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

  // FIXME: we will always use ListConfiguration in this component
  const config = (): ListConfiguration => {
    return props.config as ListConfiguration;
  };

  const headersFromColumns = (columns: string[]): Header[] => {
    return columns.map((col) => {
      return {
        field: col,
        label: col,
        isSortable: false,
      };
    });
  };

  const stylesFromEntityType = (elements: EsBase[]) => {
    const defaultStyles = buildStyles(config().columns, DefaultElementStyles);
    if (elements === undefined || elements.length === 0) {
      return defaultStyles;
    }
    const entityType = elements[0].base_entity;
    switch (entityType) {
      case 'endpoint': return buildStyles(config().columns, EndpointElementStyles);
      default: return defaultStyles;
    }
  };

  const { queryableHelpers } = useQueryableWithLocalStorage('asset', buildSearchPagination({ sorts: initSorting('asset_name') }));

  const getTypedUiElement = (element: EsBase, columns: string[]) => {
    switch (element.base_entity) {
      case 'endpoint': return (<EndpointListElement element={element as EsEndpoint} columns={columns} />);
      default: return (<DefaultListElement columns={columns} element={element} />);
    }
  };

  const getTypedSecondaryAction = (element: EsBase) => {
    switch (element.base_entity) {
      case 'endpoint': return (<EndpointElementSecondaryAction element={element as EsEndpoint} />);
      default: return (<>&nbsp;</>);
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
        secondaryAction={(<>&nbsp;</>)}
      >
        <ListItemIcon />
        <ListItemText
          primary={(
            <SortHeadersComponentV2
              headers={headersFromColumns(columns(props.config))}
              inlineStylesHeaders={stylesFromEntityType(props.elements)}
              sortHelpers={queryableHelpers.sortHelpers}
            />
          )}
        />
      </MuiListItem>
      {props.elements.map(e =>
        <MuiListItem key={e.base_id} divider disablePadding secondaryAction={getTypedSecondaryAction(e)}>{getTypedUiElement(e, columns(props.config))}</MuiListItem>,
      )}
    </MuiList>
  );
};

export default List;
