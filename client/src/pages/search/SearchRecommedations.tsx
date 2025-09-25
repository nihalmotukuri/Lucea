import { Link } from "react-router-dom"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"

const SearchRecommendations = ({ searchQuery }) => {

    const aiRecommendations = async () => {
        try {
            const systemPrompt = `You are an AI-powered creative search assistant for a visual discovery platform. Your task is to help users discover new ideas by providing a list of conceptually related search suggestions based on their current search query. Generate a list of exactly 6 diverse, related search suggestions. The suggestions should be concise (single word each). Return ONLY a valid JSON object with a single key "suggestions" containing an array of 6 strings.`

            const payload = {
                contents: [{ parts: [{ text: searchQuery }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                },
            }

            const geminiResponse = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            const suggestionsObj = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text)
            const suggestionsList = suggestionsObj.suggestions
            console.log(suggestionsList)
            return suggestionsList
        } catch (err) {
            console.error(err)
            return { data: undefined }
        }
    }

    const { data: suggestions, isPending, isFetched, isLoading } = useQuery({
        queryKey: ['recommendations', searchQuery],
        queryFn: aiRecommendations,
        staleTime: 1000 * 60 * 5
    })

    if (isPending || isLoading) {
        return (
            <ul className="w-full gap-3 flex items-center h-[50px] px-[2]">
                {Array
                    .from({ length: 6 })
                    .map((s, idx) => (
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
            {isFetched && suggestions && suggestions.map((s, idx) => (
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