import { NotificationsOutlined } from '@mui/icons-material';
import { ToggleButton, Tooltip } from '@mui/material';
import { type FunctionComponent, useEffect, useState } from 'react';

import { createEmailNotification, deleteNotification, findNotificationsByFilter } from '../../../../actions/notifications/notification-action';
import DialogDelete from '../../../../components/common/DialogDelete';
import DialogFiligran from '../../../../components/common/DialogFiligran';
import { useFormatter } from '../../../../components/i18n';
import { type Notification } from '../../../../utils/api-types';

interface Props {
  entityId: string;
  name: string;
}

const NotificationComponent: FunctionComponent<Props> = ({ entityId, name }) => {
  // Standard hooks
  const { t } = useFormatter();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    findNotificationsByFilter(entityId).then((res) => {
      setNotification(res.data[0]);
      setLoading(false);
    });
  }, []);

  // Drawer
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const submit = () => {
    createEmailNotification(entityId, name).then(res => setNotification(res.data));
    handleClose();
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleOpenDelete = () => setDeletion(true);
  const handleCloseDelete = () => setDeletion(false);
  const submitDelete = () => {
    if (notification) {
      deleteNotification(notification.notification_id);
      setNotification(null);
      handleCloseDelete();
    }
  };

  if (loading)
    return (<></>);

  return (
    <>
      <ToggleButton
        value="notify"
        aria-label="notify"
        size="small"
        onClick={(_event) => {
          if (notification) {
            handleOpenDelete();
          } else {
            handleOpen();
          }
        }}
      >
        <Tooltip
          title={t('Subscribe to update')}
          aria-label="Subscribe to update"
        >
          <NotificationsOutlined
            color={notification ? 'secondary' : 'primary'}
            fontSize="small"
          />
        </Tooltip>
      </ToggleButton>
      {/*<Drawer*/}
      {/*  open={open}*/}
      {/*  handleClose={handleClose}*/}
      {/*  title={t('Update subscription')}*/}
      {/*>*/}
      {/*  <form id="lessonTemplateForm">*/}
      {/*    <TextField*/}
      {/*      variant="standard"*/}
      {/*      fullWidth*/}
      {/*      label={t('Name')}*/}
      {/*      style={{ marginTop: 10 }}*/}
      {/*      disabled*/}
      {/*      value={notification?.notification_name}*/}
      {/*    />*/}
      {/*    <div style={{*/}
      {/*      float: 'right',*/}
      {/*      marginTop: 20,*/}
      {/*    }}*/}
      {/*    >*/}
      {/*      <Button*/}
      {/*        variant="contained"*/}
      {/*        color="error"*/}
      {/*        onClick={handleOpenDelete}*/}
      {/*        style={{ marginRight: 10 }}*/}
      {/*      >*/}
      {/*        {t('Delete')}*/}
      {/*      </Button>*/}
      {/*      <Button*/}
      {/*        variant="contained"*/}
      {/*        color="secondary"*/}
      {/*        type="submit"*/}
      {/*        disabled*/}
      {/*      >*/}
      {/*        {t('Update')}*/}
      {/*      </Button>*/}
      {/*    </div>*/}
      {/*  </form>*/}
      {/*</Drawer>*/}
      <DialogFiligran
        open={open}
        handleClose={handleClose}
        handleSubmit={submit}
        text={`${t('Do you want to create a notification for:')} ${name} ?`}
        actionButtonLabel={t('Create')}
      />
      <DialogDelete
        open={deletion}
        handleClose={handleCloseDelete}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete this notification:')} ${notification?.notification_name} ?`}
      />
    </>
  );
};

export default NotificationComponent;
