import axios from "axios"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "/api"

const pexelsApi = axios.create({
    baseURL: apiBaseUrl,
})

export default pexelsApi