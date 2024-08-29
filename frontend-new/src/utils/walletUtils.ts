import { NotifyResult, Withdraw } from '../types'

/**
 * Gets a user-friendly error message for a notify deposit error.
 *
 * @param error - An object representing the notify deposit error.
 * @returns A string with the corresponding error message.
 */
export const getErrorMessageNotifyDeposits = (error: NotifyResult): string => {
  const errorMessages: { [key: string]: string } = {
    NotAvailable: '',
    CallLedgerError: 'Call Ledger Error',
  }

  for (const key in error) {
    if (error[key] !== undefined && key in errorMessages) {
      return errorMessages[key]
    }
  }
  return 'Something went wrong'
}

/**
 * Gets a user-friendly error message for a withdraw error.
 *
 * @param error - An object representing the withdraw error.
 * @returns A string with the corresponding error message.
 */
export const getErrorMessageWithdraw = (error: Withdraw): string => {
  const errorMessages: { [key: string]: string } = {
    AmountBelowMinimum: 'Amount Below Minimum',
    InsufficientCredit: 'Insufficient Credit',
    CallLedgerError: 'Call Ledger Error',
    BadFee: 'Bad fee',
  }

  for (const key in error) {
    if (error[key] !== undefined && key in errorMessages) {
      return errorMessages[key]
    }
  }
  return 'Something went wrong'
}
