import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GoogleGenerativeAI } from "@google/generative-ai"
import HorizontalScroller from "@/components/features/HorizontalScroller"

interface SearchRecommendationsProps {
    urlQuery: string
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const SearchRecommendations = ({ urlQuery }: SearchRecommendationsProps) => {

    const aiRecommendations = async () => {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: { responseMimeType: "application/json", temperature: 0.7, },
            systemInstruction: `You are an AI-powered creative search assistant for a visual discovery platform. Your task is to help users discover new ideas by providing a list of conceptually related search suggestions based on their current search query. Generate a list of exactly 6 diverse, related search suggestions. The suggestions should be concise (single word each). Return ONLY a valid JSON object with a single key "suggestions" containing an array of 6 strings.`
        })

        const result = await model.generateContent([
            { text: `Search query: "${urlQuery}". Generate 6 diverse keywords related to this.` }
        ])

        const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text
        if (typeof text !== "string") {
            throw new Error("The recommendation response did not contain suggestions")
        }

        const response: unknown = JSON.parse(text)
        if (
            typeof response !== "object"
            || response === null
            || !("suggestions" in response)
            || !Array.isArray(response.suggestions)
            || response.suggestions.length !== 6
            || !response.suggestions.every(
                (suggestion): suggestion is string => typeof suggestion === "string" && suggestion.trim().length > 0,
            )
        ) {
            throw new Error("The recommendation response contained invalid suggestions")
        }
        return response.suggestions
    }

    const {
        data: suggestions,
        isPending,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['recommendations', urlQuery],
        queryFn: aiRecommendations,
        staleTime: 1000 * 60 * 5
    })

    if (isPending) {
        return (
            <ul className="w-full gap-3 flex items-center h-[50px] px-[2]">
                {Array
                    .from({ length: 6 })
                    .map((_, idx) => (
                        <li
                            key={idx}
                            className='bg-black/6 h-[32px] w-[60px] rounded-md animate-pulse'
                        ></li>
                    ))}
            </ul>
        )
    }

    if (isError) {
        return (
            <div role="alert" className="flex h-[50px] items-center gap-2 text-sm text-neutral-500">
                <span>Suggestions unavailable.</span>
                <button
                    type="button"
                    onClick={() => void refetch()}
                    className="cursor-pointer underline underline-offset-2 hover:text-neutral-900"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <HorizontalScroller label="related search suggestions">
            <ul aria-label="Related search suggestions" className="flex h-[50px] w-full gap-4 whitespace-nowrap sm:gap-6">
                {suggestions?.map((s, idx) => (
                    <li key={`${s}-${idx}`} className="shrink-0">
                        <Link
                            to={`/search?query=${encodeURIComponent(s)}&type=photos`}
                            className='block pt-4 pb-3 text-sm text-neutral-500 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700'
                        >
                            {s}
                        </Link>
                    </li>
                ))}
            </ul>
        </HorizontalScroller>
    )
}

export default SearchRecommendations