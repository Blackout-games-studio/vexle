import { useState, useCallback, useEffect, type RefObject } from 'react';

export const useSliderControls = (containerRef: RefObject<HTMLDivElement | null>) => {
    const [sliderPos, setSliderPos] = useState<number>(50);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(percentage);
    }, [containerRef]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        handleMove(e.clientX);
    }, [handleMove]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches[0]) handleMove(e.touches[0].clientX);
    }, [handleMove]);

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMove]);

    return {
        sliderPos,
        setSliderPos,
        handleMouseDown,
        handleTouchMove,
    };
};