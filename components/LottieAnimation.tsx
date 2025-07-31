import Lottie from "lottie-react";
import type { CSSProperties } from "react";

interface LottieAnimationProps {
  animationData: object;
  height?: number | string;
  width?: number | string;
  style?: CSSProperties;
  loop?: boolean;
  autoplay?: boolean;
}

export default function LottieAnimation({
  animationData,
  height = 300,
  width = "100%",
  style = {},
  loop = true,
  autoplay = true,
}: LottieAnimationProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={{ width, height, ...style }}
    />
  );
} 