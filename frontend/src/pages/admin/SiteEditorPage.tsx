/* eslint-disable */
import React, { useState, useRef } from "react";
import { getStorageItem } from "@/utils/storage";
import { publishDraft, resetDraftToPublished } from "@/config/site-settings.storage";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, RotateCcw, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * SiteEditorPage - Admin Shell with iframe preview
 * 
 * Layout:
 * - Top bar with admin controls (Publish, Reset, Back)
 * - Main area: iframe loading /editor-preview
 * 
 * The iframe shows the live site with edit overlays enabled.
 * Changes are saved to DRAFT settings.
 * Publish button copies draft to published (customer-visible).
 */
export default function SiteEditorPage() {
    const { toast } = useToast();
    const { lang, t } = useLanguage();
    const navigate = useNavigate();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Admin check
    const user = getStorageItem<{ role?: string } | null>('user', null);
    const isAdmin = user && (user.role === 'admin' || user.role === 'manager');

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">
                        {lang === 'ar' ? 'غير مصرح' : 'Unauthorized Access'}
                    </h1>
                    <p className="text-gray-600">
                        {lang === 'ar' ? 'هذه الصفحة للمسؤولين فقط' : 'This page is for administrators only.'}
                    </p>
                    <Button onClick={() => navigate('/')} className="mt-4">
                        {lang === 'ar' ? 'العودة للرئيسية' : 'Go Home'}
                    </Button>
                </div>
            </div>
        );
    }

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            publishDraft();

            toast({
                title: lang === 'ar' ? 'تم النشر!' : 'Published!',
                description: lang === 'ar'
                    ? 'التغييرات الآن مرئية للعملاء'
                    : 'Changes are now visible to customers.',
            });

            // Optionally reload iframe to show fresh state
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.location.reload();
            }
        } catch (error) {
            toast({
                title: lang === 'ar' ? 'خطأ' : 'Error',
                description: lang === 'ar' ? 'فشل النشر' : 'Failed to publish changes.',
                variant: 'destructive',
            });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleReset = async () => {
        if (!confirm(lang === 'ar'
            ? 'هل أنت متأكد؟ سيتم التخلص من جميع التغييرات غير المنشورة.'
            : 'Are you sure? This will discard all unpublished changes.')) {
            return;
        }

        setIsResetting(true);
        try {
            resetDraftToPublished();

            toast({
                title: lang === 'ar' ? 'تم إعادة التعيين' : 'Reset Complete',
                description: lang === 'ar'
                    ? 'تم استعادة المسودة إلى النسخة المنشورة'
                    : 'Draft restored to published version.',
            });

            // Reload iframe to show fresh state
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.location.reload();
            }
        } catch (error) {
            toast({
                title: lang === 'ar' ? 'خطأ' : 'Error',
                description: lang === 'ar' ? 'فشل إعادة التعيين' : 'Failed to reset draft.',
                variant: 'destructive',
            });
        } finally {
            setIsResetting(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            {/* Admin Top Bar */}
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'رجوع' : 'Back'}
                    </Button>

                    <div className="h-6 w-px bg-gray-600" />

                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-gray-300">
                            {lang === 'ar' ? 'وضع المحرر - المسودة' : 'Editor Mode - Draft'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Reset Draft Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={isResetting}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        {isResetting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                        )}
                        {lang === 'ar' ? 'إعادة تعيين' : 'Reset Draft'}
                    </Button>

                    {/* Publish Button */}
                    <Button
                        size="sm"
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isPublishing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        {lang === 'ar' ? 'نشر التغييرات' : 'Publish Changes'}
                    </Button>
                </div>
            </header>

            {/* Iframe Container */}
            <main className="flex-1 overflow-hidden bg-white">
                <iframe
                    ref={iframeRef}
                    src="/editor-preview"
                    className="w-full h-full border-0"
                    title="Site Editor Preview"
                />
            </main>
        </div>
    );
}
