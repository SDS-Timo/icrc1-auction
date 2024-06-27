import { useEffect, useState } from 'react'

import { RepeatIcon } from '@chakra-ui/icons'
import { Box, IconButton } from '@chakra-ui/react'
import { AnonymousIdentity, HttpAgent } from '@dfinity/agent'
import { useSelector, useDispatch } from 'react-redux'

import Chart from './chart'
import usePriceHistory from '../../../hooks/usePriceHistory'
import { RootState, AppDispatch } from '../../../store'
import { setUserAgentHost } from '../../../store/auth'
import { DataItem } from '../../../types'

const ChartPlot = () => {
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
  const [volumeAxis, setVolumeAxis] = useState('quote')
  const [loading, setLoading] = useState(true)
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

      const limitedData = prices.slice(-100).reverse()

      setData(limitedData)
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
        }
      } else {
        return {
          ...item,
          volume: item.volumeInBase,
        }
      }
    })
    setData(updatedData)
  }, [volumeAxis])

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
          position="absolute"
          top="98%"
          left="96%"
          transform="translateX(-50%)"
          zIndex="10"
        >
          <IconButton
            aria-label="Change Scale"
            icon={<RepeatIcon />}
            variant="unstyled"
            size="md"
            onClick={handleToggleVolumeAxis}
          />
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
