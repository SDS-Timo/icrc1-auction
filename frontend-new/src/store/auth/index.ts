import { HttpAgent, AnonymousIdentity } from '@dfinity/agent'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { getAgent } from '../../utils/authUtils'

interface AuthState {
  userAgent: HttpAgent
  isAuthenticated: boolean
  userPrincipal: string
  userDeposit: string
}

const anonymousIdentity = getAgent(new AnonymousIdentity())

const initialState: AuthState = {
  userAgent: anonymousIdentity,
  isAuthenticated: false,
  userPrincipal: '',
  userDeposit: '',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserAgent: (state, action: PayloadAction<HttpAgent>) => {
      return {
        ...state,
        userAgent: action.payload,
      }
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isAuthenticated: action.payload,
      }
    },
    setUserPrincipal: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        userPrincipal: action.payload,
      }
    },
    setUserDeposit: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        userDeposit: action.payload,
      }
    },
    logout: (state) => {
      return {
        ...state,
        userAgent: anonymousIdentity,
        isAuthenticated: false,
        userPrincipal: '',
        userDeposit: '',
      }
    },
  },
})

export const {
  setUserAgent,
  setIsAuthenticated,
  setUserPrincipal,
  setUserDeposit,
  logout,
} = authSlice.actions
export default authSlice.reducer
