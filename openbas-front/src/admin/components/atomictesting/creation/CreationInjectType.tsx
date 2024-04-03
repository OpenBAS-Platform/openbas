import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { Button } from '@mui/material';
import { useFormatter } from '../../../../components/i18n';
import SearchInput from '../../../../components/SearchFilter';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  },
  menuContainer: {
    float: 'left',
    marginLeft: 30,
  },
}));

interface Props {

}

const CreationInjectType: FunctionComponent<Props> = () => {
  const classes = useStyles();
  const { t } = useFormatter();
  return (
    <div className={classes.inline}>
      <div className={classes.menuContainer}>
        <SearchInput
          variant="topBar"
          placeholder={`${t('Search inject')}...`}
          fullWidth={true}
        />
      </div>
      <div>
        <Button>MITRE FILTER</Button>
      </div>
    </div>
  );
};

export default CreationInjectType;
