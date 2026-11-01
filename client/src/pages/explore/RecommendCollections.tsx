import { Link } from "react-router-dom";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useExplore } from "@/store/useExplore";

const RecommendCollections = () => {
    const recommendedCollections = useExplore(state => state.recommendedCollections)

    return (
        <section className="mt-[36px]">
            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 992: 4 }}>
                <Masonry>
                    {recommendedCollections.map((rc) => (
                        <Link
                            key={rc.id}
                            to={`/explore/${rc.id}`}
                            className="relative m-[2px] block overflow-hidden rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        >
                            <img
                                src={`${rc.heroImage}`}
                                alt=""
                                loading="lazy"
                            />

                            <div className="absolute z-1 bottom-5 left-5 right-5">
                                <h1
                                    className="text-white text-3xl mb-2"
                                    style={{
                                        fontFamily: '"PT Serif", serif'
                                    }}
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