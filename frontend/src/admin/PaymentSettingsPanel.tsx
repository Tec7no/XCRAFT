import React, { useState } from 'react';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, Save } from 'lucide-react';

export function PaymentSettingsPanel() {
    const { settings, updateSettings } = useSiteSettings();
    const { lang } = useLanguage();
    const { toast } = useToast();

    const [paymentPhone, setPaymentPhone] = useState(
        settings.contactInfo?.paymentPhone || '01xxxxxxxxx'
    );

    const handleSave = () => {
        updateSettings(prev => ({
            ...prev,
            contactInfo: {
                ...prev.contactInfo!,
                paymentPhone: paymentPhone.trim()
            }
        }));

        toast({
            title: lang === 'ar' ? 'تم الحفظ' : 'Saved',
            description: lang === 'ar'
                ? 'تم تحديث رقم الدفع بنجاح'
                : 'Payment phone number updated successfully',
        });
    };

    return (
        <Card className="border-[#D8D2C8] bg-[#0D0D0D] text-white">
            <CardHeader className="border-b border-[#C8A96A]/20 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#C8A96A]" />
                    {lang === 'ar' ? 'إعدادات الدفع' : 'Payment Settings'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {lang === 'ar' ? 'رقم الدفع (إنستاباي/فودافون كاش)' : 'Payment Phone (Instapay/VodafoneCash)'}
                    </label>
                    <Input
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="01xxxxxxxxx"
                        className="font-mono bg-white/5 border-[#C8A96A]/30 text-white placeholder:text-muted-foreground focus:border-[#C8A96A]"
                        dir="ltr"
                    />
                    <p className="text-[10px] text-muted-foreground">
                        {lang === 'ar'
                            ? 'سيظهر هذا الرقم في صفحة الدفع للتحويلات البنكية'
                            : 'This number will be displayed in the checkout page for bank transfers'}
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    className="w-full bg-[#C8A96A] hover:bg-[#C8A96A]/80 text-[#0D0D0D] font-bold uppercase tracking-wider"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {lang === 'ar' ? 'حفظ' : 'Save'}
                </Button>
            </CardContent>
        </Card>
    );
}
