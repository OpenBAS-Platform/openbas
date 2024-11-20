import { Chip, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Props } from 'html-react-parser/lib/attributes-to-props';
import { FunctionComponent, useContext } from 'react';

import { useFormatter } from '../../../../components/i18n';
import ItemCopy from '../../../../components/ItemCopy';
import ItemTags from '../../../../components/ItemTags';
import PlatformIcon from '../../../../components/PlatformIcon';
import { AttackPatternSimple, PayloadArgument, PayloadPrerequisite } from '../../../../utils/api-types';
import { emptyFilled } from '../../../../utils/String';
import { InjectResultOverviewOutputContext, InjectResultOverviewOutputContextType } from '../InjectResultOverviewOutputContext';

const useStyles = makeStyles(() => ({
  paper: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    height: '100%',
  },
  chip: {
    fontSize: 12,
    height: 25,
    margin: '0 7px 7px 0',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 180,
  },
}));

const AtomicTestingPayloadInfo: FunctionComponent<Props> = () => {
  const classes = useStyles();
  const { t } = useFormatter();

  // Fetching data
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} style={{ marginBottom: 30 }}>
        <Typography variant="h4">{t('Payload')}</Typography>
        {injectResultOverviewOutput ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography
              variant="h2"
              gutterBottom
            >
              {injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_name}
            </Typography>

            <Typography
              variant="body2"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {emptyFilled(injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_description)}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Platforms')}
                </Typography>
                {(injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_platforms ?? []).length === 0 ? (
                  <PlatformIcon platform={t('No inject in this scenario')} tooltip width={25} />
                ) : injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_platforms?.map(
                  platform => <PlatformIcon key={platform} platform={platform} tooltip width={25} marginRight={10} />,
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Attack patterns')}
                </Typography>
                {injectResultOverviewOutput.inject_attack_patterns && injectResultOverviewOutput.inject_attack_patterns.length === 0 ? '-' : injectResultOverviewOutput.inject_attack_patterns?.map((attackPattern: AttackPatternSimple) => (
                  <Tooltip key={attackPattern.attack_pattern_id} title={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}>
                    <Chip
                      variant="outlined"
                      classes={{ root: classes.chip }}
                      color="primary"
                      label={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}
                    />
                  </Tooltip>
                ))}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Tags')}
                </Typography>
                <ItemTags
                  variant="reduced-view"
                  tags={injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_tags}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('External ID')}
                </Typography>
                {emptyFilled(injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_external_id)}
              </Grid>
            </Grid>

          </Paper>
        ) : (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="body1">{t('No data available')}</Typography>
          </Paper>
        )}
      </Grid>
      <Grid item xs={12} style={{ marginBottom: 30 }}>
        <Typography variant="h4">{t('Commands')}</Typography>
        {injectResultOverviewOutput ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.payload_type === 'Command' && (
              <>
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {t('Command executor')}
                </Typography>
                {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.command_executor}
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Attack command')}
                </Typography>
                <pre>
                  <ItemCopy content={
                    injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.command_content ?? ''
                  }
                  />
                </pre>
              </>
            )}
            {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.payload_type === 'Executable' && (
              <>
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {t('Executable files')}
                </Typography>
                {
                  injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.executable_file !== undefined
                    ? (
                        <Typography variant="body1">
                          {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.executable_file?.document_name ?? '-'}
                        </Typography>
                      )
                    : (
                        <Typography variant="body1" gutterBottom>
                          -
                        </Typography>
                      )
                }
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Architecture')}
                </Typography>
                {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.executable_arch}
              </>
            )}
            {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.payload_type === 'File' && (
              <>
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {t('File drop file')}
                </Typography>
                {
                  injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.file_drop_file !== undefined
                    ? (
                        <Typography variant="body1">
                          {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.file_drop_file?.document_name ?? '-'}
                        </Typography>
                      )
                    : (
                        <Typography variant="body1" gutterBottom>
                          -
                        </Typography>
                      )
                }
              </>
            )}
            {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.payload_type === 'Dns' && (
              <>
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {t('Dns resolution hostname')}
                </Typography>
                {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.dns_resolution_hostname}
              </>
            )}
            {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.payload_type === 'Network' && (
              <>
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {t('Network traffic ip destination')}
                </Typography>
                {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.network_traffic_ip_dst}
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {t('Network traffic port destination')}
                </Typography>
                {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.network_traffic_port_dst}
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {t('Network traffic ip source')}
                </Typography>
                {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.network_traffic_ip_src}
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {t('Network traffic port source')}
                </Typography>
                {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.network_traffic_port_src}
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {t('Network traffic protocol')}
                </Typography>
                {injectResultOverviewOutput?.inject_injector_contract?.injector_contract_payload?.network_traffic_protocol}
              </>
            )}
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Arguments')}
            </Typography>
            {
              !injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_arguments?.length ? '-'
                : (
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                            <TableCell width="30%">{t('Type')}</TableCell>
                            <TableCell width="30%">{t('Key')}</TableCell>
                            <TableCell width="30%">{t('Default value')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_arguments?.map((argument: PayloadArgument) => {
                            return (
                              <>
                                <TableRow
                                  key={argument.key}
                                >
                                  <TableCell>
                                    {argument.type}
                                  </TableCell>
                                  <TableCell>
                                    {argument.key}
                                  </TableCell>
                                  <TableCell>
                                    <pre>
                                      <ItemCopy content={argument.default_value} />
                                    </pre>
                                  </TableCell>
                                </TableRow>
                              </>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
            }

            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Prerequisites')}
            </Typography>
            {
              injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_prerequisites && injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_prerequisites.length === 0 ? '-'
                : (
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                            <TableCell width="30%">{t('Command executor')}</TableCell>
                            <TableCell width="30%">{t('Get command')}</TableCell>
                            <TableCell width="30%">{t('Check command')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_prerequisites?.map((prerequisite: PayloadPrerequisite) => {
                            return (
                              <>
                                <TableRow
                                  key={prerequisite.executor}
                                >
                                  <TableCell>
                                    {prerequisite.executor}
                                  </TableCell>
                                  <TableCell>
                                    <pre>
                                      <ItemCopy content={prerequisite.get_command} />
                                    </pre>
                                  </TableCell>
                                  <TableCell>
                                    {prerequisite.check_command !== undefined
                                      ? (
                                          <pre>
                                            <ItemCopy content={prerequisite.check_command} />
                                          </pre>
                                        ) : '-'}
                                  </TableCell>
                                </TableRow>
                              </>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
            }
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Cleanup executor')}
            </Typography>
            {emptyFilled(injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_cleanup_executor)}
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Cleanup command')}
            </Typography>
            {injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_cleanup_command
            && injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_cleanup_command.length > 0
              ? <pre><ItemCopy content={injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload?.payload_cleanup_command} /></pre> : '-'}
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

export default AtomicTestingPayloadInfo;
