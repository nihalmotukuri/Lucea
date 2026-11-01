import type { Video } from '@/types/types'
import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

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
        <button
            type="button"
            className='m-[4px] block w-[calc(100%-8px)] cursor-pointer overflow-hidden rounded-3xl border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800'
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
    )
}

export default VideoItem