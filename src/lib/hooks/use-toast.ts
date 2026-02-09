import { toast } from "sonner";

export type ToastOptions = Parameters<typeof toast>[1];

export function useToast() {
    return {
        toast,
    };
}

export { toast };
