import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import QueryFeedback from "@/components/features/QueryFeedback"
import MediaLoadingState from "@/components/features/MediaLoadingState"
import MediaDetailModalFrame from "@/components/media/MediaDetailModalFrame"
import MediaDetailView from "@/components/media/MediaDetailView"
import { getPhoto } from "@/api/pexels"
import { useMinimumLoading } from "@/lib/loadingIndicator"

const PhotoDetailModal = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { photoId } = useParams()
    const backgroundLocation = (location.state as { photoBackgroundLocation?: typeof location } | null)?.photoBackgroundLocation
    const close = useCallback(() => {
        if (backgroundLocation) navigate(backgroundLocation, { replace: true })
        else navigate(-1)
    }, [backgroundLocation, navigate])
    const {
        data: photo,
        isPending,
        isFetching,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["photo", photoId],
        queryFn: ({ signal }) => {
            if (!photoId) throw new Error("Photo ID is required")
            return getPhoto(photoId, signal)
        },
        enabled: Boolean(photoId),
    })
    const showLoading = useMinimumLoading(isPending && !photo)

    return (
        <MediaDetailModalFrame label="Photo details" onClose={close}>
            {photo
                ? <MediaDetailView item={{ type: "photo", media: photo }} onBack={close} isModal />
                : <div className="my-auto w-full max-w-xl rounded-3xl bg-[#fdfcfb] p-5 sm:p-8">
                    {showLoading && <MediaLoadingState className="min-h-[40vh] w-full" />}
                    {!photo && isError && !showLoading && <QueryFeedback error isRetrying={isFetching} onRetry={() => void refetch()} />}
                </div>
            }
        </MediaDetailModalFrame>
    )
}

export default PhotoDetailModal
