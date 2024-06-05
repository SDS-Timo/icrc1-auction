import { Box, Flex, Text } from '@chakra-ui/react'
//import { useTranslation } from 'react-i18next'

const HeaderInformation = () => {
  //const { t } = useTranslation()

  return (
    <Flex direction="row" wrap="wrap" gap={4}>
      <Box p={4} borderRadius="md" flex="1">
        <Flex direction="column">
          <Text color="grey.300" fontSize="11px">
            Last Price
          </Text>
          <Text color="white" fontSize="12px">
            $70.000,00
          </Text>
        </Flex>
      </Box>
      <Box p={4} borderRadius="md" flex="1">
        <Flex direction="column">
          <Text color="grey.300" fontSize="11px">
            24h Change
          </Text>
          <Text color="green.400" fontSize="12px">
            +7.92%(+$279.88)
          </Text>
        </Flex>
      </Box>
      <Box p={4} borderRadius="md" flex="1">
        <Flex direction="column">
          <Text color="grey.300" fontSize="11px">
            24h Volume (BTC)
          </Text>
          <Text color="white" fontSize="12px">
            +7.92%(+$279.88)
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}

export default HeaderInformation
