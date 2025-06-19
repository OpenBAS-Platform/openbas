import { Description } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import useBodyItemsStyles from '../../../../../../../../../components/common/queryable/style/style';
import { type EsBase, type EsEndpoint } from '../../../../../../../../../utils/api-types';
import DefaultElementStyles from './DefaultElementStyles';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

type Props = {
  columns: string[];
  element: EsBase;
};

const DefaultListElement = (props: Props) => {
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();

  const elementsFromColumn = (column: string) => {
    switch (column) {
      default: return (endpoint: EsEndpoint) => {
        const key = column as keyof typeof endpoint;
        return endpoint[key];
      };
    }
  };

  return (
    <>
      <ListItemButton classes={{ root: classes.item }} className="noDrag">
        <ListItemIcon>
          <Description color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={(
            <div style={bodyItemsStyles.bodyItems}>
              {props.columns.map(col => (
                <div
                  key={col}
                  style={{
                    ...bodyItemsStyles.bodyItem,
                    ...DefaultElementStyles[col],
                  }}
                >
                  {elementsFromColumn(col)(props.element)}
                </div>
              ))}
            </div>
          )}
        />
      </ListItemButton>
    </>
  );
};

export default DefaultListElement;
