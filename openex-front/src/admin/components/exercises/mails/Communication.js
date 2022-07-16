import React, { useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { lightBlue } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import { ExpandLess, ExpandMore, ReplyOutlined } from '@mui/icons-material';
import parse from 'html-react-parser';
import { useFormatter } from '../../../../components/i18n';
import { resolveUserNames, truncate } from '../../../../utils/String';
import TruncatedText from '../../../../components/TruncatedText';

const useStyles = makeStyles(() => ({
  container: {
    margin: '0 0 50px 0',
    padding: '0 200px 0 0',
  },
  paper: {
    position: 'relative',
    padding: '20px 20px 0 20px',
    overflow: 'hidden',
    height: '100%',
  },
  card: {
    margin: '0 0 20px 0',
  },
  cardNested: {
    margin: '0 0 20px 20px',
  },
}));

const Communication = (props) => {
  const { communication, communicationUsers, isTopic, handleOpenReply } = props;
  // Standard hooks
  const [expand, setExpand] = useState(false);
  const expandContent = () => setExpand(!expand);
  const theme = useTheme();
  const classes = useStyles();
  const { t, nsdt } = useFormatter();
  const limit = 200;
  let isHtml = false;
  let content = '';
  if (
    communication.communication_content
    && communication.communication_content.length > 10
  ) {
    content = communication.communication_content;
  } else {
    isHtml = true;
    content = communication.communication_content_html;
  }
  return (
    <Card
      classes={{ root: isTopic ? classes.card : classes.cardNested }}
      raised={false}
      variant="outlined"
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: lightBlue[500] }}>
            {Array.from(communication.communication_from)[0].toUpperCase()}
          </Avatar>
        }
        action={
          <div style={{ display: 'flex' }}>
            {isTopic && (
              <IconButton
                onClick={() => handleOpenReply(communication.communication_id)}
                size="small"
              >
                <ReplyOutlined />
              </IconButton>
            )}
            <IconButton onClick={expandContent} size="small">
              {expand ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </div>
        }
        title={
          <TruncatedText
            content={communication.communication_subject}
            limit={50}
          />
        }
        subheader={
          communication.communication_animation ? (
            <span>
              <span
                style={{
                  color: theme.palette.text.secondary,
                }}
              >
                {t('To')}
              </span>
              &nbsp;
              <span
                style={{
                  color: theme.palette.secondary.main,
                }}
              >
                <TruncatedText
                  content={resolveUserNames(communicationUsers, true)}
                  limit={60}
                />
              </span>
              ,&nbsp;
              <span
                style={{
                  color: theme.palette.text.secondary,
                }}
              >
                {t('on')} {nsdt(communication.communication_sent_at)}
              </span>
            </span>
          ) : (
            <span>
              {' '}
              <span
                style={{
                  color: theme.palette.text.secondary,
                }}
              >
                {t('From')}
              </span>
              &nbsp;
              <span
                style={{
                  color: theme.palette.secondary.main,
                }}
              >
                <TruncatedText
                  content={communication.communication_from}
                  limit={60}
                />
              </span>
              ,&nbsp;
              <span
                style={{
                  color: theme.palette.text.secondary,
                }}
              >
                {nsdt(communication.communication_sent_at)}
              </span>
            </span>
          )
        }
      />
      <CardContent>
        {isHtml ? (
          <div style={{ marginTop: -5 }}>
            {expand ? parse(content) : parse(truncate(content, limit))}
          </div>
        ) : (
          <div style={{ marginTop: -5, whiteSpace: 'pre-line' }}>
            {expand ? content : truncate(content, limit)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Communication;
