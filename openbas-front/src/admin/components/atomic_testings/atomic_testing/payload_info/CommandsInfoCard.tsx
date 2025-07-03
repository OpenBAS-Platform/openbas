import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { fetchDocuments } from '../../../../../actions/Document';
import type { DocumentHelper } from '../../../../../actions/helper';
import { useFormatter } from '../../../../../components/i18n';
import ItemCopy from '../../../../../components/ItemCopy';
import { useHelper } from '../../../../../store';
import type { Payload, PayloadArgument, PayloadPrerequisite, StatusPayloadOutput } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { emptyFilled } from '../../../../../utils/String';

const useStyles = makeStyles()(theme => ({
  paperContainer: { '& > *:nth-child(even)': { marginBottom: theme.spacing(2) } },
  tableContainer: { backgroundColor: theme.palette.background.paperInCard },
}));

interface Props {payloadOutput?: Payload | StatusPayloadOutput;}

const CommandsInfoCard = ({ payloadOutput }: Props) => {
  const { t } = useFormatter();
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  const { documentMap } = useHelper((helper: DocumentHelper) => ({ documentMap: helper.getDocumentsMap() }));
  useDataLoader(() => {
    dispatch(fetchDocuments());
  });

  if (!payloadOutput) {
    return (
      <Paper className="paper" variant="outlined">
        <Typography variant="body1">{t('No data available')}</Typography>
      </Paper>
    );
  }

  return (
    <Paper className={`paper ${classes.paperContainer}`} variant="outlined">
      {payloadOutput.payload_type === 'Command' && (
        <>
          <Typography variant="h3" gutterBottom>{t('Command executor')}</Typography>
          <Typography variant="body2">
            {emptyFilled(payloadOutput.command_executor)}
          </Typography>
          {payloadOutput.payload_obfuscator && (
            <>
              <Typography variant="h3" gutterBottom>{t('Obfuscator')}</Typography>
              <Typography key="obfuscator" variant="body2">{payloadOutput.payload_obfuscator}</Typography>
            </>
          )}
          <Typography variant="h3" gutterBottom>{t('Attack command')}</Typography>
          {!payloadOutput.command_content
            ? '-'
            : (
              <pre key={payloadOutput.command_content}>
                  <ItemCopy content={payloadOutput.command_content ?? ' '} />
                </pre>
            )}
        </>
      )}

      {payloadOutput.payload_type === 'Executable' && (
        <>
          <Typography variant="h3" gutterBottom>{t('Executable files')}</Typography>
          <Typography variant="body1">
            {payloadOutput.executable_file ? documentMap[payloadOutput.executable_file]?.document_name ?? '-' : '-'}
          </Typography>
          <Typography variant="h3" gutterBottom>{t('Architecture')}</Typography>
          <Typography variant="body1">
            {payloadOutput.payload_execution_arch}
          </Typography>
        </>
      )}

      {payloadOutput.payload_type === 'FileDrop' && (
        <>
          <Typography variant="h3" gutterBottom>{t('Executable files')}</Typography>
          <Typography variant="body1">
            {payloadOutput.file_drop_file ? documentMap[payloadOutput.file_drop_file]?.document_name ?? '-' : '-'}
          </Typography>
        </>
      )}

      {payloadOutput.payload_type === 'DnsResolution' && (
        <>
          <Typography variant="h3" gutterBottom>{t('Dns resolution hostname')}</Typography>
          <Typography variant="body1">
            {payloadOutput.dns_resolution_hostname ?? '-'}
          </Typography>
        </>
      )}

      <Typography variant="h3" gutterBottom>{t('Arguments')}</Typography>
      {payloadOutput.payload_arguments?.length === 0 ? '-' : (
        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="Table to show payload's arguments">
            <TableHead sx={{
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}
            >
              <TableCell width="30%">{t('Type')}</TableCell>
              <TableCell width="30%">{t('Key')}</TableCell>
              <TableCell width="30%">{t('Default value')}</TableCell>
            </TableHead>
            <TableBody>
              {payloadOutput.payload_arguments?.map((argument: PayloadArgument) => (
                <>
                  <TableRow key={argument.key}>
                    <TableCell>{argument.type}</TableCell>
                    <TableCell>{argument.key}</TableCell>
                    <TableCell>
                      <pre><ItemCopy content={argument.default_value} /></pre>
                    </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h3" gutterBottom>{t('Prerequisites')}</Typography>
      {payloadOutput.payload_prerequisites?.length === 0 ? '-' : (
        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="Table to show payload's prerequisites">
            <TableHead sx={{
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}
            >
              <TableCell width="30%">{t('Command executor')}</TableCell>
              <TableCell width="30%">{t('Get command')}</TableCell>
              <TableCell width="30%">{t('Check command')}</TableCell>
            </TableHead>
            <TableBody>
              {payloadOutput.payload_prerequisites?.map((prerequisite: PayloadPrerequisite) => (
                <>
                  <TableRow key={prerequisite.executor}>
                    <TableCell>{prerequisite.executor}</TableCell>
                    <TableCell>
                      <pre>
                        <ItemCopy content={prerequisite.get_command} />
                      </pre>
                    </TableCell>
                    <TableCell>
                      {prerequisite.check_command !== undefined && prerequisite.check_command !== '' ? (
                        <pre><ItemCopy content={prerequisite.check_command} /></pre>) : '-'}
                    </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h3" gutterBottom>{t('Cleanup executor')}</Typography>
      <Typography variant="body1">
        {emptyFilled(payloadOutput.payload_cleanup_executor)}
      </Typography>

      <Typography variant="h3" gutterBottom>{t('Cleanup command')}</Typography>
      {/*FIXME*/}
      {/*{payloadOutput.payload_cleanup_command?.map((cleanupCommand: string) => (*/}
      {/*  !cleanupCommand*/}
      {/*    ? '-'*/}
      {/*    : (*/}
      {/*      <pre key={cleanupCommand}>*/}
      {/*            <ItemCopy key={cleanupCommand} content={cleanupCommand} />*/}
      {/*        </pre>*/}
      {/*    )*/}
      {/*))}*/}
    </Paper>
  );
};

export default CommandsInfoCard;
