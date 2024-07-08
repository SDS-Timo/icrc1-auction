import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store'

const HeaderInformation = () => {
  const headerInformation = useSelector(
    (state: RootState) => state.prices.headerInformation,
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
          <Stat>
            <StatLabel>Last Auction</StatLabel>
            <StatNumber>
              {typeof headerInformation?.lastAuction === 'number'
                ? `$${headerInformation?.lastAuction.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : '--'}
            </StatNumber>
          </Stat>
        </Flex>
      </Box>
      <Box
        p={4}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Stat>
            <StatLabel>Previous Change</StatLabel>
            {typeof headerInformation?.previousChange.amount === 'number' &&
            typeof headerInformation?.previousChange.percentage === 'number' ? (
              headerInformation.previousChange.amount >= 0 ? (
                <>
                  <StatNumber>
                    $
                    {headerInformation.previousChange.amount.toLocaleString(
                      'en-US',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {headerInformation.previousChange.percentage.toFixed(2)}%
                  </StatHelpText>
                </>
              ) : (
                <>
                  <StatNumber>
                    $
                    {headerInformation.previousChange.amount.toLocaleString(
                      'en-US',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    {headerInformation.previousChange.percentage.toFixed(2)}%
                  </StatHelpText>
                </>
              )
            ) : (
              <StatNumber>--</StatNumber>
            )}
          </Stat>
        </Flex>
      </Box>
      <Box
        p={4}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Stat>
            <StatLabel>7d Volume</StatLabel>
            <StatNumber>
              {headerInformation &&
              typeof headerInformation.periodVolume === 'number' &&
              headerInformation.periodVolume > 0
                ? `$${headerInformation.periodVolume.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : '--'}
            </StatNumber>
          </Stat>{' '}
        </Flex>
      </Box>
    </Flex>
  )
}

export default HeaderInformation
