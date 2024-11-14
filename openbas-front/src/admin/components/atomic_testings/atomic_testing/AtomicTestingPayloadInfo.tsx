import { Chip, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Props } from 'html-react-parser/lib/attributes-to-props';
import { FunctionComponent, useContext } from 'react';

import { AttackPatternHelper } from '../../../../actions/attack_patterns/attackpattern-helper';
import { useFormatter } from '../../../../components/i18n';
import ItemCopy from '../../../../components/ItemCopy';
import ItemTags from '../../../../components/ItemTags';
import PlatformIcon from '../../../../components/PlatformIcon';
import { useHelper } from '../../../../store';
import { AttackPattern, PayloadArgument, PayloadPrerequisite } from '../../../../utils/api-types';
import { emptyFilled } from '../../../../utils/String';
import { InjectResultDtoContext, InjectResultDtoContextType } from '../InjectResultDtoContext';

const useStyles = makeStyles(() => ({
  paper: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    height: '100%',
  },
}));

const AtomicTestingPayloadInfo: FunctionComponent<Props> = () => {
  const classes = useStyles();
  const { t, tPick } = useFormatter();

  // Fetching data
  const { injectResultDto } = useContext<InjectResultDtoContextType>(InjectResultDtoContext);
  const { attackPatternsMap } = useHelper((helper: AttackPatternHelper) => ({
    attackPatternsMap: helper.getAttackPatternsMap(),
  }));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} style={{ marginBottom: 30 }}>
        <Typography variant="h4">{t('Payload')}</Typography>
        {injectResultDto ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography
              variant="h2"
              gutterBottom
            >
              {/* {injectResultDto?.inject_title} */}
            </Typography>

            <Typography
              variant="body2"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {/* {emptyFilled(injectResultDto?.inject_description)} */}
            </Typography>
            <Grid item xs={6} style={{ marginBottom: 30 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Platforms')}
              </Typography>
              {/* {(selectedPayload?.payload_platforms ?? []).length === 0 ? (
                <PlatformIcon platform={t('No inject in this scenario')} tooltip width={25} />
              ) : selectedPayload?.payload_platforms?.map(
                platform => <PlatformIcon key={platform} platform={platform} tooltip width={25} marginRight={10} />,
              )} */}
            </Grid>
            <Grid item xs={6} style={{ marginBottom: 30 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Attack patterns')}
              </Typography>
              {/* {selectedPayload?.payload_attack_patterns && selectedPayload?.payload_attack_patterns.length === 0 ? '-' : selectedPayload?.payload_attack_patterns?.map((attackPatternId: string) => attackPatternsMap[attackPatternId]).map((attackPattern: AttackPattern) => (
                <Tooltip key={attackPattern.attack_pattern_id} title={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}>
                  <Chip
                    variant="outlined"
                    classes={{ root: classes.chip }}
                    color="primary"
                    label={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}
                  />
                </Tooltip>
              ))} */}
            </Grid>
            <Grid item xs={6} style={{ marginBottom: 30 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('Tags')}
              </Typography>
              {/* <ItemTags
                variant="reduced-view"
                tags={selectedPayload?.payload_tags}
              /> */}
            </Grid>
            <Grid item xs={6} style={{ marginBottom: 30 }}>
              <Typography
                variant="h3"
                gutterBottom
                style={{ marginTop: 20 }}
              >
                {t('External ID')}
              </Typography>
              {/* {selectedPayload?.payload_external_id && selectedPayload?.payload_external_id.length > 0 ? (
                <pre>
            <ItemCopy content={selectedPayload?.payload_external_id} />
          </pre>
              ) : '-'} */}
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
        {injectResultDto ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography
              variant="h3"
              gutterBottom
            >
              {t('Command executor')}
            </Typography>
            {/* {selectedPayload?.command_executor} */}
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Attack commands')}
            </Typography>
            <pre>
              {/* <ItemCopy content={
                selectedPayload?.command_content ?? selectedPayload?.dns_resolution_hostname ?? selectedPayload?.file_drop_file ?? selectedPayload?.executable_file ?? ''
              }
              /> */}
            </pre>
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Arguments')}
            </Typography>
            {/* {
              !selectedPayload?.payload_arguments?.length ? '-'
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
                          {selectedPayload?.payload_arguments?.map((argument: PayloadArgument) => {
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
                                    {argument.default_value}
                                  </TableCell>
                                </TableRow>
                              </>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
            } */}

            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Prerequisites')}
            </Typography>
            {/* {
              selectedPayload?.payload_prerequisites && selectedPayload?.payload_prerequisites.length === 0 ? '-'
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
                          {selectedPayload?.payload_prerequisites?.map((prerequisite: PayloadPrerequisite) => {
                            return (
                              <>
                                <TableRow
                                  key={prerequisite.executor}
                                >
                                  <TableCell>
                                    {prerequisite.executor}
                                  </TableCell>
                                  <TableCell>
                                    {prerequisite.get_command}
                                  </TableCell>
                                  <TableCell>
                                    {prerequisite.check_command}
                                  </TableCell>
                                </TableRow>
                              </>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
            } */}
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Cleanup executor')}
            </Typography>
            {/* {emptyFilled(selectedPayload?.payload_cleanup_executor)} */}
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Cleanup commands')}
            </Typography>
            {/* {selectedPayload?.payload_cleanup_command && selectedPayload?.payload_cleanup_command.length > 0
              ? <pre><ItemCopy content={selectedPayload?.payload_cleanup_command} /></pre> : '-'} */}
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
