import React from 'react'

import {
  Flex,
  Icon,
  Tooltip,
  Text,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaUserLarge } from 'react-icons/fa6'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store'
import { formatWalletAddress } from '../../../utils/walletUtils'

const NavbarUser: React.FC = () => {
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })
  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )
  const walletAddress = formatWalletAddress(userPrincipal)

  const copyToClipboardWalletAddress = () => {
    navigator.clipboard.writeText(userPrincipal).then(() => {
      toast({
        position: 'top-right',
        title: 'Copied',
        description: 'User principal copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    })
  }

  return (
    <Flex align="center">
      <Icon as={FaUserLarge} boxSize={4} mr={2} />
      <Tooltip label={userPrincipal} aria-label={userPrincipal}>
        <Text
          onClick={copyToClipboardWalletAddress}
          cursor="pointer"
          p={1}
          border="1px solid transparent"
          borderRadius="md"
          _hover={{
            borderColor: bgColorHover,
            borderRadius: 'md',
          }}
        >
          {walletAddress}
        </Text>
      </Tooltip>
    </Flex>
  )
}

export default NavbarUser
