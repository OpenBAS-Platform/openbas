import {EsBase, EsEndpoint} from "../../../../../../../utils/api-types";
import { ListItem as MuiListItem } from '@mui/material';
import EndpointElement from "./elements/EndpointElement";


type Props = {
    columns: string[]
    element: EsBase
}

const getTypedUiElement = (element: EsBase, columns: string[]) => {
    switch (element.base_entity) {
        case 'endpoint': return (<EndpointElement element={element as EsEndpoint} columns={columns} />);
        default: return (<div>{element.base_entity}: {element.base_representative}</div>)
    }
}

const ListItem = (props: Props) => {
    return (
        <MuiListItem>{getTypedUiElement(props.element, props.columns)}</MuiListItem>
    );
}

export default ListItem;