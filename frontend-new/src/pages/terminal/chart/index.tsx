import { useEffect, useState } from 'react'

import {
  Box,
  Switch,
  Button,
  FormControl,
  FormLabel,
  useTheme,
  useColorMode,
} from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'

import Chart from './chart'
import usePriceHistory from '../../../hooks/usePriceHistory'
import { RootState, AppDispatch } from '../../../store'
import { setUserAgentHost } from '../../../store/auth'
import { setHeaderInformation } from '../../../store/tokens'
import { DataItem } from '../../../types'
import { getAgent } from '../../../utils/authUtils'
import { calculateHeaderInformation } from '../../../utils/headerInformationUtils'

const ChartPlot = () => {
  const theme = useTheme()
  const { colorMode } = useColorMode()
  const dispatch = useDispatch<AppDispatch>()
  const { userAgentHost } = useSelector((state: RootState) => state.auth)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )

  const [chartData, setChartData] = useState<DataItem[]>([])
  const [priceHistoryData, setPriceHistoryData] = useState<DataItem[]>([])
  const [volumeAxis, setVolumeAxis] = useState('quote')
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('All')
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  async function fetchPrices() {
    if (
      userAgentHost &&
      selectedSymbol &&
      selectedQuote &&
      !Array.isArray(selectedSymbol) &&
      selectedSymbol.principal
    ) {
      setLoading(true)
      dispatch(setHeaderInformation(null))

      const myAgent = getAgent(userAgentHost)
      const { getPriceHistory } = usePriceHistory()
      const prices = await getPriceHistory(
        myAgent,
        selectedSymbol,
        selectedQuote,
      )

      const headerInformation = calculateHeaderInformation(prices)
      dispatch(setHeaderInformation(headerInformation))

      setPriceHistoryData(prices)
      setChartData(prices)
      setVolumeAxis('quote')
      setLoading(false)
    }
  }

  const handleToggleVolumeAxis = () => {
    setVolumeAxis((prevState) => (prevState === 'quote' ? 'base' : 'quote'))
  }

  const onChangeTimeframe = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    const startDate = new Date()
    if (newTimeframe === '1W') {
      startDate.setDate(startDate.getDate() - 6)
    } else if (newTimeframe === '1M') {
      startDate.setMonth(startDate.getMonth() - 1)
    } else {
      setChartData(priceHistoryData)
      return
    }
    const filtered = priceHistoryData.filter((item) => {
      const itemDate = new Date(item.label)
      return itemDate >= startDate
    })
    setChartData(filtered)
  }

  useEffect(() => {
    dispatch(setUserAgentHost(`${process.env.HTTP_AGENT_HOST}`))
  }, [dispatch])

  useEffect(() => {
    fetchPrices()
  }, [userAgentHost, selectedSymbol, selectedQuote])

  useEffect(() => {
    const updatedData = chartData.map((item) => {
      if (volumeAxis === 'quote') {
        return {
          ...item,
          volume: item.volumeInQuote,
          volumeDecimals: item.volumeInQuoteDecimals,
        }
      } else {
        return {
          ...item,
          volume: item.volumeInBase,
          volumeDecimals: item.volumeInBaseDecimals,
        }
      }
    })
    setChartData(updatedData)
  }, [volumeAxis])

  return (
    <Box position="relative">
      <Box
        filter={loading ? 'blur(5px)' : 'none'}
        pointerEvents={loading ? 'none' : 'auto'}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            {['1W', '1M', 'All'].map((label) => (
              <Button
                key={label}
                onClick={() => onChangeTimeframe(label)}
                variant="unstyled"
                _hover={{
                  bg:
                    colorMode === 'dark'
                      ? theme.colors.grey['600']
                      : theme.colors.grey['200'],
                  color:
                    colorMode === 'dark'
                      ? theme.colors.grey['25']
                      : theme.colors.grey['700'],
                }}
                bg={
                  timeframe === label
                    ? colorMode === 'dark'
                      ? theme.colors.grey['600']
                      : theme.colors.grey['200']
                    : 'transparent'
                }
                color={
                  timeframe === label
                    ? colorMode === 'dark'
                      ? theme.colors.grey['25']
                      : theme.colors.grey['700']
                    : 'inherit'
                }
                fontSize="sm"
                size="sm"
                borderRadius="0"
              >
                {label}
              </Button>
            ))}
          </Box>
          <Box>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="volume-axis-switch" mb="0">
                {symbol?.quote}
              </FormLabel>
              <Switch
                id="volume-axis-switch"
                isChecked={volumeAxis === 'base'}
                onChange={handleToggleVolumeAxis}
                size="sm"
                colorScheme="green"
              />
              <FormLabel htmlFor="volume-axis-switch" mb="0" ml="2">
                {symbol?.base}
              </FormLabel>
            </FormControl>
          </Box>
        </Box>
        <Chart
          data={chartData}
          volumeAxis={volumeAxis === 'quote' ? symbol?.quote : symbol?.base}
        />
      </Box>
    </Box>
  )
}

export default ChartPlot
