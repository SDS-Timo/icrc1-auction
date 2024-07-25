import React, { useState, useEffect } from 'react'

import {
  Button,
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Image,
  useToast,
  useColorModeValue,
  Progress,
} from '@chakra-ui/react'
import { FaWallet, FaCopy } from 'react-icons/fa'
import { FiArrowDownLeft, FiArrowUpRight } from 'react-icons/fi'
import { useSelector, useDispatch } from 'react-redux'

import useBalances from '../../../hooks/useBalances'
import { RootState, AppDispatch } from '../../../store'
import { setBalances } from '../../../store/balances'

const WalletContent: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const dispatch = useDispatch<AppDispatch>()
  const [selectedTab, setSelectedTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const balances = useSelector((state: RootState) => state.balances.balances)

  const walletAddress = '0x1234....5678'
  const toast = useToast()

  async function fetchBalances() {
    setLoading(true)
    const { getBalances } = useBalances()
    const balancesRaw = await getBalances(userAgent)
    const sortedBalances = balancesRaw.sort(
      (a, b) => b.volumeInBase - a.volumeInBase,
    )
    dispatch(setBalances(sortedBalances))
    setLoading(false)
  }

  useEffect(() => {
    if (isAuthenticated) fetchBalances()
  }, [userAgent])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress).then(() => {
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

  return (
    <VStack spacing={4} align="stretch">
      <Flex align="center">
        <Icon as={FaWallet} boxSize={6} mr={2} />
        <Text>{walletAddress}</Text>
        <Button onClick={copyToClipboard} variant="unstyled" ml={2}>
          <Icon as={FaCopy} boxSize={4} />
        </Button>
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
              balances.map((token) => (
                <Flex
                  key={token.id}
                  justify="space-between"
                  align="center"
                  py={2}
                >
                  <Flex align="center">
                    <Image
                      src={token.logo}
                      alt={token.symbol}
                      h="30px"
                      w="30px"
                    />
                    <Text ml={2} fontSize="14px" fontWeight={600}>
                      {token.name}
                    </Text>
                  </Flex>
                  <Text fontSize="13px">
                    {token.volumeInBase.toFixed(token.volumeInBaseDecimals)}
                    <Text as="span" fontSize="10px" ml={1}>
                      {token.symbol}
                    </Text>
                  </Text>
                </Flex>
              ))
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}

export default WalletContent
