import React from 'react'

import { Image } from '@chakra-ui/react'
import { Box, Flex } from '@chakra-ui/react'

import NavbarLanguages from './language'
import NavbarSettings from './settings'
import NavbarTheme from './theme'
import NavbarWallet from './wallet'

const NavbarComponent: React.FC = () => {
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
        <NavbarWallet />
      </Flex>
    </Flex>
  )
}

export default NavbarComponent
