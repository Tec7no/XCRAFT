
import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from '@/lib/utils';
import { ThemeProvider } from 'next-themes';

export default function DottedDemo() {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
                <DottedSurface className="size-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        aria-hidden="true"
                        className={cn(
                            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
                            'bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]',
                            'blur-[30px]',
                        )}
                    />
                    <h1 className="font-mono text-4xl font-semibold z-10">Dotted Surface Demo</h1>
                </div>
            </div>
        </ThemeProvider>
    );
}
