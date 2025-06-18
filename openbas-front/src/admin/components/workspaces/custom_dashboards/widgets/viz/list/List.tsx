import {List as MuiList, ListItem as MuiListItem, ListItemIcon, ListItemText} from '@mui/material';

import {type EsBase, type EsEndpoint} from '../../../../../../../utils/api-types';
import ListItem from './ListItem';
import SortHeadersComponentV2 from "../../../../../../../components/common/queryable/sort/SortHeadersComponentV2";
import {makeStyles} from "tss-react/mui";
import {
  useQueryableWithLocalStorage
} from "../../../../../../../components/common/queryable/useQueryableWithLocalStorage";
import {buildSearchPagination} from "../../../../../../../components/common/queryable/QueryableUtils";
import {initSorting} from "../../../../../../../components/common/queryable/Page";
import {Header} from "../../../../../../../components/common/SortHeadersList";
import { inlineStyles } from "./elements/EndpointElement";

type Props = {
  columns: string[];
  elements: EsBase[];
};

const List = (props: Props) => {
  const useStyles = makeStyles()(() => ({
    itemHead: { textTransform: 'uppercase' },
    item: { height: 50 },
  }));
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
      case 'endpoint': return inlineStyles;
      default: return {};
    }
  }

  const { queryableHelpers } = useQueryableWithLocalStorage('asset', buildSearchPagination({
    sorts: initSorting('asset_name'),
  }));


  return (
    <MuiList>
      <MuiListItem
          classes={{ root: classes.itemHead }}
          style={{ paddingTop: 0 }}
          secondaryAction={<>&nbsp;</>}
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
        <ListItem element={e} columns={props.columns} />,
      )}
    </MuiList>
  );
};

export default List;
