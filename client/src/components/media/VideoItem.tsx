import type { Video } from '@/types/types'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import SaveToMoodboardButton from '@/components/features/SaveToMoodboardButton'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'

const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * 15

interface VideoItemProps {
    video: Video
    openInModal?: boolean
}

const VideoItem = ({ video, openInModal = true }: VideoItemProps) => {
    const navigate = useNavigate()
    const location = useLocation()

    const videoRef = useRef<HTMLVideoElement>(null)
    const progressRef = useRef<SVGCircleElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPreviewActive, setIsPreviewActive] = useState(false)
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
        if (event.pointerType === 'mouse' && previewFile && !prefersReducedMotion) {
            setIsPreviewActive(true)
        }
    }

    return (
        <div className="group relative z-0 w-full">
            <button
                type="button"
                className='relative block w-full cursor-pointer overflow-hidden rounded-3xl border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800'
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
                    className='absolute inset-0 h-full w-full object-cover'
                    src={video.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                />
                <svg
                    viewBox="0 0 36 36"
                    className="pointer-events-none absolute left-3 top-3 z-[1] size-9 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
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
                    <Play x="11.5" y="11.5" size="13" fill="white" stroke="white" strokeWidth="1.5" />
                </svg>
                <video
                    className='fade-in'
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