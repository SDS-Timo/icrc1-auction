import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userAgentHost: string | null
}

const HTTP_AGENT_HOST: string = `${process.env.HTTP_AGENT_HOST}`

const initialState: AuthState = {
  userAgentHost: HTTP_AGENT_HOST,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserAgentHost: (state: AuthState, action: PayloadAction<string>) => {
      state.userAgentHost = action.payload
    },
  },
})

export const { setUserAgentHost } = authSlice.actions
export default authSlice.reducer
