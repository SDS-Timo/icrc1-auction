import { Box, Flex, useColorModeValue } from '@chakra-ui/react'
//import { useTranslation } from 'react-i18next';

import Chart from './chart'
import HeaderInformation from './headerInformation'
import Orders from './orders'
import SymbolSelection from './symbolSelection'
import TradeHistory from './tradeHistory'
import Trading from './trading'

const Terminal = () => {
  //const { t } = useTranslation();
  const bgColor = useColorModeValue('grey.50', 'grey.800')

  return (
    <Box p={4}>
      <Flex
        w="100%"
        mb={4}
        borderRadius="md"
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Box
          w={{ base: '100%', md: '20%' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={{ base: 4, md: 0 }}
        >
          <SymbolSelection />
        </Box>
        <Box
          w={{ base: '100%', md: '80%' }}
          borderRadius="md"
          ml={{ base: 0, md: 2 }}
        >
          <HeaderInformation />
        </Box>
      </Flex>

      <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gap={2}>
        <Box
          bg={bgColor}
          w={{ base: '100%', md: '20%' }}
          p={4}
          borderRadius="md"
          mb={{ base: 4, md: 0 }}
        >
          <Trading />
        </Box>
        <Box
          bg={bgColor}
          w={{ base: '100%', md: '60%' }}
          display="flex"
          flexDirection="column"
          gap={4}
          p={4}
          borderRadius="md"
          mb={{ base: 4, md: 0 }}
        >
          <Box bg={bgColor} minH="30vh" p={4} borderRadius="md">
            <Chart />
          </Box>
          <Box bg={bgColor} p={4} borderRadius="md">
            <Orders />
          </Box>
        </Box>
        <Box
          bg={bgColor}
          w={{ base: '100%', md: '20%' }}
          p={4}
          borderRadius="md"
        >
          <TradeHistory />
        </Box>
      </Box>
    </Box>
  )
}

export default Terminal
