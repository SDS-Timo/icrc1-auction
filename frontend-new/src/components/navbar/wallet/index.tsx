import React from 'react'

import { Image } from '@chakra-ui/react'

import Wallet from '../../../assets/img/icons/wallet.svg'

const NavbarWallet: React.FC = () => {
  return <Image src={Wallet} alt="wallet" style={{ width: '20px' }} />
}

export default NavbarWallet
