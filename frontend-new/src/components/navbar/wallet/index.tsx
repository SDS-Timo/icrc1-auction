import React from 'react'

import { IconButton, Flex } from '@chakra-ui/react'
//import { SlWallet } from 'react-icons/sl'
import { FaHouseUser } from 'react-icons/fa6'
interface NavbarWalletProps {
  onOpen: () => void
}

const NavbarWallet: React.FC<NavbarWalletProps> = ({ onOpen }) => {
  return (
    <Flex alignItems="center">
      <IconButton
        aria-label="Settings"
        variant="unstyled"
        _hover={{ bg: 'transparent' }}
        _focus={{ outline: 'none' }}
        onClick={onOpen}
      >
        <FaHouseUser style={{ marginLeft: '10px' }} />
      </IconButton>
    </Flex>
  )
}

export default NavbarWallet
