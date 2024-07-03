import React, { FunctionComponent, useState } from 'react';
import { AutoAwesomeOutlined } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputAdornment, InputLabel, Menu, MenuItem, Select, TextField } from '@mui/material';
import EETooltip from '../entreprise_edition/EETooltip';
import { useFormatter } from '../../../../components/i18n';
// eslint-disable-next-line import/no-cycle
import ResponseDialog from '../../../../utils/ai/ResponseDialog';
// eslint-disable-next-line import/no-cycle
import SimpleRichTextField from '../../../../components/fields/SimpleRichTextField';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';
import useAI from '../../../../utils/hooks/useAI';
import { aiChangeTone, aiExplain, aiFixSpelling, aiGenMedia, aiGenMessage, aiGenSubject, aiMakeLonger, aiMakeShorter, aiSummarize } from '../../../../actions/AskAI';

// region types
interface TextFieldAskAiProps {
  currentValue: string;
  setFieldValue: (value: string) => void;
  format: 'text' | 'html' | 'markdown';
  variant: 'markdown' | 'html' | 'ckeditor' | 'text' | null;
  disabled?: boolean;
  style?: object;
  inInject?: boolean;
  context?: string;
  inArticle?: boolean;
}

const TextFieldAskAI: FunctionComponent<TextFieldAskAiProps> = ({
  currentValue,
  setFieldValue,
  variant,
  format = 'text',
  disabled,
  style,
  inInject,
  context,
  inArticle,
}) => {
  const { t } = useFormatter();
  const isEnterpriseEdition = useEnterpriseEdition();
  const { enabled, configured } = useAI();
  const [content, setContent] = useState('');
  const [disableResponse, setDisableResponse] = useState(false);
  const [openToneOptions, setOpenToneOptions] = useState(false);
  const [openGenMessageOptions, setOpenGenMessageOptions] = useState(false);
  const [openGenMediaOptions, setOpenGenMediaOptions] = useState(false);
  const [messageContext, setMessageContext] = useState<string>(context ?? '');
  const [messageInput, setMessageInput] = useState<string>(currentValue);
  const [messageParagraphs, setMessageParagraphs] = useState<number>(5);
  const [messageTone, setMessageTone] = useState<'informal' | 'formal' | 'assertive' | 'sarcastic' | 'authoritative' | 'bitter' | 'critical' | 'arrogant' | 'aggressive'>('formal');
  const [messageSender, setMessageSender] = useState<string>('');
  const [messageRecipient, setMessageRecipient] = useState<string>('');
  const [isAcceptable, setIsAcceptable] = useState(true);
  const [menuOpen, setMenuOpen] = useState<{ open: boolean; anchorEl: HTMLButtonElement | null; }>({ open: false, anchorEl: null });
  const [displayAskAI, setDisplayAskAI] = useState(false);
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (isEnterpriseEdition) {
      event.preventDefault();
      setMenuOpen({ open: true, anchorEl: event.currentTarget });
    }
  };
  const handleCloseMenu = () => {
    setMenuOpen({ open: false, anchorEl: null });
  };
  const handleOpenToneOptions = () => {
    handleCloseMenu();
    setOpenToneOptions(true);
  };
  const handleCloseToneOptions = () => setOpenToneOptions(false);
  const handleOpenGenMessageOptions = () => {
    handleCloseMenu();
    setOpenGenMessageOptions(true);
    setMessageInput(currentValue);
  };
  const handleOpenGenMediaOptions = () => {
    handleCloseMenu();
    setOpenGenMediaOptions(true);
    setMessageInput(currentValue);
  };
  const handleCloseGenMessageOptions = () => setOpenGenMessageOptions(false);
  const handleCloseGenMediaOptions = () => setOpenGenMediaOptions(false);
  const handleOpenAskAI = () => setDisplayAskAI(true);
  const handleCloseAskAI = () => setDisplayAskAI(false);
  const askFixSpelling = async () => aiFixSpelling(currentValue, format, (data: string) => setContent(data));
  const askMakeShorter = async () => aiMakeShorter(currentValue, format, (data: string) => setContent(data));
  const askMakeLonger = async () => aiMakeLonger(currentValue, format, (data: string) => setContent(data));
  const askChangeTone = async () => aiChangeTone(currentValue, messageTone, format, (data: string) => setContent(data));
  const askSummarize = async () => aiSummarize(currentValue, format, (data: string) => setContent(data));
  const askExplain = async () => aiExplain(currentValue, (data: string) => setContent(data));
  const askGenMessage = async () => aiGenMessage(
    messageContext,
    messageInput,
    messageParagraphs,
    messageTone,
    messageSender,
    messageRecipient,
    format,
    (data: string) => setContent(data),
  );
  const askGenSubject = async () => aiGenSubject(
    messageContext,
    messageInput,
    messageParagraphs,
    messageTone,
    messageSender,
    messageRecipient,
    format,
    (data: string) => setContent(data),
  );
  const askGenMedia = async () => aiGenMedia(
    messageContext,
    messageInput,
    messageParagraphs,
    messageTone,
    '',
    format,
    (data: string) => setContent(data),
  );

  const handleAskAi = async (action: string, canBeAccepted = true) => {
    setDisableResponse(true);
    handleCloseMenu();
    setIsAcceptable(canBeAccepted);
    handleOpenAskAI();
    switch (action) {
      case 'spelling':
        await askFixSpelling();
        setDisableResponse(false);
        break;
      case 'shorter':
        await askMakeShorter();
        setDisableResponse(false);
        break;
      case 'longer':
        await askMakeLonger();
        setDisableResponse(false);
        break;
      case 'tone':
        await askChangeTone();
        setDisableResponse(false);
        break;
      case 'summarize':
        await askSummarize();
        setDisableResponse(false);
        break;
      case 'explain':
        await askExplain();
        setDisableResponse(false);
        break;
      case 'genMessage':
        await askGenMessage();
        setDisableResponse(false);
        break;
      case 'genSubject':
        await askGenSubject();
        setDisableResponse(false);
        break;
      case 'genMedia':
        await askGenMedia();
        setDisableResponse(false);
        break;
      default:
        // do nothing
        setDisableResponse(false);
    }
  };
  const renderButton = () => {
    return (
      <>
        <EETooltip forAi={true} title={t('Ask AI')}>
          <span>
            <IconButton
              size="medium"
              color="secondary"
              onClick={(event) => ((isEnterpriseEdition && enabled && configured) ? handleOpenMenu(event) : null)}
              disabled={disabled}
              style={{ marginRight: -10 }}
            >
              <AutoAwesomeOutlined fontSize='medium'/>
            </IconButton>
          </span>
        </EETooltip>
        <Menu
          id="menu-appbar"
          anchorEl={menuOpen.anchorEl}
          open={menuOpen.open}
          onClose={handleCloseMenu}
        >
          {inInject && (
            <MenuItem onClick={handleOpenGenMessageOptions}>
              {t('Generate a message')}
            </MenuItem>
          )}
          {inArticle && (
            <MenuItem onClick={handleOpenGenMediaOptions}>
              {t('Generate an article')}
            </MenuItem>
          )}
          <MenuItem onClick={() => handleAskAi('spelling')} disabled={messageInput.length === 0}>
            {t('Fix spelling & grammar')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('shorter')} disabled={messageInput.length === 0}>
            {t('Make it shorter')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('longer')} disabled={messageInput.length === 0}>
            {t('Make it longer')}
          </MenuItem>
          <MenuItem onClick={handleOpenToneOptions} disabled={messageInput.length === 0}>
            {t('Change tone')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('summarize')} disabled={messageInput.length === 0}>
            {t('Summarize')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('explain', false)} disabled={messageInput.length === 0}>
            {t('Explain')}
          </MenuItem>
        </Menu>
        <ResponseDialog
          isDisabled={disableResponse}
          isOpen={displayAskAI}
          handleClose={handleCloseAskAI}
          content={content}
          setContent={setContent}
          handleAccept={(value) => {
            setFieldValue(value);
            handleCloseAskAI();
          }}
          handleFollowUp={handleCloseAskAI}
          followUpActions={[{ key: 'retry', label: t('Retry') }]}
          format={format}
          isAcceptable={isAcceptable}
        />
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={openGenMessageOptions}
          onClose={handleCloseGenMessageOptions}
          fullWidth={true}
          maxWidth="xs"
        >
          <DialogTitle>{t('Select options')}</DialogTitle>
          <DialogContent>
            <SimpleRichTextField
              label={t('Input (describe what you want)')}
              value={messageInput}
              onChange={(value: string) => setMessageInput(value)}
              style={{ height: 200 }}
            />
            <FormControl style={{ width: '100%', marginTop: 20 }}>
              <InputLabel id="messageTone">{t('Tone')}</InputLabel>
              <Select
                labelId="messageTone"
                value={messageTone}
                onChange={(event) => setMessageTone(event.target.value as unknown as 'informal' | 'formal' | 'assertive' | 'sarcastic' | 'authoritative' | 'bitter' | 'critical' | 'arrogant' | 'aggressive')}
                fullWidth={true}
              >
                <MenuItem value="formal">{t('Formal')}</MenuItem>
                <MenuItem value="informal">{t('Informal')}</MenuItem>
                <MenuItem value="authoritative">{t('Authoritative')}</MenuItem>
                <MenuItem value="assertive">{t('Assertive')}</MenuItem>
                <MenuItem value="bitter">{t('Bitter')}</MenuItem>
                <MenuItem value="critical">{t('Critical')}</MenuItem>
                <MenuItem value="arrogant">{t('Arrogant')}</MenuItem>
                <MenuItem value="aggressive">{t('Aggressive')}</MenuItem>
                <MenuItem value="sarcastic">{t('Sarcastic')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('Who is sending?')}
              fullWidth={true}
              value={messageSender}
              onChange={(event) => setMessageSender(event.target.value)}
              style={{ marginTop: 20 }}
            />
            <TextField
              label={t('Who is receiving?')}
              fullWidth={true}
              value={messageRecipient}
              onChange={(event) => setMessageRecipient(event.target.value)}
              style={{ marginTop: 20 }}
            />
            <TextField
              label={t('Number of paragraphs')}
              fullWidth={true}
              type="number"
              value={messageParagraphs}
              onChange={(event) => setMessageParagraphs(Number.isNaN(parseInt(event.target.value, 10)) ? 1 : parseInt(event.target.value, 10))}
              style={{ marginTop: 20 }}
            />
            <TextField
              style={{ marginTop: 20 }}
              label={t('Context')}
              fullWidth={true}
              multiline={true}
              value={messageContext}
              rows={5}
              onChange={(event) => setMessageContext(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGenMessageOptions}>
              {t('Cancel')}
            </Button>
            <Button
              disabled={messageInput.length === 0} // Disable button if messageInput is empty
              onClick={() => {
                handleCloseGenMessageOptions();
                handleAskAi('genMessage');
              }}
              color="secondary"
            >
              {t('Generate')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={openGenMediaOptions}
          onClose={handleCloseGenMediaOptions}
          fullWidth={true}
          maxWidth="xs"
        >
          <DialogTitle>{t('Select options')}</DialogTitle>
          <DialogContent>
            <SimpleRichTextField
              label={t('Input (describe what you want)')}
              value={messageInput}
              onChange={(value: string) => setMessageInput(value)}
              style={{ height: 200 }}
            />
            <FormControl style={{ width: '100%', marginTop: 20 }}>
              <InputLabel id="messageTone">{t('Tone')}</InputLabel>
              <Select
                labelId="messageTone"
                value={messageTone}
                onChange={(event) => setMessageTone(event.target.value as unknown as 'informal' | 'formal' | 'assertive' | 'sarcastic' | 'authoritative' | 'bitter' | 'critical' | 'arrogant' | 'aggressive')}
                fullWidth={true}
              >
                <MenuItem value="formal">{t('Formal')}</MenuItem>
                <MenuItem value="informal">{t('Informal')}</MenuItem>
                <MenuItem value="authoritative">{t('Authoritative')}</MenuItem>
                <MenuItem value="assertive">{t('Assertive')}</MenuItem>
                <MenuItem value="bitter">{t('Bitter')}</MenuItem>
                <MenuItem value="critical">{t('Critical')}</MenuItem>
                <MenuItem value="arrogant">{t('Arrogant')}</MenuItem>
                <MenuItem value="aggressive">{t('Aggressive')}</MenuItem>
                <MenuItem value="sarcastic">{t('Sarcastic')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('Author')}
              fullWidth={true}
              value={messageSender}
              onChange={(event) => setMessageSender(event.target.value)}
              style={{ marginTop: 20 }}
            />
            <TextField
              label={t('Number of paragraphs')}
              fullWidth={true}
              type="number"
              value={messageParagraphs}
              onChange={(event) => setMessageParagraphs(Number.isNaN(parseInt(event.target.value, 10)) ? 1 : parseInt(event.target.value, 10))}
              style={{ marginTop: 20 }}
            />
            <TextField
              style={{ marginTop: 20 }}
              label={t('Context')}
              fullWidth={true}
              multiline={true}
              value={messageContext}
              rows={5}
              onChange={(event) => setMessageContext(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGenMediaOptions}>
              {t('Cancel')}
            </Button>
            <Button
              disabled={messageInput.length === 0}
              onClick={() => {
                handleCloseGenMediaOptions();
                handleAskAi('genMedia');
              }}
              color="secondary"
            >
              {t('Generate')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={openToneOptions}
          onClose={handleCloseToneOptions}
          fullWidth={true}
          maxWidth="xs"
        >
          <DialogTitle>{t('Select options')}</DialogTitle>
          <DialogContent>
            <FormControl style={{ width: '100%' }}>
              <InputLabel id="tone">{t('Tone')}</InputLabel>
              <Select
                labelId="tone"
                value={messageTone}
                onChange={(event) => setMessageTone(event.target.value as unknown as 'informal' | 'formal' | 'assertive' | 'sarcastic' | 'authoritative' | 'bitter' | 'critical' | 'arrogant' | 'aggressive')}
                fullWidth={true}
              >
                <MenuItem value="informal">{t('Informal')}</MenuItem>
                <MenuItem value="formal">{t('Formal')}</MenuItem>
                <MenuItem value="assertive">{t('Assertive')}</MenuItem>
                <MenuItem value="sarcastic">{t('Sarcastic')}</MenuItem>
                <MenuItem value="authoritative">{t('Authoritative')}</MenuItem>
                <MenuItem value="bitter">{t('Bitter')}</MenuItem>
                <MenuItem value="critical">{t('Critical')}</MenuItem>
                <MenuItem value="arrogant">{t('Arrogant')}</MenuItem>
                <MenuItem value="aggressive">{t('Aggressive')}</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseToneOptions}>
              {t('Cancel')}
            </Button>
            <Button
              disabled={messageInput.length === 0}
              onClick={() => {
                handleCloseToneOptions();
                handleAskAi('tone');
              }}
              color="secondary"
            >
              {t('Generate')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  if (variant === 'markdown') {
    return (
      <div style={style || { position: 'absolute', top: 15, right: 0 }}>
        {renderButton()}
      </div>
    );
  }
  if (variant === 'html') {
    return (
      <div style={style || { position: 'absolute', top: 15, right: 20 }}>
        {renderButton()}
      </div>
    );
  }
  if (variant === 'ckeditor') {
    return (
      <div style={style || { position: 'absolute', top: 64, right: 20 }}>
        {renderButton()}
      </div>
    );
  }
  return (
    <InputAdornment position="end" style={{ position: 'absolute', top: 5, right: 0 }}>
      {renderButton()}
    </InputAdornment>
  );
};

export default TextFieldAskAI;
