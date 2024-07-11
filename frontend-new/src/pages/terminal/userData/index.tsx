import React, { useState } from 'react'

import { Box, Tab, Tabs, TabList, TabPanels, TabPanel } from '@chakra-ui/react'

import OpenOrders from './openOrders'
import TradeHistory from './tradeHistory'

const UserData: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0)

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
            _active={{ background: 'transparent' }}
          >
            Open Orders
          </Tab>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
            _active={{ background: 'transparent' }}
          >
            Trade History
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <OpenOrders />
          </TabPanel>
          <TabPanel>
            <TradeHistory />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default UserData
