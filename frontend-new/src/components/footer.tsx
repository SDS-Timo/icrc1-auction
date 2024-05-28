import React from 'react'

import { Container, Box, Flex, Text } from '@chakra-ui/react'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <Container maxW="container.lg">
        <Flex justifyContent="space-between" alignItems="center">
          <Box></Box>
          <Box>
            <Text color="gray.500">
              &copy; {new Date().getFullYear()} -{' '}
              <a href="/" className="text-muted">
                Trading
              </a>
            </Text>
          </Box>
        </Flex>
      </Container>
    </footer>
  )
}

export default Footer
