import React, { useEffect, useState, useCallback } from 'react'

import {
  Box,
  useDisclosure,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'

import tableContent from './openOrdersTable'
import LoginButtonComponent from '../../../../components/loginButton'
import PaginationTable, {
  pgSizeDinamic,
} from '../../../../components/paginationTable'
import useOpenOrders from '../../../../hooks/useOrders'
import useBalances from '../../../../hooks/useWallet'
import { RootState, AppDispatch } from '../../../../store'
import { setBalances } from '../../../../store/balances'
import { setOpenOrders, setIsRefreshUserData } from '../../../../store/orders'
import { TokenDataItem, Result } from '../../../../types'
import { getErrorMessageCancelOrder } from '../../../../utils/orderUtils'

const OpenOrders: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.700')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })
  const dispatch = useDispatch<AppDispatch>()
  const pgSize = pgSizeDinamic()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [openOrdersFiltered, setOpenOrdersFiltered] = useState<TokenDataItem[]>(
    [],
  )
  const [loading, setLoading] = useState(false)
  const [showAllMarkets, setShowAllMarkets] = useState(false)
  const [toggleVolume, setToggleVolume] = useState('base')
  const { userAgent } = useSelector((state: RootState) => state.auth)
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
  const openOrders = useSelector((state: RootState) => state.orders.openOrders)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  const fetchOpenOrders = useCallback(async () => {
    if (selectedQuote) {
      setLoading(true)
      const { getOpenOrders } = useOpenOrders()
      const openOrdersRaw = await getOpenOrders(
        userAgent,
        tokens,
        selectedQuote,
        orderSettings.orderPriceDigitsLimit,
      )

      dispatch(setOpenOrders(openOrdersRaw))
      filterOpenOrders(openOrdersRaw)
      setLoading(false)
    }
  }, [
    userAgent,
    tokens,
    selectedSymbol,
    selectedQuote,
    orderSettings.orderPriceDigitsLimit,
    isRefreshUserData,
    dispatch,
  ])

  const fetchBalances = useCallback(async () => {
    const { getBalancesCredits } = useBalances()
    const balancesCredits = await getBalancesCredits(userAgent, tokens)
    dispatch(setBalances(balancesCredits))
  }, [userAgent, tokens, dispatch])

  const filterOpenOrders = useCallback(
    (openOrders: TokenDataItem[]) => {
      if (showAllMarkets) {
        setOpenOrdersFiltered(openOrders)
      } else {
        const filtered = openOrders.filter(
          (openOrder) => openOrder.symbol === symbol?.value,
        )
        setOpenOrdersFiltered(filtered)
      }
    },
    [showAllMarkets, symbol],
  )

  const handleCheckboxChange = useCallback((e: boolean) => {
    setShowAllMarkets(e)
  }, [])

  const handleRefreshClick = useCallback(() => {
    dispatch(setIsRefreshUserData())
  }, [dispatch])

  const handleCancelOrderClick = useCallback(
    async (id: bigint | undefined, type: string | undefined) => {
      const refreshOpenOrders = (loading: boolean) => {
        if (!loading) dispatch(setIsRefreshUserData())

        setOpenOrdersFiltered((prevState) =>
          prevState.map((order) =>
            order.id === id ? { ...order, loading } : order,
          ),
        )
      }

      refreshOpenOrders(true)

      const toastId = toast({
        title: 'Cancel order pending',
        description: 'Please wait',
        status: 'loading',
        duration: null,
        isClosable: true,
      })

      const { cancelOrder } = useOpenOrders()
      cancelOrder(userAgent, id, type)
        .then((response: Result) => {
          if (response.length > 0 && Object.keys(response[0]).includes('Ok')) {
            if (toastId) {
              toast.update(toastId, {
                title: 'Sucess',
                description: 'Order cancelled',
                status: 'success',
                isClosable: true,
              })
            }
          } else {
            if (toastId) {
              const description = getErrorMessageCancelOrder(response[0].Err)
              toast.update(toastId, {
                title: 'Cancel order rejected',
                description,
                status: 'error',
                isClosable: true,
              })
            }
          }

          refreshOpenOrders(false)
          fetchBalances()
        })
        .catch((error) => {
          const message = error.response ? error.response.data : error.message

          if (toastId) {
            toast.update(toastId, {
              title: 'Cancel order rejected',
              description: `Error: ${message}`,
              status: 'error',
              isClosable: true,
            })
          }

          refreshOpenOrders(false)
          console.error('Cancellation failed:', message)
        })
    },
    [userAgent, fetchBalances, toast, dispatch],
  )

  const handleToggleVolume = useCallback(() => {
    setToggleVolume((prevState) => (prevState === 'quote' ? 'base' : 'quote'))
  }, [])

  const { tableColumns, hiddenColumns, sortBy } = tableContent(
    toggleVolume,
    handleToggleVolume,
    handleCancelOrderClick,
  )

  useEffect(() => {
    filterOpenOrders(openOrders)
    if (showAllMarkets) setToggleVolume('quote')
  }, [showAllMarkets])

  useEffect(() => {
    if (isAuthenticated) fetchOpenOrders()
    else setShowAllMarkets(false)
  }, [
    selectedQuote,
    selectedSymbol,
    userAgent,
    isRefreshUserData,
    fetchOpenOrders,
  ])

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
            data={openOrdersFiltered}
            hiddenColumns={hiddenColumns}
            searchBy={true}
            sortBy={sortBy}
            tableSize="sm"
            fontSize="11px"
            bgColor={bgColor}
            fontColor={fontColor}
            emptyMessage="no order found"
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

export default OpenOrders
