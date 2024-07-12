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
  Td,
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

import OpenOrdersRow from './userDataRow'
import AuthComponent from '../../../components/auth'
import useOpenOrdersHistory from '../../../hooks/useOpenOrders'
import { RootState } from '../../../store'
import { TokenDataItem } from '../../../types'

const TradeHistory: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [openOrders, setOpenOrders] = useState<TokenDataItem[]>([])
  const [openOrdersFiltered, setOpenOrdersFiltered] = useState<TokenDataItem[]>(
    [],
  )
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

  async function fetchOpenOrders() {
    if (selectedQuote) {
      setLoading(true)
      const { getOpenOrders } = useOpenOrdersHistory()
      const openOrders = await getOpenOrders(userAgent, selectedQuote)
      openOrders.sort((a, b) => a.symbol.localeCompare(b.symbol))
      setOpenOrders(openOrders)
      filterOpenOrders(openOrders)
      setLoading(false)
    }
  }

  function filterOpenOrders(openOrders: TokenDataItem[]) {
    if (showAllMarkets) {
      setOpenOrdersFiltered(openOrders)
    } else {
      const filtered = openOrders.filter(
        (openOrder) => openOrder.symbol === symbol?.value,
      )
      setOpenOrdersFiltered(filtered)
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

  const handleToggleVolume = () => {
    setToggleVolume((prevState) =>
      prevState === 'quote' && !showAllMarkets ? 'base' : 'quote',
    )
  }

  useEffect(() => {
    filterOpenOrders(openOrders)
    if (showAllMarkets) setToggleVolume('quote')
  }, [showAllMarkets])

  useEffect(() => {
    if (isAuthenticated) fetchOpenOrders()
  }, [selectedQuote, selectedSymbol, userAgent])

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
              {openOrdersFiltered.map((openOrder) => (
                <OpenOrdersRow
                  key={openOrder.id}
                  data={openOrder}
                  toggleVolume={toggleVolume}
                  handleCancel={handleCancelOrder}
                />
              ))}
              {openOrdersFiltered.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Flex justifyContent="center" alignItems="center" mt={5}>
                      <Text>No data</Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  )
}

export default TradeHistory
