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
import { NextSession } from '../../../types'
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

  const [nextSession, setNextSession] = useState<NextSession | null>(null)
  const [nextSessionTime, setNextSessionTime] = useState<Date | null>(null)
  const [tooltipText, setTooltipText] = useState(tooltipTextStandard)

  const isLoading = !headerInformation

  async function fetchStatistics() {
    if (symbol && symbol.principal && selectedQuote) {
      setTooltipText(tooltipTextStandard)

      const { getStatistics } = usePriceHistory()
      const stats = await getStatistics(userAgent, symbol, selectedQuote)

      if (stats) {
        setTooltipText(
          <>
            {`Clearing Price: ${fixDecimal(stats?.clearingPrice, symbol?.decimals)} ${symbol?.quote}`}
            <br />
            {`Clearing Volume: ${stats?.clearingVolume} ${symbol?.base}`}
            <br />
            {`Total Ask Volume: ${stats?.totalAskVolume} ${symbol?.base}`}
            <br />
            {`Total Bid Volume: ${stats?.totalBidVolume} ${symbol?.base}`}
            <br />
          </>,
        )
      }
    }
  }

  async function fetchNextSession() {
    const { getNextSession } = usePriceHistory()
    const info = await getNextSession(userAgent)

    if (info?.datetime) {
      const auctionDate = new Date(info.datetime)
      setNextSessionTime(auctionDate)
    }
    setNextSession(info)
  }

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    let timeoutId: ReturnType<typeof setInterval> | null = null

    const startPolling = () => {
      intervalId = setInterval(() => {
        fetchNextSession()
      }, 1000)
    }

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const handleSessionTime = () => {
      if (!nextSessionTime) return

      const now = new Date()
      const timeDifference = nextSessionTime.getTime() - now.getTime()

      if (timeDifference > 1000) {
        const timeToWait = timeDifference - 1000

        timeoutId = setTimeout(() => {
          startPolling()
        }, timeToWait)
      } else {
        startPolling()
      }
    }

    if (nextSessionTime) {
      handleSessionTime()
    } else {
      fetchNextSession()
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      stopPolling()
    }
  }, [nextSessionTime])

  useEffect(() => {
    fetchStatistics()
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
                    minimumFractionDigits: 0,
                    maximumFractionDigits: headerInformation.priceDigitsLimit,
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
                        minimumFractionDigits: 0,
                        maximumFractionDigits:
                          headerInformation.priceDigitsLimit,
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
                        minimumFractionDigits: 0,
                        maximumFractionDigits:
                          headerInformation.priceDigitsLimit,
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
                    minimumFractionDigits: 0,
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
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Tooltip label={tooltipText} aria-label="Statistics">
            <Stat size="sm" onMouseEnter={() => fetchStatistics()}>
              <StatLabel>Next Auction</StatLabel>
              <StatNumber>
                {nextSession ? nextSession.nextSession : '--'}
              </StatNumber>
            </Stat>
          </Tooltip>
        </Flex>
      </Box>
    </Flex>
  )
}

export default HeaderInformation
