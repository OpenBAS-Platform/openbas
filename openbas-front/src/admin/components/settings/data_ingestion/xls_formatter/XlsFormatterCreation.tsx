import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useFormatter } from '../../../../../components/i18n';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { MapperAddInput } from '../../../../../utils/api-types';
import { addMapper } from '../../../../../actions/xls_formatter/xls-formatter-actions';
import Drawer from '../../../../../components/common/Drawer';
import MapperForm from './MapperForm';

const useStyles = makeStyles(() => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
}));

const XlsFormatterCreation = () => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const onSubmit = ((data: MapperAddInput) => {
    dispatch(addMapper(data)).then(
      (result: never) => {
        return result;
      },
    );
    setOpen(false);
  });

  return (
    <>
      <Fab
        onClick={() => setOpen(true)}
        color="primary"
        aria-label="Add"
        className={classes.createButton}
      >
        <Add />
      </Fab>
      <Drawer
        open={open}
        handleClose={() => setOpen(false)}
        title={t('Create a xls mapper')}
      >
        <MapperForm
          OnSubmit={onSubmit}
          handleClose={() => setOpen(true)}
        />
      </Drawer>
    </>
  );
};

export default XlsFormatterCreation;
