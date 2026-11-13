import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import QueryFeedback from "@/components/features/QueryFeedback"
import MediaDetailModalSkeleton from "@/components/media/MediaDetailModalSkeleton"
import MediaDetailView from "@/components/media/MediaDetailView"
import { getPhoto } from "@/api/pexels"
import MediaDetailPageHeader from "./MediaDetailPageHeader"

const PhotoDetailPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { photoId } = useParams()
    const goBack = useCallback(() => {
        if (location.key === "default") navigate("/")
        else navigate(-1)
    }, [location.key, navigate])
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

    return (
        <div className="min-h-full bg-[#fdfcfb] pt-[140px] dark:bg-[#121110]">
            <MediaDetailPageHeader />
            {!photo && isPending && <MediaDetailModalSkeleton isModal={false} mediaType="photo" />}
            {!photo && isError && <div className="mx-auto max-w-3xl px-5 py-10"><QueryFeedback error isRetrying={isFetching} onRetry={() => void refetch()} /></div>}
            {photo && <MediaDetailView item={{ type: "photo", media: photo }} onBack={goBack} />}
        </div>
    )
}

export default PhotoDetailPage
