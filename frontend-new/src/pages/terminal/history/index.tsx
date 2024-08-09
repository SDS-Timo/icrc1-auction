import React, { useEffect, useState } from 'react'

import {
  Box,
  Text,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tabs,
  Flex,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import PriceHistory from './history'
import { RootState } from '../../../store'
import { DataItem } from '../../../types'

const HistoryTabs: React.FC = () => {
  const [prices, setPrices] = useState<DataItem[]>([])
  const [selectedTab, setSelectedTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const pricesHistory = useSelector(
    (state: RootState) => state.prices.pricesHistory,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      if (pricesHistory.length > 0) {
        const pricesFiltered = [...pricesHistory].reverse().slice(0, 17)
        setPrices(pricesFiltered)
      } else {
        setPrices([])
      }
      if (symbol) setLoading(false)
    }, 500)

    return () => clearTimeout(timeout)
  }, [pricesHistory, symbol])

  return (
    <Box
      filter={loading ? 'blur(5px)' : 'none'}
      pointerEvents={loading ? 'none' : 'auto'}
    >
      <Tabs
        index={selectedTab}
        onChange={(index) => setSelectedTab(index)}
        borderColor="transparent"
      >
        <TabList>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
            _active={{ background: 'transparent' }}
          >
            Price History
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box>
              <PriceHistory historyData={prices} selectedSymbol={symbol} />
              {prices.length === 0 && (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  minHeight="45vh"
                >
                  <Text>No data</Text>
                </Flex>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default HistoryTabs
