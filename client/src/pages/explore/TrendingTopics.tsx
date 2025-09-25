
export const trendingTopics = [
    // Aesthetics & Moods
    'Cinematic',
    'Minimalism',
    'Golden Hour',
    'Neon Noir',
    'Pastel Dreams',
    'Moody & Dramatic',
    'Ethereal',
    'Vintage Film',

    // Art & Technique
    'Light & Shadow',
    'Abstract Forms',
    'Surrealism',
    'Film Grain',
    'Portraiture',
    'High Contrast',
    'Macro Photography',
    'Long Exposure',

    // Subjects & Themes
    'Urban Exploration',
    'Wanderlust',
    'Botanical Details',
    'Street Style',
    'Interior Design',
    'Food & Drink',
    'Wildlife',

    // Colors & Palettes
    'Monochrome',
    'Earth Tones',
    'Vibrant Colors',
]

const TrendingTopics = () => {
    return (
        <section>
            {/* <h1
                className="pt-1 pb-[16px] text-3xl text-neutral-700"
                style={{
                    fontFamily: '"PT Serif", serif'
                }}
            >
                Trending Topics
            </h1> */}

            <div>
                {trendingTopics.map((topic, idx) => (
                    <button
                        key={idx}
                        className="border border-black/20 text-neutral-500 m-2 p-2 rounded-md"
                    >{topic}</button>
                ))}
            </div>
        </section>
    )
}

export default TrendingTopics