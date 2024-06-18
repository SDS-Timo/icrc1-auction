import React from 'react'

import { IconButton, Flex } from '@chakra-ui/react'
import { SlWallet } from 'react-icons/sl'

const NavbarWallet: React.FC = () => {
  return (
    <Flex alignItems="center">
      <IconButton
        aria-label="Settings"
        variant="unstyled"
        _hover={{ bg: 'transparent' }}
        _focus={{ outline: 'none' }}
      >
        <SlWallet style={{ marginLeft: '10px' }} />
      </IconButton>
    </Flex>
  )
}

export default NavbarWallet
