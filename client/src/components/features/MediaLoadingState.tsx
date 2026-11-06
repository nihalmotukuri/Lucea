import LoadingIndicator from "@/components/features/LoadingIndicator"

interface MediaLoadingStateProps {
    className?: string
}

const MediaLoadingState = ({ className = "min-h-[calc(100vh-140px)] w-full" }: MediaLoadingStateProps) => (
    <LoadingIndicator label="Developing the frame…" className={className} />
)

export default MediaLoadingState
