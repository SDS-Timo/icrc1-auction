import React from 'react'

import { Image } from '@chakra-ui/react'

import Settings from '../../assets/img/icons/settings.svg'

const NavbarSettings: React.FC = () => {
  return <Image src={Settings} alt="wallet" style={{ width: '20px' }} />
}

export default NavbarSettings
