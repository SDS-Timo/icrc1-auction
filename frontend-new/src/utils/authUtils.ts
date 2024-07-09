import { Actor, HttpAgent, Identity } from '@dfinity/agent'
import { Ed25519KeyIdentity } from '@dfinity/identity'

import { _SERVICE as IcrcxActor } from '../../../declarations/icrc1_auction/icrc1_auction.did'
import { idlFactory as IcrcxIDLFactory } from '../../../declarations/icrc1_auction/icrc1_auction.did.js'
import { AppDispatch } from '../store'
import { setUserAgent, setIsAuthenticated } from '../store/auth'

export function getActor(userAgent: HttpAgent) {
  const serviceActor = Actor.createActor<IcrcxActor>(IcrcxIDLFactory, {
    agent: userAgent,
    canisterId: `${process.env.CANISTER_ID_ICRC1_AUCTION}`,
  })

  return serviceActor
}

export function getAgent(identity: Identity) {
  const HTTP_AGENT_HOST = `${process.env.HTTP_AGENT_HOST}`

  const myAgent = new HttpAgent({
    identity,
    host: HTTP_AGENT_HOST,
  })

  return myAgent
}

function doLogin(myAgent: HttpAgent, dispatch: AppDispatch) {
  dispatch(setUserAgent(myAgent))
  dispatch(setIsAuthenticated(true))
}

export async function seedAuthenticate(seed: string, dispatch: AppDispatch) {
  if (seed.length === 0 || seed.length > 32) return

  const seedToIdentity: (seed: string) => Identity | null = (seed) => {
    const seedBuf = new Uint8Array(new ArrayBuffer(32))
    seedBuf.set(new TextEncoder().encode(seed))
    return Ed25519KeyIdentity.generate(seedBuf)
  }

  const newIdentity = seedToIdentity(seed)

  if (newIdentity) {
    const myAgent = getAgent(newIdentity)
    doLogin(myAgent, dispatch)
  }
}
