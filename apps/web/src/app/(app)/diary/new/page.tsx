"use client";

import { useCallback, useEffect } from "react";
import { CloseOutline } from "react-ionicons";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

import { usePageHeader } from "@/contexts/page-header-context";
import { DiaryForm } from "@/features/diary";

export default function DiaryNewPage() {
  const router = useRouter();
  const { setHeader } = usePageHeader();

  const handleSuccess = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    setHeader({
      title: "日記を書く",
      rightContent: (
        <Button isIconOnly variant="light" onPress={handleClose}>
          <CloseOutline color="#9CA3AF" width="24px" height="24px" />
        </Button>
      ),
    });
  }, [setHeader, handleClose]);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-2xl p-6">
        <DiaryForm onSuccess={handleSuccess} onCancel={handleClose} />
      </div>
    </div>
  );
}
