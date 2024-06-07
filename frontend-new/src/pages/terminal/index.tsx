import { Box, Flex } from '@chakra-ui/react'
//import { useTranslation } from 'react-i18next'

import HeaderInformation from './headerInformation'
import SymbolSelection from './symbolSelection'
import Trading from './trading'

const Terminal = () => {
  //const { t } = useTranslation()

  return (
    <Box color="white" minH="87vh" p={4}>
      <Flex w="100%" mb={4} borderRadius="md">
        <Box w="23%" display="flex" alignItems="center" justifyContent="center">
          <SymbolSelection />
        </Box>
        <Box w="77%" borderRadius="md" ml={2}>
          <HeaderInformation />
        </Box>
      </Flex>

      <Box display="flex" gap={2} minH="71vh">
        <Box bg="grey.800" w="26%" p={4} borderRadius="md">
          <Trading />
        </Box>

        {/* Middle Content */}
        <Box
          bg="grey.800"
          w="60%"
          display="flex"
          flexDirection="column"
          gap={4}
          p={4}
          borderRadius="md"
        >
          {/* Top Section */}
          <Box bg="grey.500" p={4} borderRadius="md">
            Top Section
          </Box>
          {/* Bottom Section */}
          <Box bg="grey.500" p={4} borderRadius="md">
            Bottom Section
          </Box>
        </Box>

        {/* Right Sidebar */}
        <Box bg="grey.800" w="26%" p={4} borderRadius="md">
          Right Sidebar
        </Box>
      </Box>
    </Box>
  )
}

export default Terminal
