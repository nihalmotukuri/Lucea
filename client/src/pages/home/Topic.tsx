import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { Images, LayoutGrid, Video } from 'lucide-react'
import { useTopic } from '@/store/useTopic'
import ImageItem from '@/components/media/ImageItem'
import VideoItem from '@/components/media/VideoItem'
import OddSkeletonCard from '@/components/layout/OddSkeletonCard'
import EvenSkeletonCard from '@/components/layout/EvenSkeletonCard'
import QueryFeedback from '@/components/features/QueryFeedback'
import { searchPhotos, searchVideos } from '@/api/pexels'
import { MASONRY_COLUMNS, MASONRY_GUTTER } from '@/lib/masonry'

interface TopicProps {
    topicSlug: string | undefined
}

type TopicMediaFilter = 'all' | 'photos' | 'videos'

const mediaFilters = [
    { value: 'all', label: 'Everything', Icon: LayoutGrid },
    { value: 'photos', label: 'Photos', Icon: Images },
    { value: 'videos', label: 'Videos', Icon: Video },
] as const

interface TopicResultsHeaderProps {
    title: string
    mediaFilter: TopicMediaFilter
    onFilterChange: (filter: TopicMediaFilter) => void
}

const TopicResultsHeader = ({ title, mediaFilter, onFilterChange }: TopicResultsHeaderProps) => (
    <header className="mb-6 border-b border-black/[0.08] pb-5 dark:border-white/[0.08]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 animate-subtle-reveal">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-400">
                    Today’s visual field <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">/</span> Curated search
                </p>
                <h1
                    className="font-editorial break-words text-[28px] sm:text-[38px] font-normal leading-tight text-neutral-900 dark:text-white tracking-[-0.015em]"
                >
                    {title}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-300 font-normal">
                    A fresh trail of photos and motion, chosen for today.
                </p>
            </div>

            <div role="group" aria-label="Filter topic results by media type" className="flex items-center gap-1 rounded-full border border-black/[0.08] bg-white/80 p-1 dark:border-white/[0.08] dark:bg-[#1a1917]/80">
                {mediaFilters.map(({ value, label, Icon }) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={mediaFilter === value}
                        onClick={() => onFilterChange(value)}
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${
                            mediaFilter === value
                                ? 'bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-900'
                                : 'text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
                        }`}
                    >
                        <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                        {label}
                    </button>
                ))}
            </div>
        </div>
    </header>
)

export const Topic = ({ topicSlug }: TopicProps) => {
    const topics = useTopic(state => state.topics)
    const topicTitle = topics.find(topic => topic.slug === topicSlug)?.title ?? topicSlug ?? 'Today’s topic'
    const [mediaFilter, setMediaFilter] = useState<TopicMediaFilter>('all')

    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['topic', topicSlug, topicTitle],
        queryFn: async ({ pageParam, signal }) => {
            const [photos, videos] = await Promise.all([
                searchPhotos(topicTitle, pageParam, 8, signal),
                searchVideos(topicTitle, pageParam, 6, signal),
            ])
            return {
                data: [...photos.data, ...videos.data],
                nextPage: photos.nextPage ?? videos.nextPage,
            }
        },
        getNextPageParam: lastPage => lastPage.nextPage,
        initialPageParam: 1,
    })

    const allMedia = data?.pages.flatMap(page => page.data) ?? []
    const mediaList = mediaFilter === 'all'
        ? allMedia
        : allMedia.filter(media => mediaFilter === 'photos' ? 'src' in media : 'video_files' in media)

    return (
        <section aria-label={`Visual results for ${topicTitle}`}>
            <TopicResultsHeader
                title={topicTitle}
                mediaFilter={mediaFilter}
                onFilterChange={setMediaFilter}
            />

            {isPending && !isError ? (
                <ResponsiveMasonry columnsCountBreakPoints={MASONRY_COLUMNS}>
                    <Masonry gutter={MASONRY_GUTTER} sequential>
                        {Array.from({ length: 10 }, (_, index) => index % 2 === 0
                            ? <EvenSkeletonCard key={index} />
                            : <OddSkeletonCard key={index} />
                        )}
                    </Masonry>
                </ResponsiveMasonry>
            ) : mediaList.length === 0 ? (
                <QueryFeedback error={error} empty={!isError} isRetrying={isFetching} onRetry={() => void refetch()} />
            ) : (
                <>
                    <InfiniteScroll
                        dataLength={mediaList.length}
                        next={fetchNextPage}
                        hasMore={Boolean(data?.pages.at(-1)?.nextPage)}
                        loader={<div role="status" className="py-4 text-center text-xs text-neutral-500">Gathering more visuals…</div>}
                    >
                        <ResponsiveMasonry columnsCountBreakPoints={MASONRY_COLUMNS}>
                            <Masonry gutter={MASONRY_GUTTER} sequential>
                                {mediaList.map(media => {
                                    if ('src' in media) {
                                        if (!media.src?.large) return null
                                        return <ImageItem image={media} key={media.id} />
                                    }

                                    if (!('video_files' in media)) return null
                                    return <VideoItem video={media} key={media.id} />
                                })}
                                {isFetchingNextPage && Array.from({ length: 12 }, (_, index) => index % 2 === 0
                                    ? <EvenSkeletonCard key={`loading-${index}`} />
                                    : <OddSkeletonCard key={`loading-${index}`} />
                                )}
                            </Masonry>
                        </ResponsiveMasonry>
                    </InfiniteScroll>
                    {isError && <QueryFeedback error={error} isRetrying={isFetching} onRetry={() => void refetch()} />}
                </>
            )}
        </section>
    )
}
