import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import QueryFeedback from "@/components/features/QueryFeedback"
import MediaLoadingState from "@/components/features/MediaLoadingState"
import MediaDetailModalFrame from "@/components/media/MediaDetailModalFrame"
import MediaDetailView from "@/components/media/MediaDetailView"
import { getVideo } from "@/api/pexels"

const VideoDetailModal = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { videoId } = useParams()
    const backgroundLocation = (location.state as { videoBackgroundLocation?: typeof location } | null)?.videoBackgroundLocation
    const close = useCallback(() => {
        if (backgroundLocation) navigate(backgroundLocation, { replace: true })
        else navigate(-1)
    }, [backgroundLocation, navigate])
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

    return (
        <MediaDetailModalFrame label="Video details" onClose={close}>
            {video
                ? <MediaDetailView item={{ type: "video", media: video }} onBack={close} isModal />
                : <div className="my-auto w-full max-w-xl rounded-3xl bg-[#fdfcfb] p-5 sm:p-8">
                    {isPending && <MediaLoadingState />}
                    {!video && isError && <QueryFeedback error isRetrying={isFetching} onRetry={() => void refetch()} />}
                </div>
            }
        </MediaDetailModalFrame>
    )
}

export default VideoDetailModal
