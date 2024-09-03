import { HttpAgent, AnonymousIdentity } from '@dfinity/agent'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Draft } from 'immer'

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
    setUserAgent: (
      state: Draft<AuthState>,
      action: PayloadAction<HttpAgent>,
    ) => {
      state.userAgent = action.payload
    },
    setIsAuthenticated: (
      state: Draft<AuthState>,
      action: PayloadAction<boolean>,
    ) => {
      state.isAuthenticated = action.payload
    },
    setUserPrincipal: (
      state: Draft<AuthState>,
      action: PayloadAction<string>,
    ) => {
      state.userPrincipal = action.payload
    },
    setUserDeposit: (
      state: Draft<AuthState>,
      action: PayloadAction<string>,
    ) => {
      state.userDeposit = action.payload
    },
    logout: (state: Draft<AuthState>) => {
      state.userAgent = anonymousIdentity
      state.isAuthenticated = false
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
