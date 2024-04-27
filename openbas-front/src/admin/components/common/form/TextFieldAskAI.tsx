import React, { FunctionComponent, useState } from 'react';
import { AutoAwesomeOutlined } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputAdornment, InputLabel, Menu, MenuItem, Select } from '@mui/material';
import EETooltip from '../entreprise_edition/EETooltip';
import { useFormatter } from '../../../../components/i18n';
// eslint-disable-next-line import/no-cycle
import ResponseDialog from '../../../../utils/ai/ResponseDialog';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';
import useAI from '../../../../utils/hooks/useAI';
import { aiChangeTone, aiExplain, aiFixSpelling, aiMakeLonger, aiMakeShorter, aiSummarize } from '../../../../actions/AskAI';

// region types
interface TextFieldAskAiProps {
  currentValue: string;
  setFieldValue: (value: string) => void;
  format: 'text' | 'html' | 'markdown';
  variant: 'markdown' | 'html' | 'text' | null;
  disabled?: boolean;
  style?: object;
}

const TextFieldAskAI: FunctionComponent<TextFieldAskAiProps> = ({
  currentValue,
  setFieldValue,
  variant,
  format = 'text',
  disabled,
  style,
}) => {
  const { t } = useFormatter();
  const isEnterpriseEdition = useEnterpriseEdition();
  const { enabled, configured } = useAI();
  const [content, setContent] = useState('');
  const [disableResponse, setDisableResponse] = useState(false);
  const [openToneOptions, setOpenToneOptions] = useState(false);
  const [tone, setTone] = useState<'tactical' | 'operational' | 'strategic'>('tactical');
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
  const handleOpenAskAI = () => setDisplayAskAI(true);
  const handleCloseAskAI = () => setDisplayAskAI(false);
  const askFixSpelling = async () => aiFixSpelling(currentValue, format, (data: string) => setContent(data));
  const askMakeShorter = async () => aiMakeShorter(currentValue, format, (data: string) => setContent(data));
  const askMakeLonger = async () => aiMakeLonger(currentValue, format, (data: string) => setContent(data));
  const askChangeTone = async () => aiChangeTone(currentValue, tone, format, (data: string) => setContent(data));
  const askSummarize = async () => aiSummarize(currentValue, format, (data: string) => setContent(data));
  const askExplain = async () => aiExplain(currentValue, (data: string) => setContent(data));

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
      default:
        // do nothing
    }
  };
  const renderButton = () => {
    return (
      <>
        <EETooltip forAi={true} title={t('Ask AI')}>
          <IconButton
            size="medium"
            color="secondary"
            onClick={(event) => ((isEnterpriseEdition && enabled && configured) ? handleOpenMenu(event) : null)}
            disabled={disabled || currentValue.length < 10}
            style={{ marginRight: -10 }}
          >
            <AutoAwesomeOutlined fontSize='medium'/>
          </IconButton>
        </EETooltip>
        <Menu
          id="menu-appbar"
          anchorEl={menuOpen.anchorEl}
          open={menuOpen.open}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleAskAi('spelling')}>
            {t('Fix spelling & grammar')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('shorter')}>
            {t('Make it shorter')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('longer')}>
            {t('Make it longer')}
          </MenuItem>
          <MenuItem onClick={handleOpenToneOptions}>
            {t('Change tone')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('summarize')}>
            {t('Summarize')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('explain', false)}>
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
                value={tone}
                onChange={(event) => setTone(event.target.value as unknown as 'tactical' | 'operational' | 'strategic')}
                fullWidth={true}
              >
                <MenuItem value="tactical">{t('Tactical')}</MenuItem>
                <MenuItem value="operational">{t('Operational')}</MenuItem>
                <MenuItem value="strategic">{t('Strategic')}</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseToneOptions}>
              {t('Cancel')}
            </Button>
            <Button
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
      <div style={style || { position: 'absolute', top: -12, right: 35 }}>
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
