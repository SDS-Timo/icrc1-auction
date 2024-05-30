import { Box, Flex } from '@chakra-ui/react'

const Terminal = () => {
  return (
    <Box bg="grey.900" color="white" minH="98vh" p={4}>
      {/* Information Section */}
      <Flex w="100%" mb={4} borderRadius="md">
        <Box bg="grey.600" w="20%" p={4} borderRadius="md">
          Information Left
        </Box>
        <Box bg="grey.600" w="80%" p={4} borderRadius="md" ml={2}>
          {/* Four Information Boxes */}
          <Flex direction="row" wrap="wrap" gap={4}>
            <Box bg="grey.500" p={4} borderRadius="md" flex="1">
              Information 1
            </Box>
            <Box bg="grey.500" p={4} borderRadius="md" flex="1">
              Information 2
            </Box>
            <Box bg="grey.500" p={4} borderRadius="md" flex="1">
              Information 3
            </Box>
            <Box bg="grey.500" p={4} borderRadius="md" flex="1">
              Information 4
            </Box>
          </Flex>
        </Box>
      </Flex>

      {/* Main Content */}
      <Box display="flex" gap={2}>
        {/* Left Sidebar */}
        <Box bg="grey.600" w="20%" p={4} borderRadius="md">
          Left Sidebar
        </Box>

        {/* Middle Content */}
        <Box
          bg="grey.600"
          w="60%"
          display="flex"
          flexDirection="column"
          gap={4}
          p={4}
          borderRadius="md"
        >
          {/* Top Section */}
          <Box bg="grey.500" p={4} borderRadius="md">
            Top Section
          </Box>
          {/* Bottom Section */}
          <Box bg="grey.500" p={4} borderRadius="md">
            Bottom Section
          </Box>
        </Box>

        {/* Right Sidebar */}
        <Box bg="grey.600" w="20%" p={4} borderRadius="md">
          Right Sidebar
        </Box>
      </Box>
    </Box>
  )
}

export default Terminal
