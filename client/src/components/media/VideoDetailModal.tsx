import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import QueryFeedback from "@/components/features/QueryFeedback"
import MediaDetailModalFrame from "@/components/media/MediaDetailModalFrame"
import MediaDetailModalSkeleton from "@/components/media/MediaDetailModalSkeleton"
import MediaDetailView from "@/components/media/MediaDetailView"
import { getVideo } from "@/api/pexels"
import { useMinimumLoading } from "@/lib/loadingIndicator"

const VideoDetailModal = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { videoId } = useParams()
    const backgroundLocation = (location.state as { videoBackgroundLocation?: typeof location } | null)?.videoBackgroundLocation
    const close = useCallback(() => {
        if (backgroundLocation) navigate(backgroundLocation, { replace: true })
        else navigate(-1)
    }, [backgroundLocation, navigate])
    const goBack = useCallback(() => navigate(-1), [navigate])
    const {
        data: video,
        isPending,
        isFetching,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["video", videoId],
        queryFn: ({ signal }) => {
            if (!videoId) throw new Error("Video ID is required")
            return getVideo(videoId, signal)
        },
        enabled: Boolean(videoId),
    })
    const showLoading = useMinimumLoading(isPending && !video)

    return (
        <MediaDetailModalFrame label="Video details" onClose={close}>
            {video ? (
                <MediaDetailView item={{ type: "video", media: video }} onBack={goBack} onClose={close} isModal />
            ) : showLoading ? (
                <MediaDetailModalSkeleton onBack={goBack} onClose={close} mediaType="video" />
            ) : isError ? (
                <div className="my-auto w-full max-w-xl rounded-3xl bg-[#fdfcfb] p-5 sm:p-8 dark:bg-[#1a1917] dark:text-neutral-100">
                    <QueryFeedback error isRetrying={isFetching} onRetry={() => void refetch()} />
                </div>
            ) : null}
        </MediaDetailModalFrame>
    )
}

export default VideoDetailModal
