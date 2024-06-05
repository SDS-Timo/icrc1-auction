import React from 'react'

import { SettingsIcon } from '@chakra-ui/icons'
import { IconButton, Flex } from '@chakra-ui/react'

const NavbarSettings: React.FC = () => {
  return (
    <Flex alignItems="center">
      <IconButton
        aria-label="Settings"
        icon={<SettingsIcon />}
        variant="unstyled"
        _hover={{ bg: 'transparent' }}
        _focus={{ outline: 'none' }}
      />
    </Flex>
  )
}

export default NavbarSettings
