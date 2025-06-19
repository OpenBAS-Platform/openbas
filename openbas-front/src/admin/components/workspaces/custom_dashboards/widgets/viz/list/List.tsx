import {List as MuiList, ListItem as MuiListItem, ListItemIcon, ListItemText} from '@mui/material';

import {type EsBase, type EsEndpoint} from '../../../../../../../utils/api-types';
import SortHeadersComponentV2 from "../../../../../../../components/common/queryable/sort/SortHeadersComponentV2";
import {makeStyles} from "tss-react/mui";
import {
  useQueryableWithLocalStorage
} from "../../../../../../../components/common/queryable/useQueryableWithLocalStorage";
import {buildSearchPagination} from "../../../../../../../components/common/queryable/QueryableUtils";
import {initSorting} from "../../../../../../../components/common/queryable/Page";
import {Header} from "../../../../../../../components/common/SortHeadersList";
import EndpointListElement, { inlineStyles as EndpointElementStyles } from "./elements/EndpointListElement";
import DefaultListElement, { inlineStyles as DefaultElementStyles } from "./elements/DefaultListElement";
import { ArrowRight } from 'mdi-material-ui';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

type Props = {
  columns: string[];
  elements: EsBase[];
};

const List = (props: Props) => {
  const { classes } = useStyles();

  const headersFromColumns = (columns: string[]) : Header[] => {
    return columns.map(col => {
      return {
        field: col,
        label: col,
        isSortable: false,
      }
    });
  }

  const stylesFromEntityType = (entityType: string) => {
    switch (entityType) {
      case 'endpoint': return EndpointElementStyles;
      default: return DefaultElementStyles;
    }
  }

  const { queryableHelpers } = useQueryableWithLocalStorage('asset', buildSearchPagination({
    sorts: initSorting('asset_name'),
  }));

  const getTypedUiElement = (element: EsBase, columns: string[]) => {
    switch (element.base_entity) {
      case 'endpoint': return (<EndpointListElement element={element as EsEndpoint} columns={columns} />);
      default: return (<DefaultListElement columns={columns} element={element} />);
    }
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
                    headers={headersFromColumns(props.columns)}
                    inlineStylesHeaders={stylesFromEntityType(props.elements[0].base_entity)}
                    sortHelpers={queryableHelpers.sortHelpers}
                />
            )}
        />
      </MuiListItem>
      {props.elements.map(e =>
          <MuiListItem key={e.base_id} divider disablePadding>{getTypedUiElement(e, props.columns)}</MuiListItem>
      )}
    </MuiList>
  );
};

export default List;
