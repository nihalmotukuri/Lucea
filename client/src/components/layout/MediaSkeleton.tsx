import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import EvenSkeletonCard from "./EvenSkeletonCard"
import OddSkeletonCard from "./OddSkeletonCard"
import { MASONRY_COLUMNS, MASONRY_GUTTER } from "@/lib/masonry"

const MediaSkeleton = () => {
  return (
    <ResponsiveMasonry columnsCountBreakPoints={MASONRY_COLUMNS}>
      <Masonry gutter={MASONRY_GUTTER} sequential>
        {Array.from({ length: 10 }).map((_, i) => {
          if (i % 2 == 0) return <EvenSkeletonCard key={i} />
          return <OddSkeletonCard key={i} />
        })}
      </Masonry>
    </ResponsiveMasonry>
  )
}

export default MediaSkeleton