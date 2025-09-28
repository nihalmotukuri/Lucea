import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface SearchRecommendationsProps {
    urlQuery: string
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const SearchRecommendations = ({ urlQuery }: SearchRecommendationsProps) => {

    const aiRecommendations = async () => {
        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: { responseMimeType: "application/json", temperature: 0.7, },
                systemInstruction: `You are an AI-powered creative search assistant for a visual discovery platform. Your task is to help users discover new ideas by providing a list of conceptually related search suggestions based on their current search query. Generate a list of exactly 6 diverse, related search suggestions. The suggestions should be concise (single word each). Return ONLY a valid JSON object with a single key "suggestions" containing an array of 6 strings.`
            })

            const result = await model.generateContent([
                { text: 'Generate 6 diverse keywords related to this search query' }
            ])

            const candidates = result?.response?.candidates
            const text = candidates && candidates[0]?.content?.parts?.[0]?.text
            if (typeof text === "string") {
                const suggestionsObj = JSON.parse(text)
                const suggestionsList = suggestionsObj.suggestions
                return suggestionsList
            }
            return []
        } catch (err) {
            console.error(err)
            return { data: undefined }
        }
    }

    const { data: suggestions, isPending, isFetched, isLoading } = useQuery({
        queryKey: ['recommendations', urlQuery],
        queryFn: aiRecommendations,
        staleTime: 1000 * 60 * 5
    })

    if (isPending || isLoading) {
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

    return (
        <ul className="w-full h-[50px] flex gap-6 flex">
            {isFetched && suggestions && suggestions.map((s: string, idx: number) => (
                <Link
                    key={idx}
                    to={`/search?query=${s}`}
                    className='pt-4 pb-3 text-sm cursor-pointer text-neutral-500 hover:text-neutral-900'
                >
                    {s}
                </Link>
            ))}
        </ul>
    )
}

export default SearchRecommendations