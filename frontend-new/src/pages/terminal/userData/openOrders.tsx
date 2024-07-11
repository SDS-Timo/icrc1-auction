import React, { useEffect, useState } from 'react'

import { SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Button,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Checkbox,
  HStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import OpenOrdersRow from './openOrdersRow'
import AuthComponent from '../../../components/auth'
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
  const [searchTerm, setSearchTerm] = useState('')
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
        (transaction) => transaction.symbol === symbol?.label,
      )
      setTransactionsFiltered(filtered)
    }
  }

  const handleSearch = () => {
    console.log(`Searching for ${searchTerm}`)
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAllMarkets(e.target.checked)
  }

  const handleCancelOrder = (id: number | undefined) => {
    console.log(`Cancel Order ${id}`)
  }

  const handleViewTransaction = (id: number | undefined) => {
    console.log(`View transaction ${id}`)
  }

  const handleToggleVolume = () => {
    setToggleVolume((prevState) =>
      prevState === 'quote' && !showAllMarkets ? 'base' : 'quote',
    )
  }

  useEffect(() => {
    filterTransactions(transactions)
    if (showAllMarkets) setToggleVolume('quote')
  }, [showAllMarkets])

  useEffect(() => {
    if (isAuthenticated) fetchTransactions()
  }, [selectedQuote, userAgent])

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
          <HStack justifyContent="space-between" mb={4}>
            <Checkbox onChange={handleCheckboxChange}>
              <Text fontSize="14px">Show all markets</Text>
            </Checkbox>
            <InputGroup size="xs" width="auto">
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                pr="2.5rem"
              />
              <InputRightElement>
                <IconButton
                  aria-label="Search"
                  icon={<SearchIcon />}
                  onClick={handleSearch}
                  size="xs"
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
          </HStack>
          <Table variant="unstyled" size="sm">
            <Thead>
              <Tr>
                <Th textAlign="center">Symbol</Th>
                <Th textAlign="center">Side</Th>
                <Th
                  textAlign="center"
                  whiteSpace="nowrap"
                  cursor="pointer"
                  onClick={handleToggleVolume}
                  _hover={{ textDecoration: 'underline' }}
                >
                  Amount
                  <Text as="span" fontSize="10px">
                    {' '}
                    (
                    {symbol && toggleVolume === 'quote'
                      ? symbol.quote
                      : symbol && symbol.base}
                    )
                  </Text>
                </Th>
                <Th textAlign="center">Price</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactionsFiltered.map((transaction) => (
                <OpenOrdersRow
                  key={transaction.id}
                  data={transaction}
                  toggleVolume={toggleVolume}
                  handleCancelOrder={handleCancelOrder}
                  handleViewTransaction={handleViewTransaction}
                />
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  )
}

export default TradeHistory
