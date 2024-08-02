import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AccountRefOpt {
  'owner' : Principal,
  'subaccount' : [] | [Subaccount],
}
export interface ICRC1Ledger {
  'icrc1_balance_of' : ActorMethod<[AccountRefOpt], bigint>,
  'icrc1_decimals' : ActorMethod<[], number>,
  'icrc1_fee' : ActorMethod<[], bigint>,
  'icrc1_metadata' : ActorMethod<
    [],
    Array<
      [
        string,
        { 'Int' : bigint } |
          { 'Nat' : bigint } |
          { 'Blob' : Uint8Array | number[] } |
          { 'Text' : string },
      ]
    >
  >,
  'icrc1_symbol' : ActorMethod<[], string>,
  'icrc1_transfer' : ActorMethod<
    [TransferArgs],
    { 'Ok' : bigint } |
      { 'Err' : TransferError }
  >,
  'issueTokens' : ActorMethod<[AccountRefOpt, bigint], undefined>,
  'updateFee' : ActorMethod<[bigint], undefined>,
}
export type Subaccount = Uint8Array | number[];
export interface TransferArgs {
  'to' : AccountRefOpt,
  'fee' : [] | [bigint],
  'memo' : [] | [Uint8Array | number[]],
  'from_subaccount' : [] | [Subaccount],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export interface _SERVICE extends ICRC1Ledger {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
