import React, { useState } from "react";
import { SiteSettingsProvider } from "@/config/SiteSettingsContext";
import { EditModeProvider } from "@/admin/EditModeContext";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStorageItem } from "@/utils/storage";
import { SectionsManager } from "@/admin/SectionsManager";
import { MenuEditor } from "@/admin/MenuEditor";
import { HeroImagesPanel } from "@/admin/HeroImagesPanel";
import { ThemeSettingsPanel } from "@/admin/ThemeSettingsPanel";
import { PaymentSettingsPanel } from "@/admin/PaymentSettingsPanel";
import GatewayPage from "@/pages/GatewayPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * EditorPreviewPage
 * 
 * This page renders the full website in "editor preview mode".
 * It's meant to be loaded inside an iframe from /admin/site-editor.
 * 
 * Key differences from normal site:
 * - Uses DRAFT settings instead of PUBLISHED
 * - Edit mode is automatically ON for admins
 * - Editable overlays (hover, click-to-edit) are active
 * - Admin panels (Sections, Menu) are visible
 * 
 * Security: Only accessible to admin users. Non-admins see unauthorized message.
 */
export default function EditorPreviewPage() {
    const { lang } = useLanguage();
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    // Admin check
    const user = getStorageItem<{ role?: string } | null>('user', null);
    const isAdmin = user && (user.role === 'admin' || user.role === 'manager');

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Unauthorized</h1>
                    <p className="text-gray-600">Editor preview is only available to administrators.</p>
                </div>
            </div>
        );
    }

    // Render the site with forced editor mode
    return (
        <SiteSettingsProvider forceEditorMode={true}>
            <EditModeProvider forceEditorPreview={true}>
                <LanguageProvider>
                    <TooltipProvider>
                        {/* Main content */}
                        <GatewayPage />

                        {/* Luxury Admin Sidebar */}
                        <div
                            className={`fixed top-0 left-0 h-full z-[9999] transition-all duration-500 ease-in-out bg-[#0D0D0D] border-r border-[#C8A96A]/20 shadow-2xl flex flex-col ${isPanelOpen ? 'w-80 translate-x-0' : 'w-12 -translate-x-0'}`}
                        >
                            {/* Toggle Button (when closed) */}
                            {!isPanelOpen && (
                                <button
                                    onClick={() => setIsPanelOpen(true)}
                                    className="w-full h-12 flex items-center justify-center text-[#C8A96A] hover:bg-[#C8A96A]/10 transition-colors mt-4"
                                    title="Open Editor"
                                >
                                    <Layers size={20} />
                                </button>
                            )}

                            {isPanelOpen && (
                                <>
                                    {/* Sidebar Header */}
                                    <div className="flex items-center justify-between p-6 border-b border-[#C8A96A]/10">
                                        <div>
                                            <h2 className="text-white font-serif font-medium text-lg tracking-wider">Site Editor</h2>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsPanelOpen(false)}
                                            className="text-muted-foreground hover:text-white hover:bg-white/5 h-8 w-8 p-0 rounded-full"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>

                                    {/* Sidebar Content */}
                                    <div className="flex-1 overflow-hidden flex flex-col">
                                        <Tabs defaultValue="hero" className="flex-1 flex flex-col h-full">
                                            <TabsList className="bg-transparent border-b border-white/5 p-0 h-12 w-full justify-start rounded-none">
                                                <TabsTrigger
                                                    value="hero"
                                                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#C8A96A] data-[state=active]:bg-white/5 data-[state=active]:text-[#C8A96A] text-muted-foreground text-[10px] uppercase tracking-wider font-medium bg-transparent"
                                                >
                                                    {lang === 'ar' ? 'البطل' : 'Hero'}
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="theme"
                                                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#C8A96A] data-[state=active]:bg-white/5 data-[state=active]:text-[#C8A96A] text-muted-foreground text-[10px] uppercase tracking-wider font-medium bg-transparent"
                                                >
                                                    {lang === 'ar' ? 'المظهر' : 'Appearance'}
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="payment"
                                                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#C8A96A] data-[state=active]:bg-white/5 data-[state=active]:text-[#C8A96A] text-muted-foreground text-[10px] uppercase tracking-wider font-medium bg-transparent"
                                                >
                                                    {lang === 'ar' ? 'الدفع' : 'Payment'}
                                                </TabsTrigger>
                                                {/* MENU TAB - HIDDEN (can be restored later) */}
                                                {/* <TabsTrigger
                                                    value="menu"
                                                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#C8A96A] data-[state=active]:bg-white/5 data-[state=active]:text-[#C8A96A] text-muted-foreground text-xs uppercase tracking-wider font-medium bg-transparent"
                                                >
                                                    Menu
                                                </TabsTrigger> */}
                                            </TabsList>

                                            <div className="flex-1 overflow-y-auto p-4 space-y-4 luxury-scrollbar">
                                                <TabsContent value="hero" className="mt-0 focus-visible:outline-none">
                                                    <HeroImagesPanel />
                                                </TabsContent>
                                                <TabsContent value="theme" className="mt-0 focus-visible:outline-none">
                                                    <ThemeSettingsPanel />
                                                </TabsContent>
                                                <TabsContent value="payment" className="mt-0 focus-visible:outline-none">
                                                    <PaymentSettingsPanel />
                                                </TabsContent>
                                                {/* MENU CONTENT - HIDDEN (can be restored later) */}
                                                {/* <TabsContent value="menu" className="mt-0 focus-visible:outline-none">
                                                    <MenuEditor />
                                                </TabsContent> */}
                                            </div>
                                        </Tabs>
                                    </div>
                                </>
                            )}
                        </div>
                    </TooltipProvider>
                </LanguageProvider>
            </EditModeProvider>
        </SiteSettingsProvider>
    );
}
