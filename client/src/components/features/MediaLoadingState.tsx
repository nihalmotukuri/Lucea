import { Image, Sparkles } from "lucide-react"

const MediaLoadingState = () => (
    <div role="status" aria-label="Preparing your visual" className="flex flex-col items-center justify-center py-16">
        <div className="relative mb-5 grid size-16 place-items-center">
            <span className="absolute inset-1 animate-ping rounded-[22px] border border-amber-300/70 [animation-duration:2.4s]" />
            <span className="absolute inset-1 rounded-[22px] border border-neutral-200 bg-white shadow-sm" />
            <Image size={24} strokeWidth={1.5} className="relative z-10 text-neutral-500" aria-hidden="true" />
            <Sparkles
                size={14}
                className="absolute -right-0.5 -top-0.5 z-10 animate-pulse fill-amber-200 text-amber-600"
                aria-hidden="true"
            />
        </div>
        <span className="text-sm font-medium text-neutral-600">Developing the frame…</span>
        <span className="sr-only">Please wait while the media loads.</span>
    </div>
)

export default MediaLoadingState
