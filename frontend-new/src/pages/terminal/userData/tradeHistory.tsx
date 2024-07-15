import React, { useEffect, useState } from 'react'

import {
  Box,
  Flex,
  Image,
  Text,
  Button,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { Row } from 'react-table'

import AuthComponent from '../../../components/auth'
import PaginationTable, {
  ColumnWithSorting,
} from '../../../components/pagination'
import useTransactionHistory from '../../../hooks/useTradeHistory'
import { RootState } from '../../../store'
import { TokenDataItem } from '../../../types'

const TradeHistory: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
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

      const transactionsSort = [...transactions].reverse()
      setTransactions(transactionsSort)
      filterTransactions(transactionsSort)
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

  useEffect(() => {
    filterTransactions(transactions)
    if (showAllMarkets) setToggleVolume('quote')
  }, [showAllMarkets])

  useEffect(() => {
    if (isAuthenticated) fetchTransactions()
  }, [selectedQuote, selectedSymbol, userAgent])

  const tableColumns: ColumnWithSorting<TokenDataItem>[] = [
    {
      Header: 'Symbol',
      accessor: 'symbol',
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const { symbol, base, quote, logo } = row.original
        return (
          <Flex justifyContent="left" alignItems="center">
            <Image src={logo} alt={symbol} h="20px" w="20px" />
            <Text ml="5px" fontWeight="600">
              {base}
            </Text>
            <Text fontSize="10px">/{quote}</Text>
          </Flex>
        )
      },
    },
    {
      Header: 'Side',
      accessor: 'type',
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const { type } = row.original
        return (
          <Text
            textAlign="center"
            color={type === 'buy' ? 'green.500' : 'red.500'}
          >
            {type}
          </Text>
        )
      },
    },
    {
      Header: 'Price',
      accessor: 'price',
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const { price, priceDecimals } = row.original
        return (
          <Text textAlign="center">
            {price.toLocaleString('en-US', {
              minimumFractionDigits: priceDecimals,
              maximumFractionDigits: priceDecimals,
            })}
          </Text>
        )
      },
    },
    {
      Header: 'Amount',
      accessor: 'volume',
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const {
          quote,
          base,
          volumeInQuote,
          volumeInBase,
          volumeInQuoteDecimals,
          volumeInBaseDecimals,
        } = row.original
        return (
          <Text
            textAlign="center"
            onClick={handleToggleVolume}
            sx={{ cursor: 'pointer' }}
          >
            {toggleVolume === 'quote' ? (
              <>
                {volumeInQuote.toFixed(volumeInQuoteDecimals)}{' '}
                <Text as="span" fontSize="10px">
                  {quote}
                </Text>
              </>
            ) : (
              <>
                {volumeInBase.toFixed(volumeInBaseDecimals)}{' '}
                <Text as="span" fontSize="10px">
                  {base}
                </Text>
              </>
            )}
          </Text>
        )
      },
    },
    {
      Header: 'Time',
      accessor: 'time',
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const { time, datetime } = row.original
        return (
          <Text textAlign="center">
            <Tooltip label={datetime}>{time?.toUpperCase()}</Tooltip>
          </Text>
        )
      },
    },
    {
      accessor: 'base',
    },
    {
      accessor: 'quote',
    },
  ]

  const hiddenColumns: string[] = ['base', 'quote']

  const sortBy = [{ id: 'symbol', desc: false }]

  return (
    <Box
      filter={loading ? 'blur(5px)' : 'none'}
      pointerEvents={loading ? 'none' : 'auto'}
    >
      {!isAuthenticated ? (
        <Flex justifyContent="center" alignItems="center" h="5vh">
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
            pgSize={3}
            onClick={(c) => c}
            onClickAllMarkets={handleCheckboxChange}
          />
        </Box>
      )}
    </Box>
  )
}

export default TradeHistory
