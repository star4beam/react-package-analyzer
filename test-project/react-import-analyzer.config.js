module.exports = {
    packagesToTrack: [
        '@mui/material',
        '@chakra-ui/react',

    ],
    format: 'json,markdown',

    repoUrl: 'https://github.com/star4beam/react-import-analyzer/blob/main/test-project',


    include: 'src/**/*.{js,jsx,ts,tsx}',
    
    outputDir: '../test-project-import-analysis'
}
