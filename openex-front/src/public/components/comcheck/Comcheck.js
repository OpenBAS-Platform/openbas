import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import { useParams } from 'react-router-dom';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import { fetchComcheckStatus } from '../../../actions/Comcheck';
import logo from '../../../resources/images/logo.png';
import { useFormatter } from '../../../components/i18n';
import { useStore } from '../../../store';

const useStyles = makeStyles(() => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: 500,
  },
  content: {
    width: '100%',
    padding: 20,
  },
  appBar: {
    textAlign: 'center',
  },
  comcheck: {
    borderRadius: '10px',
    paddingBottom: '15px',
  },
  logo: {
    width: 200,
    margin: '0px 0px 50px 0px',
  },
  subtitle: {
    width: '100%',
    color: '#ffffff',
    fontWeight: 400,
    fontSize: 18,
    textAlign: 'center',
  },
}));

const Comcheck = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { fldt, t } = useFormatter();
  const { statusId } = useParams();
  const status = useStore((store) => store.getComcheckStatus(statusId));
  useEffect(() => {
    dispatch(fetchComcheckStatus(statusId));
  }, []);
  const [dimension, setDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const updateWindowDimensions = () => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  };
  useEffect(() => {
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  });
  const comcheckHeight = 200;
  const marginTop = dimension.height / 2 - comcheckHeight / 2 - 200;
  return (
    <div className={classes.container} style={{ marginTop }}>
      <img src={logo} alt="logo" className={classes.logo} />
      <Paper variant="outlined">
        <AppBar color="primary" position="relative" className={classes.appBar}>
          <Toolbar>
            <div className={classes.subtitle}>{t('Communication check')}</div>
          </Toolbar>
        </AppBar>
        <div className={classes.content}>
          {t('Your communication check is')}
          &nbsp;
          <strong>
            {status?.status_receive_date ? t('successfull') : t('failed')}
          </strong>
          .
          <br />
          <CheckCircleOutlineOutlined color="success" sx={{ fontSize: 50 }} />
          <br />
          <pre>
            {t('Verification done at')} {fldt(status?.status_receive_date)}.
          </pre>
        </div>
      </Paper>
    </div>
  );
};

export default Comcheck;
