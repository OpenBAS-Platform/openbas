import React, { FunctionComponent } from 'react';
import { useLocation } from 'react-router-dom';
import Message from '../../../components/Message';
import { MESSAGING$ } from '../../../utils/Environment';

const LoginError: FunctionComponent = () => {
  const { search } = useLocation();
  const error = search.substring(search.indexOf('error=') + 'error='.length);
  if (error) {
    MESSAGING$.notifyError(decodeURIComponent(error));
  }

  return <Message sticky={false} />;
};

export default LoginError;
