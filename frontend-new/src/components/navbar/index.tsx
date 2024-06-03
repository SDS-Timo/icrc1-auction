import React from 'react'

import { Image } from '@chakra-ui/react'
import { Box, Flex } from '@chakra-ui/react'

import NavbarLanguages from './language'
import NavbarSettings from './settings'
import NavbarWallet from './wallet'
import Logo from '../../assets/img/icons/logo.svg'

const NavbarComponent: React.FC = () => {
  return (
    <Flex w="100%" px={4} mt={2} justifyContent="space-between">
      <Box>
        <Image src={Logo} alt="Logo" />
      </Box>
      <Flex flexDirection="row">
        <NavbarSettings />
        <NavbarLanguages />
        <NavbarWallet />
      </Flex>
    </Flex>
  )
}

export default NavbarComponent
