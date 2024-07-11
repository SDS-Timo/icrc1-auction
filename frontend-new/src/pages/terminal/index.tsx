import React from 'react'

import { Box, Flex, useColorModeValue } from '@chakra-ui/react'

import Chart from './chart'
import HeaderInformation from './headerInformation'
import History from './history'
import SymbolSelection from './symbolSelection'
import Trading from './trading'
import Orders from './userData'

const Terminal: React.FC = () => {
  const bgColor = useColorModeValue('grey.50', 'grey.800')
  const isVisible = true

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
          w={{ base: '100%', md: '55%' }}
          display="flex"
          flexDirection="column"
          p={4}
          borderRadius="md"
          mb={{ base: 4, md: 0 }}
          height="80vh"
        >
          <Box
            bg={bgColor}
            display={isVisible ? 'block' : 'none'}
            px={4}
            pt={4}
            borderRadius="md"
            h="40vh"
          >
            <Chart />
          </Box>
          <Box bg={bgColor} p={4} borderRadius="md">
            <Orders />
          </Box>
        </Box>
        <Box
          bg={bgColor}
          w={{ base: '100%', md: '25%' }}
          p={4}
          borderRadius="md"
        >
          <History />
        </Box>
      </Box>
    </Box>
  )
}

export default Terminal
