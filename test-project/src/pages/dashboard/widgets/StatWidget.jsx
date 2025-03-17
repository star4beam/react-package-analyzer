import React from 'react';
import { Box, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import Card from '../../../components/layouts/containers/Card';

const StatWidget = ({ title, value, icon, ...props }) => {
  return (
    <Card {...props}>
      <Stat>
        <StatLabel>{title}</StatLabel>
        <StatNumber>{value}</StatNumber>
        <StatHelpText>Feb 12 - Feb 28</StatHelpText>
      </Stat>
    </Card>
  );
};

export default StatWidget; 