import { makeStyles } from 'tss-react/mui';

const useBodyItemsStyles = makeStyles()(() => ({
  bodyItems: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

export default useBodyItemsStyles;
