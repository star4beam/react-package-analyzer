import React from 'react';
import { Flex, Icon, Text } from '@chakra-ui/react'; 
import ChakraCard from '../ui/ChakraCard';
import ChakraButton from '../ui/ChakraButton';

const InfoPanel = ({ title, info, icon, actionText, onAction }) => {
  return (
    <ChakraCard title={title}>
      <Flex alignItems="center" mb={3}>
        {icon && <Icon as={icon} mr={2} boxSize="20px" />}
        <Text>{info}</Text>
      </Flex>
      {actionText && (
        <Flex justifyContent="flex-end">
          <ChakraButton onClick={onAction} size="sm">
            {actionText}
          </ChakraButton>
        </Flex>
      )}
    </ChakraCard>
  );
};

export default InfoPanel; 