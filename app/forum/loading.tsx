"use client"
import LottieAnimation from "@/components/LottieAnimation";
import businessAnimation from "../../public/lottie-business.json";

export default function ForumLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-xs">
        <LottieAnimation animationData={businessAnimation} height={200} />
      </div>
      <p className="mt-4 text-muted-foreground text-lg">Loading...</p>
    </div>
  );
}
