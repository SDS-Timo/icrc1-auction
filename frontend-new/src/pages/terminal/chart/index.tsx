import { useEffect, useState } from 'react'

import { Box } from '@chakra-ui/react'
import { AnonymousIdentity, HttpAgent } from '@dfinity/agent'
import { useSelector, useDispatch } from 'react-redux'

import Chart from './chart'
import usePriceHistory from '../../../hooks/usePriceHistory'
import { RootState, AppDispatch } from '../../../store'
import { setUserAgentHost } from '../../../store/auth'

interface PriceData {
  label: string
  price: number
  volume: number
}

const ChartPlot = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { userAgentHost } = useSelector((state: RootState) => state.auth)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const { getPriceHistory } = usePriceHistory()

  const [data, setData] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dispatch(setUserAgentHost(`${process.env.HTTP_AGENT_HOST}`))
  }, [dispatch])

  async function fetchPrices() {
    if (
      userAgentHost &&
      selectedSymbol &&
      !Array.isArray(selectedSymbol) &&
      selectedSymbol.principal
    ) {
      setLoading(true)
      const myAgent = new HttpAgent({
        identity: new AnonymousIdentity(),
        host: userAgentHost,
      })

      const prices = await getPriceHistory(myAgent, selectedSymbol.principal)

      const formattedData: PriceData[] = (prices ?? []).map(
        ([ts, sessionNumber, ledger, volume, price], index, array) => {
          const date = new Date(Number(ts) / 1_000_000)
          const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
          }
          const formattedDate = date.toLocaleDateString('en-GB', options)

          let formattedPrice = Number(price)

          if (formattedPrice === 0 && index > 0) {
            for (let i = index - 1; i >= 0; i--) {
              if (Number(array[i][4]) > 0) {
                formattedPrice = Number(array[i][4])
                break
              }
            }
          }

          return {
            label: formattedDate,
            price: formattedPrice,
            volume: Number(volume),
          }
        },
      )

      const limitedData = formattedData.slice(-100).reverse()

      setData(limitedData)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [userAgentHost, selectedSymbol])

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
        <Chart data={data} />
      </Box>
    </Box>
  )
}

export default ChartPlot
