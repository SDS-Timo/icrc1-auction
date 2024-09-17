import React from 'react'

import { Image } from '@chakra-ui/react'
import { Box, Flex, useDisclosure, useColorMode } from '@chakra-ui/react'

import NavbarInfo from './info'
import NavbarLanguages from './language'
import NavbarTheme from './theme'
import NavbarWallet from './wallet'
import LogoDark from '../../assets/img/logo/dailyBids_black.svg'
import LogoLight from '../../assets/img/logo/dailyBids_white.svg'
import AccountComponent from '../account'

const NavbarComponent: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode } = useColorMode()

  return (
    <Flex
      w="100%"
      px={4}
      mt={2}
      justifyContent="space-between"
      borderBottom="1px solid"
      borderColor="gray.800"
    >
      <Box>
        <Image
          src={colorMode === 'dark' ? LogoLight : LogoDark}
          height="37px"
          mb="3px"
          alt="Logo"
        />
      </Box>
      <Flex flexDirection="row" alignItems="center">
        <NavbarLanguages />
        <NavbarTheme />
        <NavbarInfo />
        <NavbarWallet onOpen={onOpen} />
        <AccountComponent isOpen={isOpen} onClose={onClose} />
      </Flex>
    </Flex>
  )
}

export default NavbarComponent
