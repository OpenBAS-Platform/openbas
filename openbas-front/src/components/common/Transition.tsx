import { Slide } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { JSXElementConstructor } from 'react';
import * as React from 'react';

const Transition = React.forwardRef(
  (
    {
      children,
      ...props
    }: TransitionProps & {
      children: React.ReactElement<
        unknown,
      string | JSXElementConstructor<unknown>
      >;
    },
    ref: React.Ref<unknown>,
  ) => {
    return (
      <Slide direction="up" ref={ref} {...props}>
        {children}
      </Slide>
    );
  },
);
Transition.displayName = 'TransitionSlide';

export default Transition;
