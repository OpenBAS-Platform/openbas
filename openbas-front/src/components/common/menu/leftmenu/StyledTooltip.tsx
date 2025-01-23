import { Tooltip, tooltipClasses } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

const StyledTooltip = styled(({ className, ...props }: { className?: string } & React.ComponentProps<typeof Tooltip>) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => {
  const theme = useTheme();

  return {
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.common.black,
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.black,
    },
  };
});

export default StyledTooltip;
