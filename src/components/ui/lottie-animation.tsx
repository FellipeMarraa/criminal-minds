import { Lottie } from 'lottie-react';

interface LottieAnimationProps {
    animationData: object;
    size?: number;
    className?: string;
}

// Toca uma vez e para no último frame — todas as animações da pasta
// src/assets/lottie foram desenhadas pra isso (case-stamp, clue-flash,
// vote-check, culprit-flash), nunca em loop.
export default function LottieAnimation({ animationData, size = 140, className }: LottieAnimationProps) {
    return (
        <Lottie
            src={animationData}
            loop={false}
            autoplay
            style={{ width: size, height: size }}
            className={className}
        />
    );
}
