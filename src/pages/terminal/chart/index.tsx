import { useEffect, useState, useCallback } from 'react'

import {
  Box,
  Switch,
  Button,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'

import Chart from './chart'
import usePriceHistory from '../../../hooks/usePriceHistory'
import { RootState, AppDispatch } from '../../../store'
import { setHeaderInformation, setPricesHistory } from '../../../store/prices'
import { DataItem } from '../../../types'
import { calculateHeaderInformation } from '../../../utils/headerInformationUtils'

const ChartPlot = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const dispatch = useDispatch<AppDispatch>()
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const orderSettings = useSelector(
    (state: RootState) => state.orders.orderSettings,
  )
  const priceHistoryData = useSelector(
    (state: RootState) => state.prices.pricesHistory,
  )
  const isRefreshPrices = useSelector(
    (state: RootState) => state.prices.isRefreshPrices,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  const [chartData, setChartData] = useState<DataItem[]>([])
  const [volumeAxis, setVolumeAxis] = useState('quote')
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('1W')

  const fetchPrices = useCallback(async () => {
    if (symbol && symbol.principal && selectedQuote) {
      setLoading(true)
      dispatch(setHeaderInformation(null))

      const { getPriceHistory } = usePriceHistory()
      const prices = await getPriceHistory(
        userAgent,
        symbol,
        selectedQuote,
        orderSettings.orderPriceDigitsLimit,
      )

      const headerInformation = calculateHeaderInformation(prices)
      dispatch(setHeaderInformation(headerInformation))

      dispatch(setPricesHistory(prices))
      setVolumeAxis('quote')
      setLoading(false)
    }
  }, [dispatch, symbol, selectedQuote, orderSettings])

  const handleToggleVolumeAxis = () => {
    setVolumeAxis((prevState) => (prevState === 'quote' ? 'base' : 'quote'))
  }

  const onChangeTimeframe = useCallback(
    (newTimeframe: string) => {
      setTimeframe(newTimeframe)
      const startDate = new Date()
      if (newTimeframe === '1D') {
        startDate.setDate(startDate.getDate() - 1)
      } else if (newTimeframe === '1W') {
        startDate.setDate(startDate.getDate() - 6)
      } else if (newTimeframe === '1M') {
        startDate.setMonth(startDate.getMonth() - 1)
      } else {
        setChartData(priceHistoryData)
        return
      }
      const filtered = priceHistoryData.filter((item) => {
        const itemDate = new Date(item.datetime)
        return itemDate >= startDate
      })
      setChartData(filtered)
    },
    [priceHistoryData],
  )

  useEffect(() => {
    onChangeTimeframe(timeframe)
  }, [priceHistoryData, timeframe, onChangeTimeframe])

  useEffect(() => {
    fetchPrices()
  }, [selectedSymbol, selectedQuote, isRefreshPrices, fetchPrices])

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
            {['1D', '1W', '1M', 'All'].map((label) => (
              <Button
                key={label}
                onClick={() => onChangeTimeframe(label)}
                variant="unstyled"
                _hover={{
                  bg: bgColor,
                  color: fontColor,
                }}
                bg={timeframe === label ? bgColor : 'transparent'}
                color={timeframe === label ? fontColor : 'inherit'}
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
              <FormLabel htmlFor="volume-axis-switch" mb="0" fontSize="14px">
                {symbol?.quote}
              </FormLabel>
              <Switch
                id="volume-axis-switch"
                isChecked={volumeAxis === 'base'}
                onChange={handleToggleVolumeAxis}
                size="sm"
                sx={{
                  '& .chakra-switch__track': {
                    bg: 'grey.500',
                  },
                  '& .chakra-switch__track[data-checked]': {
                    bg: 'grey.500',
                  },
                }}
              />
              <FormLabel
                htmlFor="volume-axis-switch"
                mb="0"
                ml="2"
                fontSize="14px"
              >
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
