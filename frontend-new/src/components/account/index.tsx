import React from 'react'

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'

import SeedComponent from './auth/seed'
import WalletComponent from './wallet'
import { RootState } from '../../store'
import { logout } from '../../store/auth'

interface AccountComponentProps {
  isOpen: boolean
  onClose: () => void
}

const AccountComponent: React.FC<AccountComponentProps> = ({
  isOpen,
  onClose,
}) => {
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  const handleLogout = () => {
    dispatch(logout())
    onClose()
  }

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton
            _hover={{
              bg: bgColorHover,
            }}
          />
          {isAuthenticated ? (
            <DrawerHeader>Account details</DrawerHeader>
          ) : (
            <DrawerHeader>Log in to Auction with</DrawerHeader>
          )}

          <DrawerBody>
            {isAuthenticated ? (
              <WalletComponent />
            ) : (
              <SeedComponent onClose={onClose} />
            )}
          </DrawerBody>

          <DrawerFooter>
            {isAuthenticated && (
              <Box flex="1" textAlign="right">
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default AccountComponent
