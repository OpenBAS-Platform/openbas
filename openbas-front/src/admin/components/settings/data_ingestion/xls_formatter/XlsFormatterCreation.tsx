import React, { useState } from 'react';
import ButtonCreate from '../../../../../components/common/ButtonCreate';

const XlsFormatterCreation = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
    </>
  );
};

export default XlsFormatterCreation;
