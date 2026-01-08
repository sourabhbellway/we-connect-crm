
import React, { useState, useRef, MouseEvent } from 'react';

interface ImageMagnifierProps {
    src: string;
    width?: string;
    height?: string;
    zoomLevel?: number;
    alt?: string;
    className?: string;
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
    src,
    width = '100%',
    height = 'auto',
    zoomLevel = 2.5,
    alt = '',
    className = '',
}) => {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [magnifierData, setMagnifierData] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });

    const imgRef = useRef<HTMLImageElement>(null);

    const handleMouseEnter = () => {
        setShowMagnifier(true);
    };

    const handleMouseLeave = () => {
        setShowMagnifier(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const elem = imgRef.current;
        if (!elem) return;

        const { top, left, width, height } = elem.getBoundingClientRect();

        // calculate cursor position on the image
        const x = e.pageX - left - window.pageXOffset;
        const y = e.pageY - top - window.pageYOffset;

        setMagnifierData({
            x,
            y,
            width,
            height,
        });
    };

    // We want the zoom window to appear to the right of the image
    // But for simple "side zoom", we typically see a separate box.
    // The user asked for "side me zoom" (zoom on the side).
    // Let's implement a portal-like or adjacent div approach?
    // Or just a standard absolute positioned detail window.

    // Actually, standard e-commerce style is: hover over standard image -> show zoomed portion in a separate box next to it.

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <img
                ref={imgRef}
                src={src}
                style={{ width, height }}
                alt={alt}
                className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover cursor-crosshair"
            />

            {showMagnifier && (
                <div
                    style={{
                        display: 'block',
                        position: 'absolute',
                        pointerEvents: 'none',
                        // Position the zoomed window to the right of the image container
                        left: '105%',
                        top: '0',
                        zIndex: 100, // Make sure it's on top
                        height: '400px', // Fixed large height for the zoom window
                        width: '400px',  // Fixed large width for the zoom window
                        opacity: '1',
                        border: '1px solid lightgray',
                        backgroundColor: 'white',
                        backgroundImage: `url('${src}')`,
                        backgroundRepeat: 'no-repeat',
                        // Calculate background size based on zoom level
                        backgroundSize: `${magnifierData.width * zoomLevel}px ${magnifierData.height * zoomLevel}px`,
                        // Calculate background position
                        backgroundPositionX: `${-magnifierData.x * zoomLevel + 400 / 2}px`,
                        backgroundPositionY: `${-magnifierData.y * zoomLevel + 400 / 2}px`,
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                    className="bg-white dark:bg-gray-800"
                />
            )}
        </div>
    );
};

export default ImageMagnifier;
