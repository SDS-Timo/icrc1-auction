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
  Tooltip,
} from '@chakra-ui/react'
import { FaCopy } from 'react-icons/fa'
import { FiArrowDownLeft, FiArrowUpRight } from 'react-icons/fi'
import { RiHandCoinLine } from 'react-icons/ri'
import { SlWallet } from 'react-icons/sl'
import { useSelector, useDispatch } from 'react-redux'

import TokenTab from './tokenTab'
import useWallet from '../../../hooks/useWallet'
import { RootState, AppDispatch } from '../../../store'
import { setBalances } from '../../../store/balances'
import { Result, TokenDataItem, TokenMetadata } from '../../../types'
import {
  convertVolumeFromCanister,
  convertVolumeToCanister,
  getDecimals,
  fixDecimal,
} from '../../../utils/calculationsUtils'
import { formatWalletAddress } from '../../../utils/walletUtils'
import {
  getErrorMessageNotifyDeposits,
  getErrorMessageWithdraw,
  getErrorMessageDeposit,
} from '../../../utils/walletUtils'

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
  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )
  const userDeposit = useSelector((state: RootState) => state.auth.userDeposit)
  const balances = useSelector((state: RootState) => state.balances.balances)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)

  const walletAddress = formatWalletAddress(userPrincipal)
  const userDepositAddress = formatWalletAddress(userDeposit)

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

  const copyToClipboardWalletAddress = () => {
    navigator.clipboard.writeText(userPrincipal).then(() => {
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

  const copyToClipboardDepositAddress = () => {
    navigator.clipboard.writeText(userDeposit).then(() => {
      toast({
        position: 'top-right',
        title: 'Copied',
        description: 'Deposit address copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    })
  }

  const handleNotify = (principal: string | undefined, base: string) => {
    const { balanceNotify } = useWallet()

    const loadingNotify = (base: string, notifyLoading: boolean) => {
      setLocalBalances((prevBalances) =>
        prevBalances.map((balance: TokenDataItem) =>
          balance.base === base ? { ...balance, notifyLoading } : balance,
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
      .then(async (response: Result) => {
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
              title: `New ${base} deposits found: ${fixDecimal(depositInc, token?.decimals)}`,
              description: `Credited: ${fixDecimal(creditInc, token?.decimals)} | Total: ${fixDecimal(creditTotal, token?.decimals)}`,
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

  const handleWithdraw = (
    amount: number,
    account: string | undefined,
    token: TokenMetadata,
  ) => {
    const withdrawStatus = (base: string, withdrawStatus: string) => {
      setLocalBalances((prevBalances) =>
        prevBalances.map((balance: TokenDataItem) =>
          balance.base === base ? { ...balance, withdrawStatus } : balance,
        ),
      )
    }
    withdrawStatus(token.base, 'loading')

    const volume = convertVolumeToCanister(
      Number(amount),
      Number(token.decimals),
    )

    const toastId = toast({
      title: `Withdraw ${token.base} pending`,
      description: 'Please wait',
      status: 'loading',
      duration: null,
      isClosable: true,
    })

    const { withdrawCredit } = useWallet()
    withdrawCredit(userAgent, `${token.principal}`, account, Number(volume))
      .then((response: Result | null) => {
        if (response && Object.keys(response).includes('Ok')) {
          fetchBalances()
          withdrawStatus(token.base, 'success')

          const { volumeInBase } = convertVolumeFromCanister(
            Number(response.Ok?.amount),
            Number(token.decimals),
            0,
          )

          if (toastId) {
            toast.update(toastId, {
              title: `Withdraw ${token.base} Success`,
              description: `Amount: ${fixDecimal(volumeInBase, token.decimals)} | Txid: ${response.Ok?.txid}`,
              status: 'success',
              isClosable: true,
            })
          }
        } else if (response && Object.keys(response).includes('Err')) {
          withdrawStatus(token.base, 'error')
          if (toastId) {
            const description = getErrorMessageWithdraw(response.Err)
            toast.update(toastId, {
              title: `Withdraw ${token.base} rejected`,
              description,
              status: 'error',
              isClosable: true,
            })
          }
        } else {
          withdrawStatus(token.base, 'error')
          if (toastId) {
            toast.update(toastId, {
              title: `Withdraw ${token.base} rejected`,
              description: 'Something went wrong',
              status: 'error',
              isClosable: true,
            })
          }
        }
      })
      .catch((error) => {
        const message = error.response ? error.response.data : error.message
        withdrawStatus(token.base, 'error')
        if (toastId) {
          toast.update(toastId, {
            title: 'Withdraw rejected',
            description: `Error: ${message}`,
            status: 'error',
            isClosable: true,
          })
        }
        console.error('Withdraw failed:', message)
      })
  }

  const handleDeposit = (
    amount: number,
    account: string | undefined,
    token: TokenMetadata,
  ) => {
    const depositStatus = (base: string, depositStatus: string) => {
      setLocalBalances((prevBalances) =>
        prevBalances.map((balance: TokenDataItem) =>
          balance.base === base ? { ...balance, depositStatus } : balance,
        ),
      )
    }
    depositStatus(token.base, 'loading')

    const volume = convertVolumeToCanister(
      Number(amount),
      Number(token.decimals),
    )

    const toastId = toast({
      title: `Deposit ${token.base} pending`,
      description: 'Please wait',
      status: 'loading',
      duration: null,
      isClosable: true,
    })

    const { deposit } = useWallet()
    deposit(userAgent, `${token.principal}`, account, Number(volume))
      .then((response: Result | null) => {
        if (response && Object.keys(response).includes('Ok')) {
          fetchBalances()
          depositStatus(token.base, 'success')

          const creditTotalRaw = response.Ok?.credit
          const creditIncRaw = response.Ok?.credit_inc

          const { volumeInBase: creditTotal } = convertVolumeFromCanister(
            Number(creditTotalRaw),
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
              title: `Deposit ${token.base} Success | Txid: ${response.Ok?.txid}`,
              description: `Amount: ${fixDecimal(creditInc, token.decimals)} | Total: ${fixDecimal(creditTotal, token.decimals)}`,
              status: 'success',
              isClosable: true,
            })
          }
        } else if (response && Object.keys(response).includes('Err')) {
          depositStatus(token.base, 'error')
          if (toastId) {
            const description = getErrorMessageDeposit(response.Err)
            toast.update(toastId, {
              title: `Deposit ${token.base} rejected`,
              description,
              status: 'error',
              isClosable: true,
            })
          }
        } else {
          depositStatus(token.base, 'error')
          if (toastId) {
            toast.update(toastId, {
              title: `Deposit ${token.base} rejected`,
              description: 'Something went wrong',
              status: 'error',
              isClosable: true,
            })
          }
        }
      })
      .catch((error) => {
        const message = error.response ? error.response.data : error.message
        depositStatus(token.base, 'error')
        if (toastId) {
          toast.update(toastId, {
            title: 'Deposit rejected',
            description: `Error: ${message}`,
            status: 'error',
            isClosable: true,
          })
        }
        console.error('Deposit failed:', message)
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
      <Flex align="center" justifyContent="space-between">
        <Flex align="center">
          <Icon as={SlWallet} boxSize={4} mr={2} />
          <Text>{walletAddress}</Text>
          <Tooltip label="Wallet Address" aria-label="Wallet Address">
            <IconButton
              aria-label="Copy to clipboard"
              icon={<Icon as={FaCopy} boxSize={3} />}
              size="xs"
              ml={2}
              onClick={copyToClipboardWalletAddress}
              variant="ghost"
              _hover={{
                bg: bgColorHover,
              }}
            />
          </Tooltip>
        </Flex>

        <Flex align="center">
          <Icon as={RiHandCoinLine} boxSize={4} mr={2} />
          <Text>{userDepositAddress}</Text>
          <Tooltip label="Deposit Address" aria-label="Deposit Address">
            <IconButton
              aria-label="Copy to clipboard"
              icon={<Icon as={FaCopy} boxSize={3} />}
              size="xs"
              ml={2}
              onClick={copyToClipboardDepositAddress}
              variant="ghost"
              _hover={{
                bg: bgColorHover,
              }}
            />
          </Tooltip>
        </Flex>
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
            <TokenTab
              balances={localBalances.filter(
                (token) => token?.volumeInTotal && token.volumeInTotal > 0,
              )}
              userAgent={userAgent}
              userPrincipal={userPrincipal}
              handleNotify={handleNotify}
              handleWithdraw={handleWithdraw}
              handleDeposit={handleDeposit}
              showSearch={true}
              loading={loading}
            />
          </TabPanel>
          <TabPanel>
            <TokenTab
              balances={localBalances}
              userAgent={userAgent}
              userPrincipal={userPrincipal}
              handleNotify={handleNotify}
              handleWithdraw={handleWithdraw}
              handleDeposit={handleDeposit}
              showSearch={true}
              loading={loading}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}

export default WalletContent
