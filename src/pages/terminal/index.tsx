import React from 'react'

import { Box, Flex, useColorModeValue } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import Chart from './chart'
import HeaderInformation from './headerInformation'
import History from './history'
import SymbolSelection from './symbolSelection'
import Trading from './trading'
import UserData from './userData'
import { RootState } from '../../store'
const Terminal: React.FC = () => {
  const bgColor = useColorModeValue('grey.50', 'grey.800')
  const isResizeUserData = useSelector(
    (state: RootState) => state.uiSettings.isResizeUserData,
  )

  return (
    <Box px={2}>
      <Flex
        w="100%"
        borderRadius="md"
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Box
          w={{ base: '100%', md: '20%' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mt={{ base: 2, md: 3 }}
          mb={{ base: 2, md: 3 }}
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

      <Flex direction={{ base: 'column', md: 'row' }} gap={2} overflowX="auto">
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
          w={{ base: '100%', md: '51%' }}
          display="flex"
          flexDirection="column"
          borderRadius="md"
          mb={{ base: 4, md: 0 }}
        >
          <Box
            bg={bgColor}
            display={!isResizeUserData ? 'block' : 'none'}
            px={4}
            pt={4}
            borderRadius="md"
            h="40vh"
          >
            <Chart />
          </Box>
          <Box
            bg={bgColor}
            p={4}
            borderRadius="md"
            h={isResizeUserData ? '90vh' : undefined}
          >
            <UserData />
          </Box>
        </Box>
        <Box
          bg={bgColor}
          w={{ base: '100%', md: '29%' }}
          p={4}
          borderRadius="md"
        >
          <History />
        </Box>
      </Flex>
    </Box>
  )
}

export default Terminal
