import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { useComponentLibrary } from './ComponentLibraryProvider';

const LibrarySwitcher = () => {
  const { currentLibrary, setCurrentLibrary } = useComponentLibrary();

  const handleChange = (event) => {
    setCurrentLibrary(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120, maxWidth: 200, mb: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="component-library-select-label">UI Library</InputLabel>
        <Select
          labelId="component-library-select-label"
          id="component-library-select"
          value={currentLibrary}
          label="UI Library"
          onChange={handleChange}
        >
          <MenuItem value="mui">Material UI</MenuItem>
          <MenuItem value="chakra">Chakra UI</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LibrarySwitcher; 