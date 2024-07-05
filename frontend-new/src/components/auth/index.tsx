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
} from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'

import SeedComponent from './seed'
import { RootState } from '../../store'
import { logout } from '../../store/auth'

interface AuthComponentProps {
  isOpen: boolean
  onClose: () => void
}

const authComponent: React.FC<AuthComponentProps> = ({ isOpen, onClose }) => {
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
          <DrawerCloseButton />
          <DrawerHeader>Log in to Auction with</DrawerHeader>

          <DrawerBody>
            <SeedComponent onClose={onClose} />
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

export default authComponent
