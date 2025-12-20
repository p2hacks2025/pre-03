"use client";

import Image from "next/image";

interface WorldViewerProps {
  imageUrl: string | null;
}

/**
 * 週間ワールド画像を表示するコンポーネント
 * 浮遊アニメーションと影のスケールアニメーション付き
 */
export const WorldViewer = ({ imageUrl }: WorldViewerProps) => {
  return (
    <div className="relative flex h-[270px] items-center justify-center">
      {/* 影 */}
      <div className="absolute bottom-4 animate-shadow">
        <div className="h-4 w-32 rounded-full bg-black/30 blur-md" />
      </div>

      {/* ワールド画像 */}
      <div className="animate-float">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="週間ワールド"
            width={250}
            height={250}
            className="h-[250px] w-[250px] object-contain"
            unoptimized
          />
        ) : (
          <Image
            src="/images/world-placeholder.png"
            alt="プレースホルダー"
            width={250}
            height={250}
            className="h-[250px] w-[250px] object-contain"
            unoptimized
          />
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(10px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes shadow {
          0%, 100% {
            transform: scaleX(1);
            opacity: 0.3;
          }
          50% {
            transform: scaleX(0.8);
            opacity: 0.2;
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-shadow {
          animation: shadow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
