import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getDailyTopics } from "@/api/topics"
import { supabase } from "@/lib/supabase"
import { DEFAULT_TOPICS, useTopic } from "@/store/useTopic"

const useDailyTopics = () => {
    const setTopics = useTopic(state => state.setTopics)
    const topics = useTopic(state => state.topics)
    const query = useQuery({
        queryKey: ["dailyTopics"],
        queryFn: getDailyTopics,
        enabled: Boolean(supabase),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 15 * 60 * 1000,
        refetchOnWindowFocus: true,
    })

    useEffect(() => {
        if (query.data) setTopics(query.data)
        else if (query.isError || !supabase) setTopics(DEFAULT_TOPICS)
    }, [query.data, query.isError, setTopics])

    return { ...query, topicsReady: topics.length > 0 }
}

export default useDailyTopics
