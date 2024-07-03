import { Box, Flex, Text } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store'

const HeaderInformation = () => {
  const headerInformation = useSelector(
    (state: RootState) => state.tokens.headerInformation,
  )

  const isLoading = !headerInformation

  return (
    <Flex direction="row" wrap="wrap" gap={4}>
      <Box
        p={4}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Text>Last Auction</Text>
          <Text>
            {typeof headerInformation?.lastAuction === 'number'
              ? `$${headerInformation?.lastAuction.toFixed(2)}`
              : '--'}
          </Text>
        </Flex>
      </Box>
      <Box
        p={4}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Text>Previous Change</Text>
          {typeof headerInformation?.previousChange.amount === 'number' &&
          typeof headerInformation?.previousChange.percentage === 'number' ? (
            headerInformation.previousChange.amount >= 0 ? (
              <Text color="green.400">
                +{headerInformation.previousChange.percentage.toFixed(2)}% (+$
                {headerInformation.previousChange.amount.toFixed(2)})
              </Text>
            ) : (
              <Text color="red.400">
                {headerInformation.previousChange.percentage.toFixed(2)}% ($
                {headerInformation.previousChange.amount.toFixed(2)})
              </Text>
            )
          ) : (
            <Text>--</Text>
          )}
        </Flex>
      </Box>
      <Box
        p={4}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Text>7d Volume</Text>
          {typeof headerInformation?.periodVolume === 'number' &&
          headerInformation?.periodVolume > 0 ? (
            <Text>${headerInformation.periodVolume.toFixed(2)}</Text>
          ) : (
            <Text>--</Text>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}

export default HeaderInformation
