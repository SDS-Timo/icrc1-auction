import React from 'react'

import {
  Flex,
  Icon,
  Tooltip,
  Text,
  useToast,
  useColorModeValue,
  useClipboard,
} from '@chakra-ui/react'
import { FaUserLarge } from 'react-icons/fa6'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store'

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
  const { onCopy } = useClipboard(userPrincipal)

  const userPrincipalTooltip = (
    <>
      {`Do not send funds here!`}
      <br />
      {`User principal: ${userPrincipal}`}
    </>
  )

  const copyToClipboardWalletAddress = () => {
    onCopy()
    toast({
      title: 'Copied',
      description: 'User principal copied to clipboard',
      status: 'success',
      duration: 2000,
    })
  }

  return (
    <Flex align="center">
      <Icon as={FaUserLarge} boxSize={4} mr={2} />
      <Tooltip label={userPrincipalTooltip} aria-label={userPrincipal}>
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
          {userPrincipal.slice(0, 4)}
        </Text>
      </Tooltip>
    </Flex>
  )
}

export default NavbarUser
