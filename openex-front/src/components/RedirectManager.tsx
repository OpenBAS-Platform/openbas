import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MESSAGING$ } from '../utils/Environment';

interface Props {
  children: React.ReactElement;
}

const RedirectManager: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const subscription = MESSAGING$.redirect.subscribe({
      next: (url) => navigate(url),
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
};

export default RedirectManager;
