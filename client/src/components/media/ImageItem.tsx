import { useLocation, useNavigate } from "react-router-dom"
import type { Photo } from "@/types/types.ts";
import SaveToMoodboardButton from "@/components/features/SaveToMoodboardButton"

interface ImageItemProps {
  image: Photo;
}

const ImageItem = ({ image }: ImageItemProps) => {
    const navigate = useNavigate()
    const location = useLocation()

    const onImage = () => {
        navigate(`/photos/${image.id}`, {
            state: { photoBackgroundLocation: location }
        })
    }

    return (
        <div className="relative m-[4px]">
            <button
                type="button"
                className='block w-full cursor-pointer overflow-hidden rounded-2xl border-0 p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800'
                aria-label={`View photo by ${image.photographer}${image.alt ? `: ${image.alt}` : ''}`}
                onClick={onImage}
                style={{
                    backgroundColor: image.avg_color,
                    aspectRatio: `${image.width}/${image.height}`,
                }}
            >
                <img
                    className='fade-in'
                    src={image.src.large}
                    alt={image.alt || `Photo by ${image.photographer}`}
                    loading='lazy'
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "8px",
                    }}
                />
            </button>
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
        </div>
    )
}

export default ImageItem
