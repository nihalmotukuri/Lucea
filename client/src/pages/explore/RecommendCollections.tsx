import { Link } from "react-router-dom";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useExplore } from "@/store/useExplore";
import { MASONRY_COLUMNS, MASONRY_GUTTER } from "@/lib/masonry";

const RecommendCollections = () => {
    const recommendedCollections = useExplore(state => state.recommendedCollections)

    return (
        <section className="mt-[36px]">
            <ResponsiveMasonry columnsCountBreakPoints={MASONRY_COLUMNS}>
                <Masonry gutter={MASONRY_GUTTER}>
                    {recommendedCollections.map((rc) => (
                        <Link
                            key={rc.id}
                            to={`/explore/${rc.id}`}
                            className="relative block aspect-[4/3] w-full overflow-hidden rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        >
                            <img
                                src={rc.heroImage}
                                alt=""
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            <div className="absolute z-1 bottom-5 left-5 right-5">
                                <h1
                                    className="font-editorial mb-2 text-2xl text-white sm:text-3xl"
                                >
                                    {rc.title}
                                </h1>

                                <p
                                    className="text-white leading-[20px]"
                                >
                                    {rc.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </Masonry>
            </ResponsiveMasonry>
        </section>
    )
}

export default RecommendCollections