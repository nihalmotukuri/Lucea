import { create } from "zustand"

interface TopicStates {
    activeTopic: string,
    topics: {slug: string, title: string} [],
    setActiveTopic: (topic: string) => void
}

export const useTopic = create<TopicStates>((set) => ({
    activeTopic: '',
    topics: [
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
    ],
    setActiveTopic: (topic) => set({
        activeTopic: topic
    })
}))