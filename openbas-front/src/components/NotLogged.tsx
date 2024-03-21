import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { useFormatter } from './i18n';

const NotLogged = () => {
  const { t } = useFormatter();
  return (
    <div>
      <Alert severity="info">
        <AlertTitle>{t('Error')}</AlertTitle>
        {t('You must be logged to access this page')}
      </Alert>
    </div>
  );
};

export default NotLogged;
