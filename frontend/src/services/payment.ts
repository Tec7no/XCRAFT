
export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export interface CardDetails {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
}

const SLEEP_MS = 2000;

export const processPayment = async (amount: number, card: CardDetails): Promise<PaymentResult> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate basic validation
            const cleanNum = card.number.replace(/\s/g, '');

            // Magic logic for testing:
            // - Ends with 0000 -> Fail (Insufficient Funds)
            // - Ends with 1111 -> Fail (Fraud)
            // - Any other -> Success

            if (cleanNum.endsWith('0000')) {
                resolve({
                    success: false,
                    error: 'Insufficient funds. Please try another card.'
                });
                return;
            }

            if (cleanNum.endsWith('1111')) {
                resolve({
                    success: false,
                    error: 'Transaction declined by bank (Fraud Suspected).'
                });
                return;
            }

            // Success case
            resolve({
                success: true,
                transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            });

        }, SLEEP_MS);
    });
};
