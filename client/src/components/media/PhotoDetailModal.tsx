import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { X } from "lucide-react"
import QueryFeedback from "@/components/features/QueryFeedback"
import MediaDetailModalFrame from "@/components/media/MediaDetailModalFrame"
import MediaDetailModalSkeleton from "@/components/media/MediaDetailModalSkeleton"
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
    const goBack = useCallback(() => navigate(-1), [navigate])
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
            {photo ? (
                <MediaDetailView item={{ type: "photo", media: photo }} onBack={goBack} onClose={close} isModal />
            ) : showLoading ? (
                <MediaDetailModalSkeleton onBack={goBack} onClose={close} mediaType="photo" />
            ) : isError ? (
                <div className="relative my-auto w-full max-w-xl rounded-3xl bg-[#fdfcfb] p-5 sm:p-8 dark:bg-[#1a1917] dark:text-neutral-100">
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={close}
                        className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-neutral-400 transition hover:bg-black/5 hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                    <QueryFeedback
                        error
                        isRetrying={isFetching}
                        onRetry={() => void refetch()}
                        onDismiss={close}
                        dismissLabel="Remove"
                    />
                </div>
            ) : null}
        </MediaDetailModalFrame>
    )
}

export default PhotoDetailModal
