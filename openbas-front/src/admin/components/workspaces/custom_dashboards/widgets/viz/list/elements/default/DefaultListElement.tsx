import { Description } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import ElementWithPopoverFragment
  from '../../../../../../../../../components/common/list/fragments/ElementWithPopoverFragment';
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
};

const DefaultListElement = (props: Props) => {
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();

  const elementsFromColumn = (column: string) => {
    switch (column) {
      // Cannot set a display name here
      // eslint-disable-next-line react/display-name
      default: return (element: EsBase) => {
        const key = column as keyof typeof element;
        const text = element[key]?.toString() || '';
        const richText = Object.prototype.toString.call(element[key]) === '[object Array]'
          ? <ul>{(element[key] as string[])?.map(itm => <li key={key.toString()}>{itm.toString()}</li>)}</ul>
          : <span>{element[key]?.toString()}</span>;
        return (
          <ElementWithPopoverFragment simpleText={text} richText={richText} />
        );
      };
    }
  };

  return (
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
  );
};

DefaultListElement.displayName = 'DefaultListElement';

export default DefaultListElement;
