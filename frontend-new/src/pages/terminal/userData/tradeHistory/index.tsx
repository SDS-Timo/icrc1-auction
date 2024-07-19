import React, { useEffect, useState } from 'react'

import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import tableContent from './tradeHistoryTable'
import AuthComponent from '../../../../components/auth'
import PaginationTable, {
  pgSizeDinamic,
} from '../../../../components/pagination'
import useTransactionHistory from '../../../../hooks/useTradeHistory'
import { RootState } from '../../../../store'
import { TokenDataItem } from '../../../../types'

const TradeHistory: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const pgSize = pgSizeDinamic()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [transactions, setTransactions] = useState<TokenDataItem[]>([])
  const [transactionsFiltered, setTransactionsFiltered] = useState<
    TokenDataItem[]
  >([])
  const [loading, setLoading] = useState(false)
  const [showAllMarkets, setShowAllMarkets] = useState(false)
  const [toggleVolume, setToggleVolume] = useState('quote')
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const isResizeUserData = useSelector(
    (state: RootState) => state.uiSettings.isResizeUserData,
  )
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  async function fetchTransactions() {
    if (selectedQuote) {
      setLoading(true)
      const { getTransactionHistory } = useTransactionHistory()
      const transactions = await getTransactionHistory(userAgent, selectedQuote)

      setTransactions(transactions)
      filterTransactions(transactions)
      setLoading(false)
    }
  }

  function filterTransactions(transactions: TokenDataItem[]) {
    if (showAllMarkets) {
      setTransactionsFiltered(transactions)
    } else {
      const filtered = transactions.filter(
        (transaction) => transaction.symbol === symbol?.value,
      )
      setTransactionsFiltered(filtered)
    }
  }

  const handleCheckboxChange = (e: boolean) => {
    setShowAllMarkets(e)
  }

  const handleToggleVolume = () => {
    setToggleVolume((prevState) => (prevState === 'quote' ? 'base' : 'quote'))
  }

  const { tableColumns, hiddenColumns, sortBy } = tableContent(
    toggleVolume,
    handleToggleVolume,
  )

  useEffect(() => {
    filterTransactions(transactions)
    if (showAllMarkets) setToggleVolume('quote')
  }, [showAllMarkets])

  useEffect(() => {
    if (isAuthenticated) fetchTransactions()
  }, [selectedQuote, selectedSymbol, userAgent])

  return (
    <Box
      filter={loading ? 'blur(5px)' : 'none'}
      pointerEvents={loading ? 'none' : 'auto'}
    >
      {!isAuthenticated ? (
        <Flex justifyContent="center" alignItems="center" h="20vh">
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
            isDisabled={!symbol}
          >
            Login or Create Account
          </Button>
          <AuthComponent isOpen={isOpen} onClose={onClose} />
        </Flex>
      ) : (
        <Box>
          <PaginationTable
            columns={tableColumns}
            data={transactionsFiltered}
            hiddenColumns={hiddenColumns}
            searchBy={true}
            sortBy={sortBy}
            tableSize="sm"
            fontSize="11px"
            emptyMessage="no transactions found"
            pgSize={isResizeUserData ? 15 : pgSize}
            onClick={(c) => c}
            onClickAllMarkets={handleCheckboxChange}
          />
        </Box>
      )}
    </Box>
  )
}

export default TradeHistory
