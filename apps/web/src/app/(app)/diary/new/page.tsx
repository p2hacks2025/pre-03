"use client";

import { CloseOutline } from "react-ionicons";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

import { DiaryForm } from "@/features/diary";

export default function DiaryNewPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="h-full overflow-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between border-gray-800 border-b bg-[#1C1C1E]/95 px-6 py-4 backdrop-blur">
        <h1 className="font-bold text-white text-xl">日記を書く</h1>
        <Button isIconOnly variant="light" onPress={handleClose}>
          <CloseOutline color="#9CA3AF" width="24px" height="24px" />
        </Button>
      </header>

      <div className="mx-auto max-w-2xl p-6">
        <DiaryForm onSuccess={handleSuccess} onCancel={handleClose} />
      </div>
    </div>
  );
}
