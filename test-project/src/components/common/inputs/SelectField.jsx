import React from 'react';
import { Select } from '@chakra-ui/react';

const SelectField = ({ options, ...props }) => {
  return (
    <Select placeholder="Select option" {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

export default SelectField; 