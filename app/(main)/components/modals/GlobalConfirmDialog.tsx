"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmDialogStore } from "@/app/stores/confirm-dialog.store";

export default function GlobalConfirmDialog() {
  const isOpen = useConfirmDialogStore((s) => s.isOpen);
  const options = useConfirmDialogStore((s) => s.options);
  const finish = useConfirmDialogStore((s) => s.finish);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) finish(false);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden border-0 bg-white p-0 shadow-xl ring-2 ring-[#00b14f]/20 sm:max-w-md dark:bg-zinc-900 dark:ring-emerald-400/25"
      >
        {options ? (
          <>
            <div className="h-1 w-full shrink-0 bg-[#00b14f]" aria-hidden />
            <DialogHeader className="border-b border-[#00b14f]/15 bg-[#00b14f]/[0.07] px-5 py-4 text-left dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <DialogTitle className="border-l-[3px] border-[#00b14f] pl-3 text-base font-semibold text-slate-900 dark:text-zinc-50">
                {options.title}
              </DialogTitle>
              <DialogDescription className="mt-2 pl-3.5 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                {options.description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-row justify-end gap-2 border-t border-[#00b14f]/10 bg-[#00b14f]/4 px-5 py-4 dark:border-white/10 dark:bg-zinc-950/40">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer border-[#00b14f]/25 bg-white text-slate-700 hover:border-[#00b14f]/45 hover:bg-[#00b14f]/8 hover:text-slate-900 dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={() => finish(false)}
              >
                {options.cancelLabel ?? "Hủy"}
              </Button>
              <Button
                type="button"
                variant="default"
                className={
                  options.variant === "destructive"
                    ? "bg-red-600 font-semibold text-white shadow-sm hover:bg-red-700 cursor-pointer"
                    : "bg-[#00b14f] font-semibold text-white shadow-sm hover:bg-[#009944] cursor-pointer"
                }
                onClick={() => finish(true)}
              >
                {options.confirmLabel ?? "Xác nhận"}
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
