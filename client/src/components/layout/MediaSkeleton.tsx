import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import EvenSkeletonCard from "./EvenSkeletonCard"
import OddSkeletonCard from "./OddSkeletonCard"

const MediaSkeleton = () => {
  return (
    <ResponsiveMasonry columnsCountBreakPoints={{ 992: 5 }}>
      <Masonry>
        {Array.from({ length: 10 }).map((_, i) => {
          if (i % 2 == 0) return <EvenSkeletonCard key={i} />
          return <OddSkeletonCard key={i} />
        })}
      </Masonry>
    </ResponsiveMasonry>
  )
}

export default MediaSkeleton