import type { Video } from '@/types/types'
import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SaveToMoodboardButton from '@/components/features/SaveToMoodboardButton'

interface VideoItemProps {
    video: Video
}

const VideoItem = ({ video }: VideoItemProps) => {
    const navigate = useNavigate()
    const location = useLocation()

    const videoRef = useRef<HTMLVideoElement>(null)

    const onVideo = () => {
        navigate(`/videos/${video.id}`, {
            state: { videoBackgroundLocation: location }
        })
    }

    return (
        <div className="group relative m-[4px]">
            <button
                type="button"
                className='block w-full cursor-pointer overflow-hidden rounded-3xl border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800'
                aria-label={`View video by ${video.user.name}`}
                onClick={onVideo}
                onMouseEnter={() => videoRef.current?.play()}
                onMouseLeave={() => videoRef.current?.pause()}
                style={{
                    backgroundColor: "#f1ece7a3",
                    aspectRatio: `${video.width}/${video.height}`
                }}
            >
                <video
                    className='fade-in'
                    src={
                        video.video_files.find((vf) => (
                            vf.quality === 'hd' || vf.quality === 'uhd')
                        )?.link || video.video_files[0].link
                    }
                    ref={videoRef}
                    aria-hidden="true"
                    tabIndex={-1}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={video.image}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "8px",
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