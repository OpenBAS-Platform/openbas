import { List as MuiList } from '@mui/material';

import { type EsBase } from '../../../../../../../utils/api-types';
import ListItem from './ListItem';

type Props = {
  columns: string[];
  elements: EsBase[];
};

const List = (props: Props) => {
  return (
    <MuiList>
      {props.elements.map(e =>
        <ListItem element={e} columns={props.columns} />,
      )}
    </MuiList>
  );
};

export default List;
