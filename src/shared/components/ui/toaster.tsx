import { cn } from '@/lib/utils';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/shared/components/ui/toast';
import { useToast } from '@/shared/components/ui/use-toast';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  const getStyles = (variant?: string) => {
    // ✅ Single object with all variants
    const styles: Record<string, string> = {
      default: 'border-green-200 bg-green-50 text-green-900',
      destructive: 'border-red-200 bg-red-50 text-red-900',
      warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
      info: 'border-blue-200 bg-blue-50 text-blue-900',
    };
    return styles[variant || 'default'] || styles.default;
  };

  const getIcon = (variant?: string) => {
    const icons: Record<string, React.ReactNode> = {
      default: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      destructive: <AlertCircle className="h-5 w-5 text-red-600" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      info: <AlertCircle className="h-5 w-5 text-blue-600" />,
    };
    return icons[variant || 'default'] || icons.default;
  };

  return (
    <ToastProvider>
      <div className="fixed top-0 right-0 z-[100] flex max-w-[420px] flex-col gap-2 p-4 pointer-events-none">
        {toasts.map(({ id, title, description, action, open, onOpenChange, variant }) => (
          <Toast
            key={id}
            onOpenChange={onOpenChange}
            open={open}
            className={cn(
              'pointer-events-auto flex w-full gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur animate-in fade-in slide-in-from-top-2 duration-300',
              getStyles(variant as string)
            )}
          >
            {/* Icon */}
            <div className="flex-shrink-0 pt-0.5">{getIcon(variant as string)}</div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-1">
              {title && <ToastTitle className="font-semibold text-sm">{title}</ToastTitle>}
              {description && <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>}
              {action && <div className="mt-1">{action}</div>}
            </div>

            {/* Close Button */}
            <ToastClose className="flex-shrink-0 -mr-1 -mt-1 rounded-md p-1 hover:bg-white/20">
              <X className="h-4 w-4" />
            </ToastClose>
          </Toast>
        ))}
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
