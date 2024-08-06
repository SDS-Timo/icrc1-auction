import React, { useState, useEffect } from 'react'

import {
  Button,
  IconButton,
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useToast,
  useColorModeValue,
  Progress,
  Tooltip,
} from '@chakra-ui/react'
import { FaWallet, FaCopy } from 'react-icons/fa'
import { FiArrowDownLeft, FiArrowUpRight } from 'react-icons/fi'
import { useSelector, useDispatch } from 'react-redux'

import TokenRow from './tokenRow'
import useWallet from '../../../hooks/useWallet'
import { RootState, AppDispatch } from '../../../store'
import { setBalances } from '../../../store/balances'
import { NotifyResult, TokenDataItem } from '../../../types'
import { formatWalletAddress } from '../../../utils/authUtils'
import {
  convertVolumeFromCanister,
  getDecimals,
} from '../../../utils/calculationsUtils'
import { getErrorMessageNotifyDeposits } from '../../../utils/walletUtils'

const WalletContent: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })
  const dispatch = useDispatch<AppDispatch>()
  const [selectedTab, setSelectedTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [localBalances, setLocalBalances] = useState<TokenDataItem[]>([])
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const isPrincipal = useSelector((state: RootState) => state.auth.isPrincipal)
  const balances = useSelector((state: RootState) => state.balances.balances)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)

  const walletAddress = formatWalletAddress(isPrincipal)

  async function fetchBalances() {
    setLoading(true)
    const { getBalancesCredits } = useWallet()

    const balancesCredits = await getBalancesCredits(userAgent, tokens)

    const sortedBalances = balancesCredits.sort(
      (a, b) => (b.volumeInAvailable ?? 0) - (a.volumeInAvailable ?? 0),
    )
    dispatch(setBalances(sortedBalances))
    setLoading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(isPrincipal).then(() => {
      toast({
        position: 'top-right',
        title: 'Copied',
        description: 'Wallet address copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    })
  }

  const handleNotify = (principal: string | undefined, base: string) => {
    const { balanceNotify } = useWallet()

    const loadingNotify = (base: string, loading: boolean) => {
      setLocalBalances((prevBalances) =>
        prevBalances.map((balance: TokenDataItem) =>
          balance.base === base ? { ...balance, loading } : balance,
        ),
      )
    }
    loadingNotify(base, true)

    const toastId = toast({
      title: `Checking new ${base} deposits`,
      description: 'Please wait',
      status: 'loading',
      duration: null,
      isClosable: true,
    })

    balanceNotify(userAgent, principal)
      .then(async (response: NotifyResult) => {
        if (Object.keys(response).includes('Ok')) {
          await fetchBalances()
          const token = balances.find((balance) => balance.base === base)

          const creditTotalRaw = response.Ok?.credit
          const depositIncRaw = response.Ok?.deposit_inc
          const creditIncRaw = response.Ok?.credit_inc

          const { volumeInBase: creditTotal } = convertVolumeFromCanister(
            Number(creditTotalRaw),
            getDecimals(token),
            0,
          )

          const { volumeInBase: depositInc } = convertVolumeFromCanister(
            Number(depositIncRaw),
            getDecimals(token),
            0,
          )

          const { volumeInBase: creditInc } = convertVolumeFromCanister(
            Number(creditIncRaw),
            getDecimals(token),
            0,
          )

          if (toastId) {
            toast.update(toastId, {
              title: `New ${base} deposits found: ${depositInc}`,
              description: `Credited: ${creditInc} | Total: ${creditTotal.toFixed(token?.volumeInBaseDecimals)}`,
              status: 'success',
              isClosable: true,
            })
          }
        } else {
          if (toastId) {
            const description = getErrorMessageNotifyDeposits(response.Err)
            toast.update(toastId, {
              title: `No new ${base} deposits found`,
              description,
              status: 'warning',
              isClosable: true,
            })
          }
        }
        loadingNotify(base, false)
      })
      .catch((error) => {
        const message = error.response ? error.response.data : error.message

        if (toastId) {
          toast.update(toastId, {
            title: 'Notify deposit rejected',
            description: `Error: ${message}`,
            status: 'error',
            isClosable: true,
          })
        }
        loadingNotify(base, false)
        console.error('Cancellation failed:', message)
      })
  }

  useEffect(() => {
    if (isAuthenticated) fetchBalances()
  }, [userAgent, tokens])

  useEffect(() => {
    setLocalBalances(balances)
  }, [balances])

  return (
    <VStack spacing={4} align="stretch">
      <Flex align="center">
        <Icon as={FaWallet} boxSize={5} mr={2} />
        <Text>{walletAddress}</Text>
        <Tooltip label="Wallet Address" aria-label="Wallet Address">
          <IconButton
            aria-label="Copy to clipboard"
            icon={<Icon as={FaCopy} boxSize={3} />}
            size="xs"
            ml={2}
            onClick={copyToClipboard}
            variant="ghost"
            _hover={{
              bg: bgColorHover,
            }}
          />
        </Tooltip>
      </Flex>
      <Flex justify="space-between" mt={3}>
        <Button
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          bg={bgColor}
          color={fontColor}
          width={150}
          height="80px"
          ml={4}
          _hover={{
            bg: bgColorHover,
          }}
        >
          <Flex
            align="center"
            justify="center"
            borderRadius="full"
            boxSize="40px"
            bg="rgba(255, 255, 255, 0.4)"
            boxShadow="0 0 8px rgba(0, 0, 0, 0.2)"
          >
            <Icon as={FiArrowDownLeft} boxSize={6} />
          </Flex>
          <Text mt={2}>Deposit</Text>
        </Button>
        <Button
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          bg={bgColor}
          color={fontColor}
          width={150}
          height="80px"
          mr={4}
          _hover={{
            bg: bgColorHover,
          }}
        >
          <Flex
            align="center"
            justify="center"
            borderRadius="full"
            boxSize="40px"
            bg="rgba(255, 255, 255, 0.4)"
            boxShadow="0 0 8px rgba(0, 0, 0, 0.2)"
          >
            <Icon as={FiArrowUpRight} boxSize={6} />
          </Flex>
          <Text mt={2}>Withdraw</Text>
        </Button>
      </Flex>
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
            My Tokens
          </Tab>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
            _active={{ background: 'transparent' }}
          >
            Tokens
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {loading ? (
              <Flex justify="center" align="center" h="100px">
                <Progress size="xs" isIndeterminate w="90%" />
              </Flex>
            ) : (
              localBalances.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  userAgent={userAgent}
                  isPrincipal={isPrincipal}
                  handleNotify={() => handleNotify(token.principal, token.base)}
                />
              ))
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}

export default WalletContent
