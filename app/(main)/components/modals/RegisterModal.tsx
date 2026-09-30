"use client";

import { X } from "lucide-react";

import { useModalStore } from "@/app/stores/modal.store";
import CandidateSignupForm from "@/app/auth/sign-up/candidate/CandidateSignupForm";

export default function RegisterModal() {
  const { isOpen, type, closeModal } = useModalStore();

  if (!isOpen || type !== "register") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[min(92vh,760px)] w-full max-w-140 overflow-y-auto rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="border-b-2 border-[#00b14f] pb-1 font-semibold text-[#00b14f]">
            Đăng ký
          </h2>
          <button type="button" onClick={closeModal} aria-label="Đóng">
            <X className="text-gray-400 hover:text-black" />
          </button>
        </div>
        <div className="p-6">
          <CandidateSignupForm embedded />
        </div>
      </div>
    </div>
  );
}
