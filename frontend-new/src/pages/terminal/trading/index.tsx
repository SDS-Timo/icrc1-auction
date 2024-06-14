import { useState } from 'react'

import {
  Box,
  Button,
  Grid,
  Input,
  VStack,
  Flex,
  Text,
  FormLabel,
  FormControl,
} from '@chakra-ui/react'

const Trading = () => {
  const [tradeType, setTradeType] = useState('buy')
  const [selectedPercentage, setSelectedPercentage] = useState(null)
  const [price, setPrice] = useState('')
  const [quoteAmount, setQuoteAmount] = useState('')
  const [baseAmount, setBaseAmount] = useState('')

  const handleTradeTypeChange = (type) => {
    setTradeType(type)
  }

  const handlePercentageClick = (percentage) => {
    setSelectedPercentage(percentage === selectedPercentage ? null : percentage)
  }

  const handleInputChange = (e, setState) => {
    setState(e.target.value)
  }

  return (
    <VStack spacing={4} align="stretch">
      <Grid templateColumns="repeat(2, 1fr)" gap={0}>
        <Box
          as="button"
          borderBottomWidth="2px"
          borderBottomColor={tradeType === 'buy' ? 'green.500' : 'transparent'}
          onClick={() => handleTradeTypeChange('buy')}
          textAlign="center"
          py={2}
          color="green.500"
          borderBottom="2px"
          borderColor={tradeType === 'buy' ? 'green.500' : 'transparent'}
          borderTop="none"
          borderLeft="none"
          borderRight="none"
          borderRadius="none"
        >
          BUY
        </Box>
        <Box
          as="button"
          borderBottomWidth="2px"
          borderBottomColor={tradeType === 'sell' ? 'red.500' : 'transparent'}
          onClick={() => handleTradeTypeChange('sell')}
          textAlign="center"
          py={2}
          color="red.500"
          borderBottom="2px"
          borderColor={tradeType === 'sell' ? 'red.500' : 'transparent'}
          borderTop="none"
          borderLeft="none"
          borderRight="none"
          borderRadius="none"
        >
          SELL
        </Box>
      </Grid>
      <Flex direction="column">
        <FormControl variant="floating">
          <Input
            h="58px"
            placeholder=" "
            value={price}
            onChange={(e) => handleInputChange(e, setPrice)}
            sx={{ borderRadius: '5px' }}
          />
          <FormLabel color="grey.500" fontSize="15px">
            Price
          </FormLabel>
        </FormControl>
      </Flex>
      <Flex direction="column">
        <FormControl variant="floating">
          <Input
            h="58px"
            placeholder=" "
            value={quoteAmount}
            onChange={(e) => handleInputChange(e, setQuoteAmount)}
            sx={{ borderRadius: '5px' }}
          />
          <FormLabel color="grey.500" fontSize="15px">
            Amount USDC
          </FormLabel>
        </FormControl>
      </Flex>
      <Flex direction="column">
        <FormControl variant="floating">
          <Input
            h="58px"
            placeholder=" "
            value={baseAmount}
            onChange={(e) => handleInputChange(e, setBaseAmount)}
            sx={{ borderRadius: '5px' }}
          />
          <FormLabel color="grey.500" fontSize="15px">
            Amount BTC
          </FormLabel>
        </FormControl>
      </Flex>
      <Flex justify="space-between" borderBottom="1px solid gray" pb={2}>
        {[25, 50, 75, 100].map((percentage) => (
          <Button
            key={percentage}
            flex="1"
            size="sm"
            mx={1}
            color={selectedPercentage === percentage ? 'grey.25' : 'inherit'}
            bg={
              selectedPercentage === percentage
                ? tradeType === 'buy'
                  ? 'green.500'
                  : 'red.500'
                : 'transparent'
            }
            onClick={() => handlePercentageClick(percentage)}
            _hover={{
              bg: tradeType === 'buy' ? 'green.500' : 'red.500',
              color: 'grey.25',
            }}
          >
            {percentage}%
          </Button>
        ))}
      </Flex>
      <Text textAlign="center" fontSize="12px">
        Available: 7000 USDC
      </Text>
      <Button
        background={tradeType === 'buy' ? 'green.500' : 'red.500'}
        variant="solid"
        h="58px"
      >
        Create Order
      </Button>
      <Text textAlign="center" fontSize="15px" color="red.500">
        Error
      </Text>
    </VStack>
  )
}

export default Trading
