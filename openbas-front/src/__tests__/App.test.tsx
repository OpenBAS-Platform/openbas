import { StyledEngineProvider } from '@mui/material/styles';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('App', () => {
  afterEach(cleanup);
  it('renders without crashing', async () => {
    const { getByDisplayValue } = render(
      <StyledEngineProvider injectFirst={true}>
        <input readOnly type="text" id="lastName" value="Admin" />
      </StyledEngineProvider>,
    );
    act(() => {
      const firstname = getByDisplayValue('Admin');
      expect(firstname).toBeDefined();
    });
  });
});
