    import { useLocation, useNavigate } from "react-router-dom"
    // import { useMedia } from "@/store/useMedia"

    const ImageItem = ({ image }) => {
        const navigate = useNavigate()
        const location = useLocation()

        // const setRelatedMediaText = useMedia(state => state.setRelatedMediaText)

        const onImage = () => {
            // setRelatedMediaText(image.alt)
            navigate(`/photos/${image.id}`, {
                state: { photoBackgroundLocation: location }
            })
        }

        return (
            <div
                key={image.id}
                className='m-[4px] rounded-2xl overflow-hidden w-full'
                style={{
                    backgroundColor: image.avg_color,
                    aspectRatio: `${image.width}/${image.height}`,
                }}
                onClick={onImage}
            >
                <img
                    className='cursor-pointer fade-in'
                    src={image.src.large}
                    loading='lazy'
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "8px",
                    }}
                />
            </div>
        )
    }

    export default ImageItem