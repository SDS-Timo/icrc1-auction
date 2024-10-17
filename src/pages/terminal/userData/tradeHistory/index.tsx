import React, { useEffect, useState } from 'react'

import { Box, useDisclosure, useColorModeValue } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'

import tableContent from './tradeHistoryTable'
import LoginButtonComponent from '../../../../components/loginButton'
import PaginationTable, {
  pgSizeDinamic,
} from '../../../../components/paginationTable'
import useTransactionHistory from '../../../../hooks/useTradeHistory'
import { RootState, AppDispatch } from '../../../../store'
import { setIsRefreshUserData } from '../../../../store/orders'
import { TokenDataItem } from '../../../../types'

const TradeHistory: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.700')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const pgSize = pgSizeDinamic()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const dispatch = useDispatch<AppDispatch>()

  const [transactions, setTransactions] = useState<TokenDataItem[]>([])
  const [transactionsFiltered, setTransactionsFiltered] = useState<
    TokenDataItem[]
  >([])
  const [loading, setLoading] = useState(false)
  const [showAllMarkets, setShowAllMarkets] = useState(false)
  const [toggleVolume, setToggleVolume] = useState('base')
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const isResizeUserData = useSelector(
    (state: RootState) => state.uiSettings.isResizeUserData,
  )
  const isRefreshUserData = useSelector(
    (state: RootState) => state.orders.isRefreshUserData,
  )
  const orderSettings = useSelector(
    (state: RootState) => state.orders.orderSettings,
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
      const transactions = await getTransactionHistory(
        userAgent,
        tokens,
        selectedQuote,
        orderSettings.orderPriceDigitsLimit,
      )

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

  const handleRefreshClick = () => {
    dispatch(setIsRefreshUserData())
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
    else setShowAllMarkets(false)
  }, [selectedQuote, selectedSymbol, userAgent, isRefreshUserData])

  return (
    <Box
      filter={loading ? 'blur(5px)' : 'none'}
      pointerEvents={loading ? 'none' : 'auto'}
    >
      {!isAuthenticated ? (
        <LoginButtonComponent
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          symbol={symbol}
          height="20vh"
        />
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
            bgColor={bgColor}
            fontColor={fontColor}
            emptyMessage="no transactions found"
            pgSize={isResizeUserData ? 15 : pgSize}
            onClick={(c) => c}
            onClickAllMarkets={handleCheckboxChange}
            onClickRefresh={handleRefreshClick}
          />
        </Box>
      )}
    </Box>
  )
}

export default TradeHistory
