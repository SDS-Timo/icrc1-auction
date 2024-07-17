import React, { useEffect, useState } from 'react'

import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import tableContent from './openOrdersTable'
import AuthComponent from '../../../../components/auth'
import PaginationTable from '../../../../components/pagination'
import useOpenOrdersHistory from '../../../../hooks/useOpenOrders'
import { RootState } from '../../../../store'
import { TokenDataItem } from '../../../../types'

const OpenOrders: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [openOrders, setOpenOrders] = useState<TokenDataItem[]>([])
  const [openOrdersFiltered, setOpenOrdersFiltered] = useState<TokenDataItem[]>(
    [],
  )
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

  async function fetchOpenOrders() {
    if (selectedQuote) {
      setLoading(true)
      const { getOpenOrders } = useOpenOrdersHistory()
      const openOrders = await getOpenOrders(userAgent, selectedQuote)

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

  const handleCheckboxChange = (e: boolean) => {
    setShowAllMarkets(e)
  }

  const handleCancelOrder = (id: number | undefined) => {
    console.log(`Cancel Order ${id}`)
  }

  const handleToggleVolume = () => {
    setToggleVolume((prevState) => (prevState === 'quote' ? 'base' : 'quote'))
  }

  const { tableColumns, hiddenColumns, sortBy } = tableContent(
    toggleVolume,
    handleToggleVolume,
    handleCancelOrder,
  )

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
          <PaginationTable
            columns={tableColumns}
            data={openOrdersFiltered}
            hiddenColumns={hiddenColumns}
            searchBy={true}
            sortBy={sortBy}
            tableSize="sm"
            fontSize="11px"
            emptyMessage="no order found"
            pgSize={isResizeUserData ? 15 : 3}
            onClick={(c) => c}
            onClickAllMarkets={handleCheckboxChange}
          />
        </Box>
      )}
    </Box>
  )
}

export default OpenOrders
