import React, { FunctionComponent, useState } from 'react';
import { PublishedWithChangesOutlined } from '@mui/icons-material';
import { Alert, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { InjectExpectationsStore } from '../../injects/expectations/Expectation';
import type { Contract } from '../../../../../utils/api-types';
import ExpectationLine from './ExpectationLine';
import Drawer from '../../../../../components/common/Drawer';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';

const useStyles = makeStyles((theme: Theme) => ({
  buttons: {
    display: 'flex',
    placeContent: 'end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  message: {
    width: '100%',
  },
  marginBottom_2: {
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  expectation: InjectExpectationsStore;
  injectContract: Contract;
  gap?: number;
}

const TechnicalExpectationAsset: FunctionComponent<Props> = ({
  expectation,
  injectContract,
  gap,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const [open, setOpen] = useState(false);

  return (
    <>
      <ExpectationLine
        expectation={expectation}
        info={injectContract.config.label?.en}
        title={injectContract.label.en}
        icon={<PublishedWithChangesOutlined fontSize="small" />}
        onClick={() => setOpen(true)}
        gap={gap}
      />
      <Drawer
        open={open}
        handleClose={() => setOpen(false)}
        title={t('Expectations of ') + injectContract.label.en}
      >
        <>
          <Alert
            classes={{ message: classes.message }}
            severity="info"
            icon={false}
            variant="outlined"
            className={classes.marginBottom_2}
          >
            {!!expectation.inject_expectation_result
              && <>
                <pre>
                  {expectation.inject_expectation_asset
                    && Object.entries(JSON.parse(expectation.inject_expectation_result))
                      .map(([key, value]) => {
                        return (
                          <div key={key} style={{ display: 'flex' }}>
                            <span>{key} : </span>
                            <span>{value?.toString()}</span>
                          </div>);
                      })
                  }
                </pre>
              </>
            }
            {!expectation.inject_expectation_result && t('Pending result')}
          </Alert>
          <div className={classes.buttons}>
            <Button
              variant="contained"
              onClick={() => setOpen(false)}
            >
              {t('Close')}
            </Button>
          </div>
        </>
      </Drawer>
    </>
  );
};

export default TechnicalExpectationAsset;
