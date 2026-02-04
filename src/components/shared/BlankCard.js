import { Card } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

const BlankCard = ({ children, className }) => {
  return (
    <Card
      sx={{ 
        p: 0, 
        position: 'relative',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
        },
      }}
      className={className}
      elevation={0}
      variant={undefined}
    >
      {children}
    </Card>
  );
};

BlankCard.propTypes = {
  children: PropTypes.node,
};

export default BlankCard;
