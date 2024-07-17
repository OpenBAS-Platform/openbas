import React, { useState } from 'react';
import ButtonCreate from '../../../../../components/common/ButtonCreate';

const XlsFormatterCreation = () => {
  const [_open, setOpen] = useState(false);

  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
    </>
  );
};

export default XlsFormatterCreation;
