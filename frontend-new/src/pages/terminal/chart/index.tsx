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
import { AnonymousIdentity, HttpAgent } from '@dfinity/agent'
import { useSelector, useDispatch } from 'react-redux'

import Chart from './chart'
import usePriceHistory from '../../../hooks/usePriceHistory'
import { RootState, AppDispatch } from '../../../store'
import { setUserAgentHost } from '../../../store/auth'
import { DataItem } from '../../../types'

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

  const { getPriceHistory } = usePriceHistory()

  const [data, setData] = useState<DataItem[]>([])
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
      const myAgent = new HttpAgent({
        identity: new AnonymousIdentity(),
        host: userAgentHost,
      })

      const prices = await getPriceHistory(
        myAgent,
        selectedSymbol,
        selectedQuote,
      )

      const pricesSort = prices.reverse()

      setPriceHistoryData(pricesSort)
      setData(pricesSort)
      setVolumeAxis('quote')
      setLoading(false)
    }
  }

  const handleToggleVolumeAxis = () => {
    setVolumeAxis((prevState) => (prevState === 'quote' ? 'base' : 'quote'))
  }

  useEffect(() => {
    dispatch(setUserAgentHost(`${process.env.HTTP_AGENT_HOST}`))
  }, [dispatch])

  useEffect(() => {
    fetchPrices()
  }, [userAgentHost, selectedSymbol, selectedQuote])

  useEffect(() => {
    const updatedData = data.map((item) => {
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
    setData(updatedData)
  }, [volumeAxis])

  const onChangeTimeframe = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    const startDate = new Date()
    if (newTimeframe === '1W') {
      startDate.setDate(startDate.getDate() - 6)
    } else if (newTimeframe === '1M') {
      startDate.setMonth(startDate.getMonth() - 1)
    } else {
      setData(priceHistoryData)
      return
    }
    const filtered = priceHistoryData.filter((item) => {
      const itemDate = new Date(item.label)
      return itemDate >= startDate
    })
    setData(filtered)
  }

  return (
    <Box position="relative">
      {loading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex="10"
        ></Box>
      )}
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
                fontSize="xs"
                size="sm"
                borderRadius="0"
              >
                {label}
              </Button>
            ))}
          </Box>
          <Box>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="volume-axis-switch" mb="0" fontSize="10px">
                {symbol?.quote}
              </FormLabel>
              <Switch
                id="volume-axis-switch"
                isChecked={volumeAxis === 'base'}
                onChange={handleToggleVolumeAxis}
                size="sm"
                colorScheme="green"
              />
              <FormLabel
                htmlFor="volume-axis-switch"
                mb="0"
                ml="2"
                fontSize="10px"
              >
                {symbol?.base}
              </FormLabel>
            </FormControl>
          </Box>
        </Box>
        <Chart
          data={data}
          volumeAxis={volumeAxis === 'quote' ? symbol?.quote : symbol?.base}
        />
      </Box>
    </Box>
  )
}

export default ChartPlot
