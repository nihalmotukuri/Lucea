import type { Video } from '@/types/types'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import SaveToMoodboardButton from '@/components/features/SaveToMoodboardButton'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'

const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * 15
const AUTOPLAY_PREF_KEY = "lucea.videoAutoplay"

const isAutoplayEnabled = () => {
    try {
        const stored = localStorage.getItem(AUTOPLAY_PREF_KEY)
        return stored !== null ? JSON.parse(stored) : true
    } catch {
        return true
    }
}

interface VideoItemProps {
    video: Video
    openInModal?: boolean
}

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
}

const VideoItem = ({ video, openInModal = true }: VideoItemProps) => {
    const navigate = useNavigate()
    const location = useLocation()

    const videoRef = useRef<HTMLVideoElement>(null)
    const progressRef = useRef<SVGCircleElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPreviewActive, setIsPreviewActive] = useState(false)
    const [isPosterLoaded, setIsPosterLoaded] = useState(false)
    const prefersReducedMotion = usePrefersReducedMotion()
    const previewFile = video.video_files.find((file) => file.quality === 'sd')
        ?? video.video_files.find((file) => file.quality === 'hd')
        ?? video.video_files.find((file) => file.quality === 'uhd')

    useEffect(() => {
        if (!isPreviewActive || prefersReducedMotion) return

        const videoElement = videoRef.current
        if (!videoElement) return

        void videoElement.play().catch(() => setIsPlaying(false))
        return () => {
            videoElement.pause()
            videoElement.removeAttribute('src')
            videoElement.load()
        }
    }, [isPreviewActive, prefersReducedMotion])

    useEffect(() => {
        if (prefersReducedMotion) setIsPreviewActive(false)
    }, [prefersReducedMotion])

    useEffect(() => {
        if (!isPlaying) return

        let frameId = 0
        const updateProgress = () => {
            const videoElement = videoRef.current
            const duration = videoElement?.duration
            if (videoElement && duration && Number.isFinite(duration)) {
                const progress = Math.min(videoElement.currentTime / duration, 1)
                progressRef.current?.setAttribute(
                    'stroke-dashoffset',
                    String(PROGRESS_CIRCUMFERENCE * progress),
                )
            }
            frameId = window.requestAnimationFrame(updateProgress)
        }

        frameId = window.requestAnimationFrame(updateProgress)
        return () => window.cancelAnimationFrame(frameId)
    }, [isPlaying])

    const onVideo = () => {
        videoRef.current?.pause()
        videoRef.current?.blur()
        setIsPreviewActive(false)
        const state = location.state as { videoBackgroundLocation?: typeof location } | null
        navigate(
            `/videos/${video.id}`,
            openInModal
                ? { state: { videoBackgroundLocation: state?.videoBackgroundLocation ?? location } }
                : undefined,
        )
    }

    const onPointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
        if (event.pointerType === 'mouse' && previewFile && !prefersReducedMotion && isAutoplayEnabled()) {
            setIsPreviewActive(true)
        }
    }

    return (
        <div className="group relative z-0 w-full overflow-hidden rounded-[16px] bg-neutral-100 transition-shadow duration-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] dark:bg-neutral-800 dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:rounded-[20px]">
            <button
                type="button"
                className="relative block w-full cursor-pointer overflow-hidden border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                aria-label={`View video by ${video.user.name}`}
                onClick={onVideo}
                onPointerEnter={onPointerEnter}
                onPointerLeave={() => setIsPreviewActive(false)}
                style={{
                    backgroundColor: "#f1ece7a3",
                    aspectRatio: `${video.width}/${video.height}`,
                }}
            >
                <img
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)] motion-safe:group-hover:scale-[1.03] ${
                        isPosterLoaded ? "opacity-100 blur-none" : "opacity-0 blur-xs"
                    }`}
                    src={video.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsPosterLoaded(true)}
                />

                {/* Dark gradient scrim on hover */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                />

                {/* Play/Progress circle on top-left */}
                <svg
                    viewBox="0 0 36 36"
                    className="pointer-events-none absolute left-2 top-2 z-[2] size-8 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] sm:left-3 sm:top-3 sm:size-9"
                    aria-hidden="true"
                >
                    <circle
                        ref={progressRef}
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={PROGRESS_CIRCUMFERENCE}
                        strokeDashoffset="0"
                        transform="rotate(-90 18 18)"
                    />
                    <Play x="11.5" y="11.5" size="12" fill="white" stroke="white" strokeWidth="1.5" />
                </svg>

                {/* Video Duration Pill (bottom-right) */}
                <span className="pointer-events-none absolute bottom-2 right-2 z-10 flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md transition-opacity duration-200 sm:bottom-3 sm:right-3 sm:gap-1 sm:px-2 sm:text-[11px]">
                    <Play size={9} fill="currentColor" aria-hidden="true" />
                    {formatDuration(video.duration)}
                </span>

                {/* Creator Attribution (bottom-left) */}
                <span
                    className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex max-w-[calc(100%-6rem)] items-center gap-1.5 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-1.5 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-3.5 sm:left-3.5 sm:gap-2"
                >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/30 text-[9px] font-semibold text-white backdrop-blur-md sm:size-6 sm:text-[10px]">
                        {video.user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate text-[11px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] sm:text-xs">
                        {video.user.name}
                    </span>
                </span>

                <video
                    className="fade-in"
                    src={isPreviewActive ? previewFile?.link : undefined}
                    ref={videoRef}
                    aria-hidden="true"
                    tabIndex={-1}
                    muted
                    loop
                    playsInline
                    preload="none"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
            </button>
            <SaveToMoodboardButton
                media={{
                    key: `video-${video.id}`,
                    type: "video",
                    id: video.id,
                    detailPath: `/videos/${video.id}`,
                    thumbnail: video.image,
                    alt: `Video by ${video.user.name}`,
                    creator: video.user.name,
                }}
            />
        </div>
    )
}

export default VideoItem