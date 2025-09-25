import { useNavigate } from "react-router-dom";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useExplore } from "@/store/useExplore";

const RecommendCollections = () => {
    const navigate = useNavigate()
    const recommendedCollections = useExplore(state => state.recommendedCollections)

    return (
        <section className="mt-[36px]">
            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 4 }}>
                <Masonry>
                    {recommendedCollections.map((rc, idx) => (
                        <div
                            key={idx}
                            className="relative rounded-3xl overflow-hidden cursor-pointer m-[2px]"
                            onClick={() => navigate(`/explore/${rc.id}`)}
                        >
                            <img
                                src={`${rc.heroImage}`}
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
                        </div>
                    ))}
                </Masonry>
            </ResponsiveMasonry>
        </section>
    )
}

export default RecommendCollections