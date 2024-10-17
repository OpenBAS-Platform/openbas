import React, { CSSProperties, useState } from 'react';
import { Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import { SubmitHandler } from 'react-hook-form';
import { useFormatter } from '../../../../../components/i18n';
import type { InjectResultDTO, ReportInjectComment } from '../../../../../utils/api-types';
import ItemTargets from '../../../../../components/ItemTargets';
import AtomicTestingResult from '../../../atomic_testings/atomic_testing/AtomicTestingResult';
import InjectorContract from '../../../common/injects/InjectorContract';
import Dialog from '../../../../../components/common/Dialog';
import MarkDownField from '../../../../../components/fields/MarkDownField';
import ExpandableMarkdown from '../../../../../components/ExpandableMarkdown';

interface Props {
  style?: CSSProperties;
  injects: InjectResultDTO[];
  initialInjectComments?: ReportInjectComment[];
  canEditComment?: boolean;
  onCommentSubmit?: SubmitHandler<ReportInjectComment>;
}

const InjectReportResult: React.FC<Props> = ({
  style,
  injects,
  initialInjectComments = [],
  canEditComment = false,
  onCommentSubmit = () => {},
}) => {
  // Standard hooks
  const { t, fldt, tPick } = useFormatter();

  const [injectsComments, setInjectsComments] = useState<ReportInjectComment[]>(initialInjectComments);
  const [injectCommentEdited, setInjectCommentEdited] = useState<ReportInjectComment | null>(null);

  const [openEditInjectComment, setOpenEditInjectComment] = useState(false);
  const findInjectCommentsByInjectId = (injectId: InjectResultDTO['inject_id']) => (injectsComments ?? []).find((c) => c.inject_id === injectId) ?? null;

  const openEditCommentDialog = (injectId: InjectResultDTO['inject_id']) => {
    setInjectCommentEdited(findInjectCommentsByInjectId(injectId) ?? {
      inject_id: injectId,
      report_inject_comment: '',
    });
    setOpenEditInjectComment(true);
  };

  const handleCommentChange = (value: string) => {
    setInjectCommentEdited({
      ...injectCommentEdited,
      report_inject_comment: value,
    });
  };

  const saveComment = () => {
    if (!injectCommentEdited?.inject_id) return;
    const existingInjectComment = findInjectCommentsByInjectId(injectCommentEdited.inject_id);
    onCommentSubmit(injectCommentEdited);
    if (!existingInjectComment) {
      setInjectsComments((prevComments) => [...prevComments, injectCommentEdited]);
    } else {
      setInjectsComments((prevComments) => {
        return prevComments.map((comment) => (comment.inject_id === injectCommentEdited.inject_id
          ? { ...comment, report_inject_comment: injectCommentEdited.report_inject_comment }
          : comment));
      });
    }
    setOpenEditInjectComment(false);
  };

  const columns = [
    {
      label: 'Type',
      render: (inject: InjectResultDTO) => {
        return inject.inject_injector_contract
          ? <InjectorContract variant="list" label={tPick(inject.inject_injector_contract?.injector_contract_labels)} />
          : <InjectorContract variant="list" label={t('Deleted')} deleted={true} />;
      },
    },
    {
      label: 'Title',
      render: (inject: InjectResultDTO) => inject.inject_title,
    },
    {
      label: 'Execution date',
      render: (inject: InjectResultDTO) => <>{fldt(inject.inject_status?.tracking_sent_date)}</>,
    },
    {
      label: 'Scores',
      render: (inject: InjectResultDTO) => <AtomicTestingResult expectations={inject.inject_expectation_results} injectId={inject.inject_id} />,
    },
    {
      label: 'Targets',
      render: (inject: InjectResultDTO) => <ItemTargets targets={inject.inject_targets} />,
    },
    {
      label: 'Comments',
      render: (inject: InjectResultDTO) => {
        const currentInjectComment = findInjectCommentsByInjectId(inject.inject_id);
        return <ExpandableMarkdown showAll source={currentInjectComment?.report_inject_comment || ''} markdownDOMId={`markdown_${inject.inject_id}`}/>;
      },
    },
  ];

  return (
    <div style={style}>
      <Typography variant="h4" gutterBottom>
        {t('Injects results')}
      </Typography>

      <Paper variant="outlined">
        <TableContainer style={{ maxHeight: 'none', overflow: 'visible' }}>
          <Table aria-label="injects results">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    sx={col.label === 'Comments' ? { padding: '0px', width: '35%', flexGrow: 1 } : {}}
                    key={col.label}
                  > {t(col.label)} </TableCell>))}
              </TableRow>
            </TableHead>
            <TableBody>
              {injects.map((inject) => (
                <TableRow
                  key={inject.inject_id}
                >
                  {columns.map((col) => (
                    <TableCell
                      sx={col.label === 'Comments' ? { padding: '8px 0 8px 0', width: '35%', flexGrow: 1, alignItems: 'flex-start' } : { verticalAlign: 'top' }}
                      key={`${inject.inject_id}-${col.label}`}
                    >
                      {col.render(inject)}
                    </TableCell>))
                  }
                  { canEditComment
                    ? <TableCell key={`${inject.inject_id}-edit}`}
                        sx={{ padding: '0px', width: '45px', verticalAlign: 'top' }} align="right"
                      >
                      <IconButton color="primary" onClick={() => openEditCommentDialog(inject.inject_id)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell> : <TableCell sx={{ padding: '0px', width: '45px' }}></TableCell>
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        title={t('Update inject comment')}
        open={openEditInjectComment}
        handleClose={() => setOpenEditInjectComment(false)}
      >
        <>
          <Paper variant="outlined">
            <MarkDownField
              onChange={handleCommentChange}
              initialValue={injectCommentEdited?.report_inject_comment || ''}
            />
          </Paper>
          <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex' }}>
            <Button
              style={{ marginLeft: 'auto' }}
              onClick={() => setOpenEditInjectComment(false)}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              type="submit"
              onClick={() => saveComment()}
            >
              {t('Update')}
            </Button>
          </div>
        </>
      </Dialog>
    </div>
  );
};

export default InjectReportResult;
