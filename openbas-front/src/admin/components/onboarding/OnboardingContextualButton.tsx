import { HelpOutline } from '@mui/icons-material';
import { Button, type SxProps, type Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';

import Dialog from '../../../components/common/dialog/Dialog';
import useDialog from '../../../components/common/dialog/useDialog';
import OnboardingVideoPlayer from './OnboardingVideoPlayer';

const estimateLabelWidth = (label: string) => {
  const charWidth = 8;
  const padding = 26;
  return label.length * charWidth + padding;
};

const floatingButtonStyle = (reduced: boolean, labelWidth: number | null): SxProps<Theme> => theme => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  zIndex: 1,
  transition: 'all 0.5s ease-in-out',
  minWidth: reduced ? 36 : (labelWidth ?? 0) + 36,
  width: reduced ? 36 : (labelWidth ?? 0) + 36,
});

const labelStyle = (reduced: boolean, theme: Theme): React.CSSProperties => ({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  transition: 'max-width 0.5s ease, opacity 0.5s ease, margin 0.5s ease',
  marginRight: reduced ? 0 : theme.spacing(1),
  display: 'inline-block',
});

interface VideoPlayerButtonProps {
  label: string;
  videoLink: string;
}

const OnboardingContextualButton = ({ label, videoLink }: VideoPlayerButtonProps) => {
  const theme = useTheme();

  const { handleOpen, dialogProps } = useDialog<void>();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const estimatedWidth = useMemo(() => estimateLabelWidth(label), [label]);

  const reduced = useMemo(() => {
    return scrolled && !hovered;
  }, [scrolled, hovered]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => handleOpen()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={floatingButtonStyle(reduced, estimatedWidth)}
      >
        <span style={labelStyle(reduced, theme)}>{label}</span>
        <HelpOutline />
      </Button>
      <Dialog {...dialogProps} title={label} showCloseIcon>
        <OnboardingVideoPlayer videoLink={videoLink} />
      </Dialog>
    </>
  );
};

export default OnboardingContextualButton;
