// import { useState } from "react"
// import { IoSearch } from "react-icons/io5"
// import { useNavigate, useParams } from "react-router-dom"
// import Suggestions from "../home/Suggestions"
// import { useQuery } from "@tanstack/react-query"
// import axios from "axios"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Masonry from "react-responsive-masonry"

const Featured = () => {
    // const navigate = useNavigate()
    // const [searchQuery, setSearchQuery] = useState('')
    // const { collectionId } = useParams()

    // const onSearchMedia = (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault()

    //     if (!searchQuery) return null

    //     navigate(`/search?query=${searchQuery}&type=photos`)
    // }

    const getFeatured = async () => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/collections/eta6y9n?per_page=40`,
                // `https://api.pexels.com/v1/collections/featured?per_page=2&page=1`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            )

            console.log(res.data)
            return res.data

        } catch (err) {
            console.error(err)
            return null
        }
    }

    const { data, isFetched, isPending, isLoading } = useQuery({
        queryKey: ['featured'],
        queryFn: getFeatured
    })

    const mediaList = data?.media
    console.log(mediaList)

    // if (isLoading || isPending) return null

    return (
        <section className="my-4">
            <div className="flex gap-[24px]">
                <div
                    className="w-[60%] h-[360px] bg-cover bg-bottom rounded-[48px] p-[28px] flex flex-col justify-end"
                    style={{
                        backgroundImage: `url(https://images.pexels.com/photos/9965687/pexels-photo-9965687.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)`
                    }}
                >
                    <h1
                        style={{
                            fontFamily: '"Playfair Display", serif'
                        }}
                        className="text-[84px] text-white"
                    >
                        The Vintage Edit
                    </h1>
                </div>

                {/* <div className="h-[360px] overflow-hidden flex-1 grid grid-cols-[1fr_1fr] grid-rows-[repeat(10,1fr)] gap-1 rounded-[48px]">
                        <img
                            className="col-span-1 row-span-10 h-full w-full object-cover"
                            src='https://images.pexels.com/photos/851584/pexels-photo-851584.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                        />

                        <img
                            className="col-span-1 row-span-6 h-full w-full object-cover "
                            src='https://images.pexels.com/photos/2097278/pexels-photo-2097278.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                        />

                        <img
                            className="col-span-1 row-span-4 h-full w-full object-cover"
                            src='https://images.pexels.com/photos/2323654/pexels-photo-2323654.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                        />
                    </div> */}
                
            <div className="h-[360px] flex-1 overflow-hidden rounded-[48px]">
                <Masonry 
                    columnsCount={3} 
                    gutter="4px"
                >
                    <img
                        className="col-span-1 row-span-10 h-full w-full object-cover"
                        src='https://images.pexels.com/photos/851584/pexels-photo-851584.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                    />

                    <img
                        className="col-span-1 row-span-6 h-full w-full object-cover"
                        src='https://images.pexels.com/photos/2097278/pexels-photo-2097278.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                    />

                    <img
                        className="col-span-1 row-span-4 h-full w-full object-cover"
                        src='https://images.pexels.com/photos/2323654/pexels-photo-2323654.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                    />
                    <img
                        className="col-span-1 row-span-10 h-full w-full object-cover"
                        src='https://images.pexels.com/photos/3021322/pexels-photo-3021322.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                    />

                    <img
                        className="col-span-1 row-span-6 h-full w-full object-cover"
                        src='https://images.pexels.com/photos/5504105/pexels-photo-5504105.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                    />

                    <img
                        className="col-span-1 row-span-4 h-full w-full object-cover"
                        src='https://images.pexels.com/photos/9890091/pexels-photo-9890091.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                    />

                    {/* <img
                        className="col-span-1 row-span-6 h-full w-full object-cover "
                        src='https://images.pexels.com/photos/11174121/pexels-photo-11174121.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                    />

                    <img
                        className="col-span-1 row-span-4 h-full w-full object-cover"
                        src='https://images.pexels.com/photos/12430869/pexels-photo-12430869.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
                    /> */}
                </Masonry>
                </div>
            </div>
        </section>
    )
}


export default Featured