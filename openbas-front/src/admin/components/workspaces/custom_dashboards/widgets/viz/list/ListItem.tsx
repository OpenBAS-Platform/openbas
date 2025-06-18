import { ListItem as MuiListItem } from '@mui/material';

import { type EsBase, type EsEndpoint } from '../../../../../../../utils/api-types';
import EndpointElement from './elements/EndpointElement';
import DefaultElement from "./elements/DefaultElement";

type Props = {
  columns: string[];
  element: EsBase;
};

const getTypedUiElement = (element: EsBase, columns: string[]) => {
  switch (element.base_entity) {
    case 'endpoint': return (<EndpointElement element={element as EsEndpoint} columns={columns} />);
    default: return (<DefaultElement columns={columns} element={element} />);
  }
};

const ListItem = (props: Props) => {
  return (
    <MuiListItem>{getTypedUiElement(props.element, props.columns)}</MuiListItem>
  );
};

export default ListItem;
