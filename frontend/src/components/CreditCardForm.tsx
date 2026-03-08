
import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { CardDetails } from '@/services/payment';

interface CreditCardFormProps {
    onChange: (details: CardDetails, isValid: boolean) => void;
    disabled?: boolean;
}

export default function CreditCardForm({ onChange, disabled }: CreditCardFormProps) {
    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [focus, setFocus] = useState<'number' | 'name' | 'expiry' | 'cvc'>('number');

    // Formatters
    const formatNumber = (val: string) => {
        const v = val.replace(/\D/g, '').substring(0, 16);
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        return parts.join(' ');
    };

    const formatExpiry = (val: string) => {
        const v = val.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 2) return `${v.substring(0, 2)}/${v.substring(2)}`;
        return v;
    };

    // Validators
    const isValidLuhn = (val: string) => {
        const clean = val.replace(/\D/g, '');
        if (clean.length < 13) return false;
        let sum = 0;
        let shouldDouble = false;
        for (let i = clean.length - 1; i >= 0; i--) {
            let digit = parseInt(clean.charAt(i));
            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    };

    const isValidExpiry = (val: string) => {
        if (!val.includes('/')) return false;
        const [month, year] = val.split('/');
        if (!month || !year || month.length !== 2 || year.length !== 2) return false;
        const m = parseInt(month);
        const y = parseInt('20' + year);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (m < 1 || m > 12) return false;
        if (y < currentYear) return false;
        if (y === currentYear && m < currentMonth) return false;
        return true;
    };

    useEffect(() => {
        const isValid =
            isValidLuhn(number) &&
            name.trim().length > 3 &&
            isValidExpiry(expiry) &&
            cvc.length >= 3;

        onChange({
            number: number.replace(/\s/g, ''),
            name,
            expiry,
            cvc
        }, isValid);
    }, [number, name, expiry, cvc]);

    return (
        <div className="bg-card w-full max-w-md mx-auto p-6 rounded-xl border border-border mt-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Secure Payment</span>
                <div className="flex gap-2">
                    <div className="h-6 w-10 bg-muted rounded border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground opacity-50">VISA</div>
                    <div className="h-6 w-10 bg-muted rounded border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground opacity-50">MC</div>
                </div>
            </div>

            {/* Visual Card Representation */}
            <div className={`
                relative h-48 w-full rounded-xl mb-8 p-6 text-white shadow-xl transition-all duration-500 overflow-hidden group
                ${focus === 'cvc' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-primary to-primary/80'}
            `}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                {focus === 'cvc' ? (
                    // Back of card
                    <div className="relative z-10 h-full flex flex-col justify-center">
                        <div className="w-full h-10 bg-black/30 absolute top-4 left-[-24px] right-[-24px]" style={{ width: 'calc(100% + 48px)' }}></div>
                        <div className="mt-8 flex justify-end items-center gap-3">
                            <span className="text-[10px] font-bold uppercase">Security Code</span>
                            <div className="bg-white text-black h-8 w-12 flex items-center justify-center font-mono font-bold rounded">
                                {cvc || 'CVC'}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Front of card
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-8 bg-yellow-400/80 rounded-md"></div>
                            <CreditCard className="opacity-50" />
                        </div>
                        <div className="font-mono text-xl tracking-widest shadow-black drop-shadow-md">
                            {number || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[8px] uppercase opacity-70 mb-1">Card Holder</p>
                                <p className="font-bold tracking-wider text-sm truncate max-w-[200px]">{name || 'YOUR NAME'}</p>
                            </div>
                            <div>
                                <p className="text-[8px] uppercase opacity-70 mb-1">Expires</p>
                                <p className="font-bold tracking-wider text-sm">{expiry || 'MM/YY'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Inputs */}
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Card Number</label>
                    <div className="relative">
                        <input
                            type="tel"
                            value={number}
                            onChange={e => setNumber(formatNumber(e.target.value))}
                            onFocus={() => setFocus('number')}
                            maxLength={19}
                            placeholder="0000 0000 0000 0000"
                            disabled={disabled}
                            className={`w-full bg-background border p-3 rounded text-sm font-mono outline-none focus:border-secondary transition-colors pl-10 ${number && !isValidLuhn(number) ? 'border-destructive' : 'border-border'}`}
                        />
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Card Holder Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value.toUpperCase())}
                        onFocus={() => setFocus('name')}
                        placeholder="JOHN DOE"
                        disabled={disabled}
                        className="w-full bg-background border border-border p-3 rounded text-sm outline-none focus:border-secondary transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Expiry Date</label>
                        <input
                            type="tel"
                            value={expiry}
                            onChange={e => setExpiry(formatExpiry(e.target.value))}
                            onFocus={() => setFocus('expiry')}
                            maxLength={5}
                            placeholder="MM/YY"
                            disabled={disabled}
                            className={`w-full bg-background border p-3 rounded text-sm outline-none focus:border-secondary transition-colors ${expiry && !isValidExpiry(expiry) ? 'border-destructive' : 'border-border'}`}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">CVC / CVV</label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={cvc}
                                onChange={e => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                onFocus={() => setFocus('cvc')}
                                maxLength={4}
                                placeholder="123"
                                disabled={disabled}
                                className="w-full bg-background border border-border p-3 rounded text-sm outline-none focus:border-secondary transition-colors pl-10"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 p-2 rounded">
                <AlertCircle size={12} />
                <span>Your payment details are encrypted and secure.</span>
            </div>
        </div>
    );
}
