import { List as MuiList } from '@mui/material';
import ListItem from './ListItem';
import {EsBase} from "../../../../../../../utils/api-types";

type Props = {
    columns: string[];
    elements: EsBase[];
}

const List = (props: Props) => {
    return (
        <MuiList>
            {props.elements.map(e =>
                <ListItem element={e} columns={props.columns} />
            )}
        </MuiList>
    );
}

export default List;