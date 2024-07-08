import React, { useState } from 'react'

import {
  Box,
  Text,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tabs,
  Flex,
  Button,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import PriceHistory from './priceHistory'
import TradeHistory from './tradeHistory'
import AuthComponent from '../../../components/auth'
import useTransactionHistory from '../../../hooks/useTradeHistory'
import { RootState } from '../../../store'
import { DataItem } from '../../../types'

const HistoryTabs: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [transactions, setTransactions] = useState<DataItem[]>([])
  const [selectedTab, setSelectedTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const pricesHistory = useSelector(
    (state: RootState) => state.prices.pricesHistory,
  )

  async function fetchTransactions() {
    if (
      selectedSymbol &&
      selectedQuote &&
      !Array.isArray(selectedSymbol) &&
      selectedSymbol.principal
    ) {
      setLoading(true)
      const { getTransactionHistory } = useTransactionHistory()
      const transactions = await getTransactionHistory(
        userAgent,
        selectedSymbol,
        selectedQuote,
      )
      setTransactions(transactions)
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTransactions()
  }, [selectedSymbol, selectedQuote, userAgent])

  return (
    <Box
      filter={loading ? 'blur(5px)' : 'none'}
      pointerEvents={loading ? 'none' : 'auto'}
    >
      <Tabs
        variant="unstyled"
        index={selectedTab}
        onChange={(index) => setSelectedTab(index)}
      >
        <TabList mb="20px">
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
          >
            Price History
          </Tab>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
          >
            Trade History
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box>
              <PriceHistory prices={pricesHistory} />
              {pricesHistory.length === 0 && (
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
          <TabPanel>
            <Box>
              <TradeHistory transactions={transactions} />
              {!loading && isAuthenticated && transactions.length === 0 && (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  minHeight="45vh"
                >
                  <Text>No data</Text>
                </Flex>
              )}
              {!isAuthenticated && (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  minHeight="45vh"
                >
                  <Button
                    onClick={onOpen}
                    variant="unstyled"
                    _hover={{
                      bg: bgColor,
                      color: fontColor,
                    }}
                    fontSize="sm"
                    size="sm"
                    px="15px"
                  >
                    Login or Create Account
                  </Button>
                  <AuthComponent isOpen={isOpen} onClose={onClose} />
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
