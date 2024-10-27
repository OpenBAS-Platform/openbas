import { useState } from 'react';
import * as React from 'react';
import { Button, IconButton, Paper } from '@mui/material';
import { Edit } from '@mui/icons-material';
import MarkDownField from '../../../../components/fields/MarkDownField';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import Dialog from '../../../../components/common/Dialog';
import { useFormatter } from '../../../../components/i18n';

interface Props {
  initialComment: string,
  saveComment: (newComment:string) => void
  canEditComment?:boolean,
}

const ReportComment: React.FC<Props> = ({ initialComment, saveComment, canEditComment = false }) => {
  const { t } = useFormatter();
  const [comment, setComment] = useState<string>(initialComment);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <ExpandableMarkdown showAll source={comment}/>
      { canEditComment
          && <IconButton sx={{ marginLeft: 'auto' }} color="primary" onClick={() => setOpenEdit(true)}>
            <Edit />
          </IconButton>
      }

      <Dialog
        title={t('Update inject comment')}
        open={openEdit}
        handleClose={() => setOpenEdit(false)}
      >
        <>
          <Paper variant="outlined">
            <MarkDownField
              onChange={(value) => setComment(value)}
              initialValue={comment}
            />
          </Paper>
          <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex' }}>
            <Button
              style={{ marginLeft: 'auto' }}
              onClick={() => setOpenEdit(false)}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              type="submit"
              onClick={() => {
                saveComment(comment);
                setOpenEdit(false);
              }}
            >
              {t('Update')}
            </Button>
          </div>
        </>
      </Dialog>
    </div>

  );
};

export default ReportComment;
