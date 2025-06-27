import { Description } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { type ReactNode, useEffect } from 'react';
import { makeStyles } from 'tss-react/mui';

import useBodyItemsStyles from '../../../../../../../../../components/common/queryable/style/style';
import { type EsBase } from '../../../../../../../../../utils/api-types';
import buildStyles from '../ColumnStyles';
import DefaultElementStyles from './DefaultElementStyles';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

type Props = {
  columns: string[];
  element: EsBase;
  secondaryAction: (node: ReactNode) => void;
};

const DefaultListElement = (props: Props) => {
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();

  useEffect(() => {
    props.secondaryAction(<>&nbsp;</>);
  }, [props.secondaryAction]);

  const elementsFromColumn = (column: string) => {
    switch (column) {
      default: return (element: EsBase) => {
        const key = column as keyof typeof element;
        return element[key];
      };
    }
  };

  return (
    <>
      <ListItemButton classes={{ root: classes.item }} inert={true}>
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
                    ...buildStyles(props.columns, DefaultElementStyles)[col],
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
