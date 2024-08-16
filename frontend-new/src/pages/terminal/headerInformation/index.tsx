import { useEffect, useState } from 'react'

import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tooltip,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import usePriceHistory from '../../../hooks/usePriceHistory'
import { RootState } from '../../../store'
import { Statistics } from '../../../types'
import { fixDecimal } from '../../../utils/calculationsUtils'

const HeaderInformation = () => {
  const headerInformation = useSelector(
    (state: RootState) => state.prices.headerInformation,
  )
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  const tooltipTextStandard = (
    <>
      {`Checking statistics`}
      <br />
      {`Please wait...`}
    </>
  )

  const [loadingStatistics, setLoadingStatistics] = useState(true)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [tooltipText, setTooltipText] = useState(tooltipTextStandard)

  const isLoading = !headerInformation

  async function fetchStatistics(loading: boolean) {
    if (symbol && symbol.principal && selectedQuote) {
      setTooltipText(tooltipTextStandard)

      if (loading) setLoadingStatistics(true)

      const { getStatistics } = usePriceHistory()

      const stats = await getStatistics(userAgent, symbol, selectedQuote)
      if (stats) {
        setStatistics(stats)

        setTooltipText(
          <>
            {`Clearing Price: ${fixDecimal(stats?.clearingPrice, symbol?.decimals)} ${symbol?.quote}`}
            <br />
            {`Clearing Volume: ${fixDecimal(stats?.clearingVolume, symbol?.decimals)} ${symbol?.base}`}
            <br />
            {`Total Ask Volume: ${fixDecimal(stats?.totalAskVolume, symbol?.decimals)} ${symbol?.base}`}
            <br />
            {`Total Bid Volume: ${fixDecimal(stats?.totalBidVolume, symbol?.decimals)} ${symbol?.base}`}
            <br />
          </>,
        )
      }

      setLoadingStatistics(false)
    }
  }

  useEffect(() => {
    fetchStatistics(true)
  }, [selectedSymbol, selectedQuote])

  return (
    <Flex direction="row" wrap="wrap" gap={4}>
      <Box
        mt={3}
        ml={4}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Stat size="sm">
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
        borderRadius="md"
        flex="1"
        mt={1}
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Stat size="sm">
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
        mt={3}
        ml={4}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Stat size="sm">
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
          </Stat>
        </Flex>
      </Box>
      <Box
        mt={3}
        ml={-2}
        borderRadius="md"
        flex="1"
        filter={loadingStatistics ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Tooltip label={tooltipText} aria-label="Statistics">
            <Stat size="sm" onMouseEnter={() => fetchStatistics(false)}>
              <StatLabel>Next Auction</StatLabel>
              <StatNumber>
                {statistics ? statistics.remainingTime : '--'}
              </StatNumber>
            </Stat>
          </Tooltip>
        </Flex>
      </Box>
    </Flex>
  )
}

export default HeaderInformation
