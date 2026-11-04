import { useEffect, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from "react-infinite-scroll-component"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { ArrowLeft, ArrowUpRight, Check, Copy, ExternalLink, Share2, X } from "lucide-react"
import { Link } from "react-router-dom"
import { searchPhotos, searchVideos } from "@/api/pexels"
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

const MediaDetailView = ({ item, onBack, isModal = false }: MediaDetailViewProps) => {
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
                setShareMessage("Link shared")
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
    const heading = photo?.alt || (video ? "A moving image" : "A moment to keep")
    const mediaLabel = isPhoto ? "Photography" : "Moving image"

    return (
        <article
            id={isModal ? "mediaDetailScrollable" : undefined}
            aria-labelledby="media-detail-title"
            className={`mx-auto w-full max-w-[1440px] bg-[#fdfcfb] ${
                isModal
                    ? "overflow-y-auto rounded-[26px] shadow-[0_32px_100px_rgba(27,24,20,0.2)] sm:max-h-[94dvh] sm:rounded-[34px]"
                    : "min-h-full"
            }`}
        >
            <div className="px-4 pb-8 pt-4 sm:px-7 sm:pb-10 sm:pt-6 lg:px-10 lg:pb-12">
                {isModal && (
                    <div className="mb-5 flex items-center justify-between pb-1">
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
                            onClick={onBack}
                            className="grid size-10 place-items-center rounded-full text-neutral-500 transition hover:bg-black/[0.05] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        >
                            <X size={18} strokeWidth={1.8} aria-hidden="true" />
                        </button>
                    </div>
                )}

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)] lg:gap-6">
                    <div className="relative grid min-h-[300px] place-items-center overflow-hidden rounded-[26px] border border-black/[0.06] bg-[#e8e4de] p-3 sm:min-h-[420px] sm:p-5 lg:min-h-[560px]">
                        {photo && !mediaError && (
                            <img
                                src={photo.src.large2x || photo.src.large || photo.src.original}
                                alt={photo.alt || `Photo by ${photo.photographer}`}
                                loading="eager"
                                decoding="async"
                                fetchPriority="high"
                                onError={() => setMediaError(true)}
                                className="max-h-[72dvh] max-w-full rounded-[18px] object-contain shadow-[0_18px_48px_rgba(0,0,0,0.14)]"
                                style={{
                                    backgroundColor: photo.avg_color,
                                    aspectRatio: `${photo.width}/${photo.height}`,
                                }}
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
                                className="max-h-[72dvh] max-w-full rounded-[18px] bg-black object-contain shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
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
                        <header className="pb-1 pt-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                {mediaLabel} <span className="mx-1.5 text-neutral-300">/</span> A visual to revisit
                            </p>
                            <h1
                                id="media-detail-title"
                                className="font-editorial mt-2 text-2xl leading-tight tracking-[-0.035em] text-neutral-900 sm:text-3xl xl:text-4xl"
                            >
                                {heading}
                            </h1>
                            <p className="mt-2 text-sm text-neutral-500">
                                Collected by{" "}
                                {creatorUrl
                                    ? <a href={creatorUrl} target="_blank" rel="noreferrer" className="font-medium text-neutral-800 underline decoration-black/20 underline-offset-4 hover:decoration-black">{creator}</a>
                                    : <span className="font-medium text-neutral-800">{creator}</span>
                                }
                            </p>
                        </header>

                        <section className="rounded-[24px] border border-black/[0.07] bg-white p-5 sm:p-6">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Keep this idea</p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
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
                                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/[0.1] bg-[#fdfcfb] px-4 text-sm font-medium text-neutral-700 transition hover:border-black/20 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                >
                                    {shareMessage === "Link copied"
                                        ? <Check size={16} aria-hidden="true" />
                                        : typeof navigator.share === "function"
                                            ? <Share2 size={16} aria-hidden="true" />
                                            : <Copy size={16} aria-hidden="true" />
                                    }
                                    {typeof navigator.share === "function" ? "Share" : "Copy link"}
                                </button>
                            </div>
                            {shareMessage && (
                                <p role="status" className={`mt-3 text-xs ${shareMessage.startsWith("Could") ? "text-red-700" : "text-neutral-500"}`}>
                                    {shareMessage}
                                </p>
                            )}
                        </section>

                        <section className="rounded-[24px] border border-black/[0.07] bg-white p-5 sm:p-6">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">About this visual</p>
                            <p className="mt-3 text-sm leading-6 text-neutral-700">
                                {photo?.alt || (video ? `A ${formatDuration(video.duration)} video shared by ${video.user.name}.` : "A visual collected for your next idea.")}
                            </p>
                            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-black/[0.06] pt-4">
                                <div>
                                    <dt className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">Format</dt>
                                    <dd className="mt-1 text-xs font-medium text-neutral-700">{isPhoto ? "Photograph" : "Video"}</dd>
                                </div>
                                <div>
                                    <dt className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">{video ? "Duration" : "Dimensions"}</dt>
                                    <dd className="mt-1 text-xs font-medium text-neutral-700">
                                        {photo ? `${photo.width} × ${photo.height}` : video ? formatDuration(video.duration) : ""}
                                    </dd>
                                </div>
                            </dl>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {photo && (
                                    <a
                                        href={photo.src.original}
                                        download={`lucea-photo-${photo.id}.jpg`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-10 items-center gap-2 rounded-full bg-neutral-900 px-4 text-xs font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                    >
                                        Open original image <ArrowUpRight size={14} aria-hidden="true" />
                                    </a>
                                )}
                                <a
                                    href={detailUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/[0.1] px-4 text-xs font-medium text-neutral-700 transition hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                >
                                    View on Pexels <ExternalLink size={14} aria-hidden="true" />
                                </a>
                            </div>
                        </section>

                        {video && (
                            <Link
                                to={`/search?query=${encodeURIComponent(video.user.name)}&type=videos`}
                                className="group flex min-h-14 items-center justify-between rounded-[20px] border border-black/[0.07] bg-[#f3efe9] px-5 text-sm font-medium text-neutral-700 transition hover:bg-[#ece6dc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                            >
                                More from {video.user.name}
                                <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                            </Link>
                        )}
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
