import { Box, Flex, Text } from '@chakra-ui/react'
//import { useTranslation } from 'react-i18next'

const HeaderInformation = () => {
  //const { t } = useTranslation()

  return (
    <Flex direction="row" wrap="wrap" gap={4}>
      <Box p={4} borderRadius="md" flex="1">
        <Flex direction="column">
          <Text fontSize="11px">Last Auction</Text>
          <Text fontSize="12px">$3,500</Text>
        </Flex>
      </Box>
      <Box p={4} borderRadius="md" flex="1">
        <Flex direction="column">
          <Text fontSize="11px">Previous Change</Text>
          <Text color="green.400" fontSize="12px">
            +7.92%(+$279.88)
          </Text>
        </Flex>
      </Box>
      <Box p={4} borderRadius="md" flex="1">
        <Flex direction="column">
          <Text fontSize="11px">7d Volume (ETH)</Text>
          <Text color="green.400" fontSize="12px">
            +7.92%(+279.88)
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}

export default HeaderInformation
