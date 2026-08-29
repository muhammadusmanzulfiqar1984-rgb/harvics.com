import { Transaction, CurrencyCode, LedgerEntry } from '../types';

export class LedgerService {
  /**
   * Generates double-entry ledger records for any new payment or settlement
   */
  static createDoubleEntry(
    senderAccount: string,
    recipientAccount: string,
    amount: number,
    fee: number = 0,
    memo: string = 'HPay Transaction'
  ): LedgerEntry[] {
    const netRecipient = amount - fee;
    const entries: LedgerEntry[] = [
      {
        accountName: senderAccount,
        debit: amount,
        credit: 0,
        description: `Debit: ${memo}`
      },
      {
        accountName: recipientAccount,
        debit: 0,
        credit: netRecipient,
        description: `Credit Net: ${memo}`
      }
    ];

    if (fee > 0) {
      entries.push({
        accountName: 'HPay Network Revenue Account',
        debit: 0,
        credit: fee,
        description: `Credit Processing Fee: ${memo}`
      });
    }

    return entries;
  }

  /**
   * Helper to construct an immutable transaction record
   */
  static buildTransaction(params: {
    amount: number;
    currency: CurrencyCode;
    merchantOrPerson: string;
    recipientHPayId?: string;
    senderHPayId?: string;
    category: string;
    direction: 'in' | 'out';
    paymentMethod: string;
    fee?: number;
    note?: string;
  }): Transaction {
    const id = `HP-${Math.floor(100000 + Math.random() * 900000)}`;
    const fee = params.fee || 0;
    const settlementAmount = params.amount - fee;
    const reference = `REF-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const senderName = params.senderHPayId || '@mian';
    const recipientName = params.recipientHPayId || params.merchantOrPerson;

    const ledgerEntries = this.createDoubleEntry(
      `Wallet Account (${senderName})`,
      `Settlement Ledger (${recipientName})`,
      params.amount,
      fee,
      `${params.category} - ${params.merchantOrPerson}`
    );

    return {
      id,
      amount: params.amount,
      currency: params.currency,
      status: 'Completed',
      merchantOrPerson: params.merchantOrPerson,
      recipientHPayId: params.recipientHPayId,
      senderHPayId: params.senderHPayId,
      category: params.category,
      direction: params.direction,
      paymentMethod: params.paymentMethod,
      paymentRail: 'Harvics Instant Net Settlement',
      timestamp,
      reference,
      riskStatus: 'Pass (0.01% score)',
      riskScore: 1,
      fee,
      settlementAmount,
      ledgerEntries,
      note: params.note
    };
  }
}
