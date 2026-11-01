import axios from "axios"

const pexelsApi = axios.create({
    baseURL: "https://api.pexels.com",
    headers: {
        Authorization: import.meta.env.VITE_PEXELS_API_KEY,
    },
})

export default pexelsApi