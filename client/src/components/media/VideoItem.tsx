import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const VideoItem = ({ video }) => {
    const navigate = useNavigate()
    const location = useLocation()

    const videoRef = useRef<HTMLVideoElement>(null)

    const onVideo = () => {
        navigate(`/videos/${video.id}`, {
            state: { videoBackgroundLocation: location }
        })
    }

    return (
        <div
            className='m-[4px] rounded-3xl overflow-hidden w-full'
            style={{
                backgroundColor: "#f1ece7a3",
                aspectRatio: `${video.width}/${video.height}`
            }}
        >
            <video
                className='cursor-pointer fade-in'
                src={
                    video.video_files.find((vf) => (
                        vf.quality === 'hd' || vf.quality === 'uhd')
                    )?.link || video.video_files[0].link
                }
                ref={videoRef}
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
                onClick={onVideo}
                onMouseEnter={() => {
                    videoRef.current?.play()
                }}
                onMouseLeave={() => {
                    videoRef.current?.pause()
                }}
            />
        </div>
    )
}

export default VideoItem