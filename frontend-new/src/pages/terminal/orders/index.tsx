import React, { useState } from 'react'

import { SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  IconButton,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Input,
  InputGroup,
  InputRightElement,
  Checkbox,
  HStack,
} from '@chakra-ui/react'

import OrdersRow from './ordersRow'
import { Order } from '../../../types'

const orders: Order[] = [
  { id: '1', side: 'buy', amount: 1.5, price: 30000 },
  { id: '2', side: 'sell', amount: 0.75, price: 31000 },
]

const Orders: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [showAllMarkets, setShowAllMarkets] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCancelOrder = (id: string) => {
    console.log(`Cancel order ${id}`)
  }

  const handleViewOrder = (id: string) => {
    console.log(`View order ${id}`)
  }

  const handleSearch = () => {
    console.log(`Searching for ${searchTerm}`)
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAllMarkets(e.target.checked)
    console.log(`Show all markets: ${e.target.checked}`)
  }

  return (
    <Box>
      <Tabs
        index={selectedTab}
        onChange={(index) => setSelectedTab(index)}
        borderColor="transparent"
      >
        <TabList>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
          >
            Open Orders
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <HStack justifyContent="space-between" mb={4}>
              <Checkbox onChange={handleCheckboxChange}>
                Show all markets
              </Checkbox>
              <InputGroup size="sm" width="auto">
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  pr="2.5rem"
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Search"
                    icon={<SearchIcon />}
                    onClick={handleSearch}
                    size="sm"
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </HStack>
            <Table variant="unstyled" size="sm">
              <Thead>
                <Tr>
                  <Th textAlign="center">Side</Th>
                  <Th textAlign="center">Amount (BTC)</Th>
                  <Th textAlign="center">Price (ckUSDC)</Th>
                  <Th textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <OrdersRow
                    key={order.id}
                    order={order}
                    handleCancelOrder={handleCancelOrder}
                    handleViewOrder={handleViewOrder}
                  />
                ))}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default Orders
