import React, { FunctionComponent, useContext } from 'react';
import { Props } from 'html-react-parser/lib/attributes-to-props';
import { Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import ItemStatus from '../../../../components/ItemStatus';
import { InjectResultDtoContext, InjectResultDtoContextType } from '../InjectResultDtoContext';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchDocuments } from '../../../../actions/Document';
import type { DocumentHelper } from '../../../../actions/helper';

const useStyles = makeStyles(() => ({
  paper: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    height: '100%',
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  header: {
    fontWeight: 'bold',
  },
  listItem: {
    marginBottom: 8,
  },
}));

const AtomicTestingDetail: FunctionComponent<Props> = () => {
  const classes = useStyles();
  const { t, tPick } = useFormatter();
  const dispatch = useAppDispatch();

  // Fetching data
  const { injectResultDto } = useContext<InjectResultDtoContextType>(InjectResultDtoContext);
  const { documentMap } = useHelper((helper: DocumentHelper) => ({
    documentMap: helper.getDocumentsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchDocuments());
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} style={{ marginBottom: 30 }}>
        <Typography variant="h4">{t('Configuration')}</Typography>
        {injectResultDto ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <div className={classes.flexContainer}>
              <div>
                <Typography variant="subtitle1" className={classes.header} gutterBottom>
                  {t('Description')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {injectResultDto?.inject_description || '-'}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle1" className={classes.header} gutterBottom>
                  {t('Type')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {tPick(injectResultDto.inject_injector_contract?.injector_contract_labels)}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle1" className={classes.header} gutterBottom>
                  {t('Expectations')}
                </Typography>
                {
                  injectResultDto.inject_expectations !== undefined && injectResultDto.inject_expectations.length > 0
                    ? Array.from(new Set(injectResultDto.inject_expectations.map((expectation) => expectation.inject_expectation_name)))
                      .map((name, index) => (
                        <Typography key={index} variant="body1">
                          {name}
                        </Typography>
                      ))
                    : <Typography variant="body1" gutterBottom>
                      {'-'}
                    </Typography>
                }
              </div>
              <div style={{ marginRight: 50 }}>
                <Typography variant="subtitle1" className={classes.header} gutterBottom>
                  {t('Documents')}
                </Typography>
                {
                  injectResultDto.injects_documents !== undefined && injectResultDto.injects_documents.length > 0
                    ? injectResultDto.injects_documents.map((documentId) => {
                      const document = documentMap[documentId];
                      return (
                        <Typography key={documentId} variant="body1">
                          {document?.document_name ?? '-'}
                        </Typography>
                      );
                    }) : <Typography variant="body1" gutterBottom>
                      {'-'}
                    </Typography>
                }
              </div>
            </div>
          </Paper>
        ) : (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="body1">{t('No data available')}</Typography>
          </Paper>
        )}
      </Grid>
      <Grid item xs={6} style={{ marginBottom: 30 }}>
        <Typography variant="h4">{t('Command Lines')}</Typography>
        {injectResultDto ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="subtitle1" className={classes.header} gutterBottom>
              {t('Content')}
            </Typography>
            {(injectResultDto.inject_commands_lines?.content?.length ?? 0) > 0 ? <pre>
              <Typography variant="body1" gutterBottom>
                {injectResultDto.inject_commands_lines?.content?.map((content, index) => (
                  <li key={index}>{content}</li>
                ))}
              </Typography>
            </pre> : '-'}
            <Typography variant="subtitle1" className={classes.header} gutterBottom>
              {t('Cleanup command')}
            </Typography>
            {(injectResultDto.inject_commands_lines?.cleanup_command?.length ?? 0) > 0 ? <pre>
              <Typography variant="body1" gutterBottom>
                {injectResultDto.inject_commands_lines?.cleanup_command?.map((content, index) => (
                  <li key={index}>{content}</li>
                ))}
              </Typography>
            </pre> : '-'}
            <Typography variant="subtitle1" className={classes.header} gutterBottom>
              {t('External ID')}
            </Typography>
            {injectResultDto.inject_commands_lines?.external_id ? <pre>
              <Typography variant="body1" gutterBottom>
                {injectResultDto.inject_commands_lines?.external_id}
              </Typography>
            </pre> : '-'}
          </Paper>
        ) : (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="body1">{t('No data available')}</Typography>
          </Paper>
        )}
      </Grid>
      <Grid item xs={6} style={{ marginBottom: 30 }}>
        <Typography variant="h4">{t('Execution logs')}</Typography>
        {injectResultDto ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="subtitle1" className={classes.header} gutterBottom>
              {t('Status')}
            </Typography>
            {injectResultDto.inject_status?.status_name
              && <ItemStatus isInject={true} status={injectResultDto.inject_status?.status_name} label={t(injectResultDto.inject_status?.status_name)} />
            }
            <Typography variant="subtitle1" className={classes.header} style={{ marginTop: 20 }} gutterBottom>
              {t('Traces')}
            </Typography>
            <pre>
              {injectResultDto.inject_status?.tracking_sent_date ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Sent Date')}: {injectResultDto.inject_status?.tracking_sent_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Ack Date')}: {injectResultDto.inject_status?.tracking_ack_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking End Date')}: {injectResultDto.inject_status?.tracking_end_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Execution')}
                    {t('Time')}: {injectResultDto.inject_status?.tracking_total_execution_time} {t('ms')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Count')}: {injectResultDto.inject_status?.tracking_total_count}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Error')}: {injectResultDto.inject_status?.tracking_total_error}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Success')}: {injectResultDto.inject_status?.tracking_total_success}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" gutterBottom>
                  {t('No data available')}
                </Typography>
              )}
              {(injectResultDto.inject_status?.status_traces?.length ?? 0) > 0 && (
                <>
                  <Typography variant="body1" gutterBottom>
                    {t('Traces')}:
                  </Typography>
                  <ul>
                    {injectResultDto.inject_status?.status_traces?.map((trace, index) => (
                      <li key={index} className={classes.listItem}>
                        {`${trace.execution_status} ${trace.execution_message}`}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </pre>
          </Paper>
        ) : (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="body1">{t('No data available')}</Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

export default AtomicTestingDetail;
