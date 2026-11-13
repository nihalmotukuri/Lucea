import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Download } from "lucide-react"
import type { Photo } from "@/types/types.ts"
import SaveToMoodboardButton from "@/components/features/SaveToMoodboardButton"
import { getPhotoDownloadUrl } from "@/api/pexels"

interface ImageItemProps {
  image: Photo;
  openInModal?: boolean;
}

const ImageItem = ({ image, openInModal = true }: ImageItemProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoaded, setIsLoaded] = useState(false)

    const onImage = () => {
        const state = location.state as { photoBackgroundLocation?: typeof location } | null
        navigate(
            `/photos/${image.id}`,
            openInModal
                ? { state: { photoBackgroundLocation: state?.photoBackgroundLocation ?? location } }
                : undefined,
        )
    }

    return (
        <div className="group relative z-0 w-full overflow-hidden rounded-[20px] bg-neutral-100 transition-shadow duration-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] dark:bg-neutral-800 dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:rounded-[24px]">
            <button
                type="button"
                className="relative block w-full cursor-pointer overflow-hidden border-0 p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                aria-label={`View photo by ${image.photographer}${image.alt ? `: ${image.alt}` : ''}`}
                onClick={onImage}
                style={{
                    backgroundColor: image.avg_color,
                    aspectRatio: `${image.width}/${image.height}`,
                }}
            >
                <img
                    className={`block h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)] motion-safe:group-hover:scale-[1.03] ${
                        isLoaded ? "opacity-100 blur-none" : "opacity-0 blur-xs"
                    }`}
                    src={image.src.large}
                    alt={image.alt || `Photo by ${image.photographer}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                />

                {/* Dark gradient scrim on hover */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                />

                {/* Creator attribution pill (bottom-left) */}
                <span
                    className="pointer-events-none absolute bottom-3.5 left-3.5 z-10 flex max-w-[calc(100%-4.5rem)] items-center gap-2 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-1.5 group-hover:translate-y-0 group-hover:opacity-100"
                >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/30 text-[10px] font-semibold text-white backdrop-blur-md">
                        {image.photographer.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate text-xs font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                        {image.photographer}
                    </span>
                </span>
            </button>

            {/* Quick action: Save to moodboard (top-right) */}
            <SaveToMoodboardButton
                media={{
                    key: `photo-${image.id}`,
                    type: "photo",
                    id: image.id,
                    detailPath: `/photos/${image.id}`,
                    thumbnail: image.src.medium,
                    alt: image.alt || `Photo by ${image.photographer}`,
                    creator: image.photographer,
                }}
            />

            {/* Quick action: Download high-res (bottom-right) */}
            <a
                href={getPhotoDownloadUrl(String(image.id))}
                target="_blank"
                rel="noreferrer"
                download
                aria-label={`Download photo by ${image.photographer}`}
                title="Download high-res photo"
                className="media-action absolute bottom-3 right-3 z-20 grid size-8 place-items-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/70 hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={event => event.stopPropagation()}
            >
                <Download size={14} aria-hidden="true" />
            </a>
        </div>
    )
}

export default ImageItem
