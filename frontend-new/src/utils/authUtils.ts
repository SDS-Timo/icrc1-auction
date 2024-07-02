import { Actor } from '@dfinity/agent'
import { AnonymousIdentity, HttpAgent } from '@dfinity/agent'

import { _SERVICE as IcrcxActor } from '../../../declarations/icrc1_auction/icrc1_auction.did'
import { idlFactory as IcrcxIDLFactory } from '../../../declarations/icrc1_auction/icrc1_auction.did.js'

export function getActor(userAgent: HttpAgent) {
  const serviceActor = Actor.createActor<IcrcxActor>(IcrcxIDLFactory, {
    agent: userAgent,
    canisterId: `${process.env.CANISTER_ID_ICRC1_AUCTION}`,
  })

  return serviceActor
}

export function getAgent(userAgentHost: string) {
  const myAgent = new HttpAgent({
    identity: new AnonymousIdentity(),
    host: userAgentHost,
  })

  return myAgent
}
