"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface AlertDialogProps {
  open: boolean;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function AlertDialog({
  open,
  message,
  confirmLabel = "확인",
  onConfirm,
}: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onConfirm(); }}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">알림</DialogTitle>
        <DialogDescription className="text-sm text-gray-700">
          {message}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
