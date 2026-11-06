import { create } from "zustand"

export interface Topic {
    slug: string
    title: string
}

export const DEFAULT_TOPICS: Topic[] = [
    { slug: 'minimalist', title: 'Minimalist' },
    { slug: 'wallpapers', title: 'Wallpapers' },
    { slug: '3d-renders', title: '3D Renders' },
    { slug: 'travel', title: 'Travel' },
    { slug: 'nature', title: 'Nature' },
    { slug: 'street-photography', title: 'Street Photography' },
    { slug: 'film', title: 'Film' },
    { slug: 'architecture', title: 'Architecture' },
    { slug: 'experimental', title: 'Experimental' },
    { slug: 'animals', title: 'Animals' },
]

interface TopicStates {
    topics: Topic[]
    setTopics: (topics: Topic[]) => void
}

export const useTopic = create<TopicStates>((set) => ({
    topics: [],
    setTopics: topics => set({ topics }),
}))