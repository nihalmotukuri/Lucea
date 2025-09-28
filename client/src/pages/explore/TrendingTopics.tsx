const trendingTopics = [
    'Cinematic',
    'Minimalism',
    'Golden Hour',
    'Neon Noir',
    'Pastel Dreams',
    'Moody & Dramatic',
    'Ethereal',
    'Vintage Film',
    'Light & Shadow',
    'Abstract Forms',
    'Surrealism',
    'Film Grain',
    'Portraiture',
    'High Contrast',
    'Macro Photography',
    'Long Exposure',
    'Urban Exploration',
    'Wanderlust',
    'Botanical Details',
    'Street Style',
    'Interior Design',
    'Food & Drink',
    'Wildlife',
    'Monochrome',
    'Earth Tones',
    'Vibrant Colors',
]

const TrendingTopics = () => {
    return (
        <section>
            <div>
                {trendingTopics.map((topic, idx) => (
                    <button
                        key={idx}
                        className="border border-black/20 text-neutral-500 m-2 p-2 rounded-md"
                    >
                        {topic}
                    </button>
                ))}
            </div>
        </section>
    )
}

export default TrendingTopics
