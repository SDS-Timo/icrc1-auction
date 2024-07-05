import React from 'react'

import { Image } from '@chakra-ui/react'
import { Box, Flex, useDisclosure } from '@chakra-ui/react'

import NavbarLanguages from './language'
import NavbarSettings from './settings'
import NavbarTheme from './theme'
import NavbarWallet from './wallet'
import AuthComponent from '../auth'

const NavbarComponent: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Flex
      w="100%"
      px={4}
      mt={2}
      justifyContent="space-between"
      borderBottom="1px solid"
      borderColor="gray.800"
    >
      <Box>{/* <Image src={Logo} alt="Logo" /> */}</Box>
      <Flex flexDirection="row" alignItems="center">
        <NavbarLanguages />
        <NavbarTheme />
        <NavbarSettings />
        <NavbarWallet onOpen={onOpen} />
        <AuthComponent isOpen={isOpen} onClose={onClose} />
      </Flex>
    </Flex>
  )
}

export default NavbarComponent
