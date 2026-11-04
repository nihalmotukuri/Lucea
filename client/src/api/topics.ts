import type { Topic } from "@/store/useTopic"
import { supabase } from "@/lib/supabase"

interface DailyTopicsRow {
    topics: unknown
    updated_at: string
}

export const getDailyTopics = async (): Promise<Topic[]> => {
    if (!supabase) throw new Error("Supabase is not configured for daily topics.")

    const { data, error } = await supabase
        .from("daily_topics")
        .select("topics, updated_at")
        .eq("id", true)
        .maybeSingle<DailyTopicsRow>()

    if (error) throw error
    if (!data || !Array.isArray(data.topics)) {
        throw new Error("The daily topics record is missing or invalid.")
    }

    const topics = data.topics.filter((topic): topic is Topic => {
        if (typeof topic !== "object" || topic === null) return false
        if (!("slug" in topic) || !("title" in topic)) return false
        return typeof topic.slug === "string" && typeof topic.title === "string"
    })
    if (topics.length !== data.topics.length || topics.length === 0) {
        throw new Error("The daily topics record contains invalid entries.")
    }

    return topics
}
