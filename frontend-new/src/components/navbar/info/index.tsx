import React, { useEffect } from 'react'

import { InfoIcon } from '@chakra-ui/icons'
import {
  IconButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Box,
  Icon,
  Text,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaCopy } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'

import useOrder from '../../../hooks/useOrders'
import { RootState, AppDispatch } from '../../../store'
import { setMinimumOrderSize, setOrderStepSize } from '../../../store/orders'

const NavbarInfo: React.FC = () => {
  const toast = useToast({
    duration: 2000,
    position: 'top-right',
    isClosable: true,
  })
  const dispatch = useDispatch<AppDispatch>()
  const principal = process.env.CANISTER_ID_ICRC_AUCTION

  const bgColor = useColorModeValue('grey.100', 'grey.900')
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')

  const { userAgent } = useSelector((state: RootState) => state.auth)
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const minimumOrderSize = useSelector(
    (state: RootState) => state.orders.minimumOrderSize,
  )

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        position: 'top-right',
        title: 'Copied',
        description,
        status: 'success',
      })
    })
  }

  async function getMinimumOrder() {
    if (userAgent && selectedQuote) {
      const { getOrderSettings } = useOrder()

      const settings = await getOrderSettings(userAgent, selectedQuote)
      dispatch(setMinimumOrderSize(settings.orderQuoteVolumeMinimum))
      dispatch(setOrderStepSize(settings.orderQuoteVolumeStep))
    }
  }

  useEffect(() => {
    getMinimumOrder()
  }, [])

  return (
    <Flex alignItems="center" zIndex="10">
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Settings"
          icon={<InfoIcon />}
          variant="unstyled"
          _hover={{ bg: 'transparent' }}
          _focus={{ outline: 'none' }}
        />
        <MenuList bg={bgColor} p={4}>
          <Box mb={2}>
            <Text as="strong" fontSize="14px">
              Auction Principal:
            </Text>
            <Flex alignItems="center">
              <Text ml={1} fontSize="13px">
                {principal}
              </Text>
              <IconButton
                aria-label="Copy to clipboard"
                icon={<Icon as={FaCopy} boxSize={3} />}
                size="xs"
                ml={2}
                onClick={() =>
                  copyToClipboard(
                    principal || '',
                    'Auction principal copied to clipboard',
                  )
                }
                variant="ghost"
                _hover={{
                  bg: bgColorHover,
                }}
              />
            </Flex>
          </Box>
          <Box mb={2}>
            <Text as="strong" fontSize="14px">
              Quote token Principal:
            </Text>
            <Flex alignItems="center">
              <Text ml={1} fontSize="13px">
                {selectedQuote.principal}
              </Text>
              <IconButton
                aria-label="Copy to clipboard"
                icon={<Icon as={FaCopy} boxSize={3} />}
                size="xs"
                ml={2}
                onClick={() =>
                  copyToClipboard(
                    selectedQuote.principal || '',
                    'Quote token principal copied to clipboard',
                  )
                }
                variant="ghost"
                _hover={{
                  bg: bgColorHover,
                }}
              />
            </Flex>
          </Box>
          <Box>
            <Text as="strong" fontSize="14px">
              Minimum order size:
            </Text>
            <Text ml={1} fontSize="13px">
              {minimumOrderSize} {selectedQuote.base}
            </Text>
          </Box>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default NavbarInfo
