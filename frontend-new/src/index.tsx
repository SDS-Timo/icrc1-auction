// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './app'
import store from './store/store'
import theme from './theme'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <Provider store={store}>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </Provider>,
)
