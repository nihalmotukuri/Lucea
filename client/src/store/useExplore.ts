import { create } from "zustand"

interface ExploreState {
    recommendedCollections: {
        id: string,
        title: string,
        description: string,
        heroImage: string,
        backgroundImage: string
    }[]
}

export const useExplore = create<ExploreState>(() => ({
    recommendedCollections: [
        {
            id: 'midnight-solitude',
            title: 'Midnight Solitude',
            description: 'Atmospheric scenes for quiet moments.',
            heroImage: 'https://images.pexels.com/photos/20080396/pexels-photo-20080396.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            backgroundImage: 'https://images.pexels.com/photos/19407217/pexels-photo-19407217.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
        },
        {
            id: 'surreal-moments',
            title: 'Surreal Moments',
            description: 'Imaginative compositions, dream-like visuals.',
            heroImage: 'https://images.pexels.com/photos/32809805/pexels-photo-32809805.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            backgroundImage: 'https://images.pexels.com/photos/4737041/pexels-photo-4737041.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
        },
        {
            id: 'concrete-canvas',
            title: 'Concrete Canvas',
            description: 'The raw beauty of urban environments.',
            heroImage: 'https://images.pexels.com/photos/33920731/pexels-photo-33920731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            backgroundImage: 'https://images.pexels.com/photos/14754907/pexels-photo-14754907.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
        },
        {
            id: 'wanderlust-chronicles',
            title: 'Wanderlust Chronicles',
            description: 'Epic landscapes and intimate moments.',
            heroImage: 'https://images.pexels.com/photos/3889892/pexels-photo-3889892.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            backgroundImage: 'https://images.pexels.com/photos/33956767/pexels-photo-33956767.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
        },
        {
            id: 'golden-hour-hues',
            title: 'Golden Hour Hues',
            description: 'The magical light of dusk and dawn.',
            heroImage: 'https://images.pexels.com/photos/1840142/pexels-photo-1840142.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            backgroundImage: 'https://images.pexels.com/photos/6225742/pexels-photo-6225742.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
        },
        {
            id: 'whispers-of-the-wild',
            title: 'Whispers of the Wild',
            description: 'Untouched landscapes and hidden wildlife.',
            heroImage: 'https://images.pexels.com/photos/27180809/pexels-photo-27180809.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            backgroundImage: 'https://images.pexels.com/photos/33942179/pexels-photo-33942179.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
        },
        {
            id: 'macro-photography',
            title: 'Macro Photography',
            description: "The world's unseen details, up close.",
            heroImage: 'https://images.pexels.com/photos/3780058/pexels-photo-3780058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            backgroundImage: 'https://images.pexels.com/photos/1046287/pexels-photo-1046287.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
        },
        {
            id: 'lines-and-shapes',
            title: 'Lines & Shapes',
            description: 'The geometry of structure, nature, and form.',
            heroImage: 'https://images.pexels.com/photos/9945014/pexels-photo-9945014.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            backgroundImage: 'https://images.pexels.com/photos/7008307/pexels-photo-7008307.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
        },
    ]
}))