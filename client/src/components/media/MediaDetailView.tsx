import { useEffect, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from "react-infinite-scroll-component"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { ArrowLeft, ArrowUpRight, Check, Copy, ExternalLink, Share2, X } from "lucide-react"
import { getPhotoDownloadUrl, searchPhotos, searchVideos } from "@/api/pexels"
import QueryFeedback from "@/components/features/QueryFeedback"
import SaveToMoodboardButton from "@/components/features/SaveToMoodboardButton"
import EvenSkeletonCard from "@/components/layout/EvenSkeletonCard"
import OddSkeletonCard from "@/components/layout/OddSkeletonCard"
import ImageItem from "@/components/media/ImageItem"
import VideoItem from "@/components/media/VideoItem"
import type { Photo, Video } from "@/types/types"
import { MASONRY_COLUMNS, MASONRY_GUTTER, VIDEO_MASONRY_COLUMNS } from "@/lib/masonry"

type DetailMedia =
    | { type: "photo"; media: Photo }
    | { type: "video"; media: Video }

interface MediaDetailViewProps {
    item: DetailMedia
    onBack: () => void
    isModal?: boolean
    onClose?: () => void
}

const getPhotoFallbackQuery = (photo: Photo) => {
    const description = photo.alt?.split(/[.!?]/, 1)[0]?.trim()
    return (description || photo.photographer).slice(0, 80)
}

const getVideoFallbackQuery = (video: Video) => {
    const path = new URL(video.url).pathname
    const slug = path
        .split("/")
        .filter(Boolean)
        .filter(part => part !== "video" && !/^\d+$/.test(part))
        .at(-1)
        ?.replace(/-\d+$/, "")
        .replace(/[-_]+/g, " ")
        .trim()

    return (slug || video.user.name).slice(0, 80)
}

const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${String(seconds).padStart(2, "0")}`
}

const secondaryActionClassName = "group inline-flex min-h-11 items-center gap-2 rounded-full border border-black/[0.1] px-4 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 hover:shadow-sm active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"

const MediaDetailView = ({ item, onBack, isModal = false, onClose = onBack }: MediaDetailViewProps) => {
    const [shareMessage, setShareMessage] = useState("")
    const [mediaError, setMediaError] = useState(false)
    const isPhoto = item.type === "photo"
    const photo = isPhoto ? item.media : undefined
    const video = !isPhoto ? item.media : undefined
    const fallbackQuery = item.type === "photo"
        ? getPhotoFallbackQuery(item.media)
        : getVideoFallbackQuery(item.media)

    useEffect(() => {
        setMediaError(false)
        setShareMessage("")
    }, [item.type, item.media.id])

    const searchQuery = fallbackQuery
    const {
        data: relatedPhotos,
        fetchNextPage: fetchNextPhotoPage,
        isFetchingNextPage: isFetchingNextPhotoPage,
        isFetching: isFetchingRelatedPhotos,
        isPending: isRelatedPhotosPending,
        isError: isRelatedPhotosError,
        refetch: refetchRelatedPhotos,
    } = useInfiniteQuery({
        queryKey: ["relatedMedia", "photo", item.media.id, searchQuery],
        queryFn: ({ pageParam, signal }) => searchPhotos(searchQuery, pageParam, 12, signal),
        getNextPageParam: lastPage => lastPage.nextPage,
        initialPageParam: 1,
        enabled: item.type === "photo" && Boolean(searchQuery),
        retry: 1,
    })

    const {
        data: relatedVideos,
        fetchNextPage: fetchNextVideoPage,
        isFetchingNextPage: isFetchingNextVideoPage,
        isFetching: isFetchingRelatedVideos,
        isPending: isRelatedVideosPending,
        isError: isRelatedVideosError,
        refetch: refetchRelatedVideos,
    } = useInfiniteQuery({
        queryKey: ["relatedMedia", "video", item.media.id, searchQuery],
        queryFn: ({ pageParam, signal }) => searchVideos(searchQuery, pageParam, 12, signal),
        getNextPageParam: lastPage => lastPage.nextPage,
        initialPageParam: 1,
        enabled: item.type === "video" && Boolean(searchQuery),
        retry: 1,
    })

    const relatedItems = (photo
        ? relatedPhotos?.pages.flatMap(page => page.data) ?? []
        : relatedVideos?.pages.flatMap(page => page.data) ?? [])
        .filter(media => media.id !== item.media.id)
    const relatedIsPending = isPhoto ? isRelatedPhotosPending : isRelatedVideosPending
    const relatedIsError = isPhoto ? isRelatedPhotosError : isRelatedVideosError
    const relatedIsFetching = isPhoto ? isFetchingRelatedPhotos : isFetchingRelatedVideos
    const fetchingNextPage = isPhoto ? isFetchingNextPhotoPage : isFetchingNextVideoPage
    const hasMore = photo
        ? Boolean(relatedPhotos?.pages.at(-1)?.nextPage)
        : Boolean(relatedVideos?.pages.at(-1)?.nextPage)

    const shareMedia = async () => {
        setShareMessage("")
        try {
            if (navigator.share) {
                await navigator.share({
                    title: photo?.alt || `Video by ${video?.user.name}`,
                    url: window.location.href,
                })
                return
            }

            await navigator.clipboard.writeText(window.location.href)
            setShareMessage("Link copied")
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return
            setShareMessage("Could not share this link. Please try again.")
        }
    }

    const creator = photo?.photographer ?? video?.user.name ?? ""
    const creatorUrl = photo?.photographer_url ?? video?.user.url ?? ""
    const detailUrl = photo?.url ?? video?.url ?? ""
    const heading = photo?.alt
        || (photo
            ? `A photo by ${photo.photographer}`
            : video
                ? `A ${formatDuration(video.duration)} video by ${video.user.name}`
                : "A visual to revisit")

    return (
        <article
            id={isModal ? "mediaDetailScrollable" : undefined}
            aria-labelledby="media-detail-title"
            className={`mx-auto w-full bg-[#fdfcfb] ${
                isModal
                    ? "max-w-[1200px] overflow-y-auto rounded-[26px] shadow-[0_32px_100px_rgba(27,24,20,0.2)] sm:max-h-[94dvh] sm:rounded-[34px]"
                    : "min-h-full max-w-[1440px]"
            }`}
        >
            <div className="px-4 pb-8 pt-4 sm:px-7 sm:pb-10 sm:pt-6 lg:px-10 lg:pb-12">
                {isModal && (
                    <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-5 flex items-center justify-between border-b border-black/[0.06] bg-[#fdfcfb]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:-mt-6 sm:px-7 lg:-mx-10 lg:-mt-6 lg:px-10">
                        <button
                            type="button"
                            autoFocus
                            onClick={onBack}
                            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-neutral-600 transition hover:bg-black/[0.045] hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        >
                            <ArrowLeft size={17} aria-hidden="true" />
                            Back to your trail
                        </button>
                        <button
                            type="button"
                            aria-label="Close media details"
                            onClick={onClose}
                            className="grid size-10 place-items-center rounded-full text-neutral-500 transition hover:bg-black/[0.05] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        >
                            <X size={18} strokeWidth={1.8} aria-hidden="true" />
                        </button>
                    </div>
                )}

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)] lg:gap-6">
                    <div className="relative grid min-w-0 place-items-center">
                        {photo && !mediaError && (
                            <img
                                src={photo.src.large2x || photo.src.large || photo.src.original}
                                alt={photo.alt || `Photo by ${photo.photographer}`}
                                loading="eager"
                                decoding="async"
                                fetchPriority="high"
                                onError={() => setMediaError(true)}
                                className="block h-auto w-auto max-h-[78dvh] max-w-full rounded-[18px] object-contain"
                            />
                        )}
                        {video && !mediaError && (
                            <video
                                key={video.id}
                                src={video.video_files.find(file => file.quality === "hd" || file.quality === "uhd")?.link || video.video_files[0]?.link}
                                poster={video.image}
                                width={video.width}
                                height={video.height}
                                controls
                                playsInline
                                preload="metadata"
                                onError={() => setMediaError(true)}
                                onLoadedData={() => setMediaError(false)}
                                aria-label={`Video by ${video.user.name}`}
                                className="block h-auto w-auto max-h-[78dvh] max-w-full rounded-[18px] object-contain"
                            />
                        )}
                        {mediaError && (
                            <div role="alert" className="max-w-sm rounded-2xl bg-white/90 p-6 text-center shadow-lg">
                                <h2 className="font-semibold text-neutral-900">This visual could not load</h2>
                                <p className="mt-1 text-sm leading-6 text-neutral-600">The original is still available from its creator.</p>
                                <a href={detailUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700">
                                    Open source <ArrowUpRight size={15} aria-hidden="true" />
                                </a>
                            </div>
                        )}
                    </div>

                    <aside className="flex flex-col gap-4">
                        <header>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                                {isPhoto ? "Photographer" : "Video creator"}
                            </p>
                            <h2 className="mt-1 text-lg font-medium text-neutral-900">
                                {creatorUrl
                                    ? <a href={creatorUrl} target="_blank" rel="noreferrer" className="underline decoration-black/20 underline-offset-4 hover:decoration-black">{creator}</a>
                                    : creator
                                }
                            </h2>
                        </header>

                        <div className="flex flex-wrap items-center gap-2 border-y border-black/[0.08] py-4">
                            <SaveToMoodboardButton
                                variant="inline"
                                media={{
                                    key: `${item.type}-${item.media.id}`,
                                    type: item.type,
                                    id: item.media.id,
                                    detailPath: `/${item.type === "photo" ? "photos" : "videos"}/${item.media.id}`,
                                    thumbnail: photo?.src.medium ?? video?.image ?? "",
                                    alt: heading,
                                    creator,
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => void shareMedia()}
                                className={secondaryActionClassName}
                            >
                                {shareMessage === "Link copied"
                                    ? <Check size={16} aria-hidden="true" />
                                    : typeof navigator.share === "function"
                                        ? <Share2 size={16} aria-hidden="true" />
                                        : <Copy size={16} aria-hidden="true" />
                                }
                                {typeof navigator.share === "function" ? "Share" : "Copy link"}
                            </button>
                            {photo && (
                                <a
                                    href={getPhotoDownloadUrl(String(photo.id))}
                                    className={secondaryActionClassName}
                                >
                                    <ArrowUpRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    Download
                                </a>
                            )}
                            <a
                                href={detailUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={secondaryActionClassName}
                            >
                                View on Pexels <ExternalLink size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        </div>
                        {shareMessage && (
                            <p role="status" className={`-mt-3 text-xs ${shareMessage.startsWith("Could") ? "text-red-700" : "text-neutral-500"}`}>
                                {shareMessage}
                            </p>
                        )}

                        <dl className="grid grid-cols-2 gap-4">
                            {photo && (
                                <div>
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Dimensions</dt>
                                    <dd className="mt-1 text-sm text-neutral-700">{photo.width} × {photo.height}</dd>
                                </div>
                            )}
                            {video && (
                                <>
                                    <div>
                                        <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Duration</dt>
                                        <dd className="mt-1 text-sm text-neutral-700">{formatDuration(video.duration)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Dimensions</dt>
                                        <dd className="mt-1 text-sm text-neutral-700">{video.width} × {video.height}</dd>
                                    </div>
                                </>
                            )}
                        </dl>

                        <section className="border-t border-black/[0.08] pt-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Description</p>
                            <h1
                                id="media-detail-title"
                                className="font-editorial mt-2 text-xl leading-snug tracking-[-0.025em] text-neutral-900 sm:text-2xl"
                            >
                                {heading}
                            </h1>
                        </section>
                    </aside>
                </div>

                <section className="mt-10 border-t border-black/[0.08] pt-7 sm:mt-12 sm:pt-9">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Keep exploring</p>
                            <h2 className="font-editorial mt-1 text-2xl tracking-[-0.025em] text-neutral-900 sm:text-3xl">
                                More {isPhoto ? "photos" : "videos"} for this mood
                            </h2>
                        </div>
                        <p className="max-w-sm text-xs leading-5 text-neutral-500">
                            A trail inspired by {searchQuery}.
                        </p>
                    </div>

                    {relatedIsPending && (
                        <div role="status" aria-label="Loading related media">
                            <ResponsiveMasonry columnsCountBreakPoints={isPhoto ? MASONRY_COLUMNS : VIDEO_MASONRY_COLUMNS}>
                                <Masonry gutter={MASONRY_GUTTER} sequential>
                                    {Array.from({ length: 8 }, (_, index) => index % 2 === 0
                                        ? <EvenSkeletonCard key={index} />
                                        : <OddSkeletonCard key={index} />
                                    )}
                                </Masonry>
                            </ResponsiveMasonry>
                        </div>
                    )}

                    {relatedIsError && (
                        <QueryFeedback
                            error
                            isRetrying={relatedIsFetching}
                            onRetry={() => void (isPhoto ? refetchRelatedPhotos() : refetchRelatedVideos())}
                        />
                    )}

                    {!relatedIsPending && !relatedIsError && relatedItems.length === 0 && (
                        <QueryFeedback empty />
                    )}

                    {relatedItems.length > 0 && (
                        <InfiniteScroll
                            dataLength={relatedItems.length}
                            hasMore={hasMore}
                            next={() => void (isPhoto ? fetchNextPhotoPage() : fetchNextVideoPage())}
                            loader={<div role="status" className="py-4 text-center text-xs text-neutral-500">Gathering more visuals…</div>}
                            scrollableTarget={isModal ? "mediaDetailScrollable" : undefined}
                        >
                            <ResponsiveMasonry columnsCountBreakPoints={isPhoto ? MASONRY_COLUMNS : VIDEO_MASONRY_COLUMNS}>
                                <Masonry gutter={MASONRY_GUTTER} sequential>
                                    {isPhoto
                                        ? relatedItems.map(media => {
                                            if (!("src" in media) || !media.src.large) return null
                                            return <ImageItem key={media.id} image={media} openInModal={isModal} />
                                        })
                                        : relatedItems.map(media => {
                                            if (!("video_files" in media) || !media.video_files.length) return null
                                            return <VideoItem key={media.id} video={media} openInModal={isModal} />
                                        })
                                    }
                                    {fetchingNextPage && Array.from({ length: 8 }, (_, index) => index % 2 === 0
                                        ? <EvenSkeletonCard key={`next-${index}`} />
                                        : <OddSkeletonCard key={`next-${index}`} />
                                    )}
                                </Masonry>
                            </ResponsiveMasonry>
                        </InfiniteScroll>
                    )}
                </section>
            </div>
        </article>
    )
}

export default MediaDetailView
