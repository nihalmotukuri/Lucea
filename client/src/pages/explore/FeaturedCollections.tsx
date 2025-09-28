
const FeaturedCollections = () => {
    return (
        <section>
            <h1
                className="pt-1 pb-[16px] text-3xl text-neutral-700"
                style={{
                    fontFamily: '"PT Serif", serif'
                }}
            >
                Explore Featured Collections
            </h1>

            <div className="size-full rounded-3xl grid grid-rows-[1fr_60px] overflow-hidden border border-black/10 cursor-pointer hover:border-black/20 hover:shadow">
                <div className='grid grid-cols-2 grid-rows-2 gap-[3px] overflow-hidden'>
                    <div
                        className="col-span-1 row-span-2"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/2097278/pexels-photo-2097278.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>

                    <div
                        className="col-span-1 row-span-1 overflow-hidden"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/2323654/pexels-photo-2323654.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>

                    <div
                        className="col-span-1 row-span-1 overflow-hidden"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/2689177/pexels-photo-2689177.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>
                </div>

                <div
                    className="flex flex-col justify-center text-m pl-4">
                    <span>The Vintage Edit</span>
                </div>
            </div>

            <div className="size-full rounded-3xl grid grid-rows-[1fr_60px] overflow-hidden border border-black/10 cursor-pointer hover:border-black/20 hover:shadow">
                <div className='grid grid-cols-2 grid-rows-2 gap-[3px] overflow-hidden'>
                    <div
                        className="col-span-1 row-span-2"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/925742/pexels-photo-925742.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>

                    <div
                        className="col-span-1 row-span-1 overflow-hidden"
                    >
                        <img
                            className="h-full w-full object-cover object-top"
                            src="https://images.pexels.com/photos/1198828/pexels-photo-1198828.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>

                    <div
                        className="col-span-1 row-span-1 overflow-hidden"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/3812773/pexels-photo-3812773.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>
                </div>

                <div
                    className="flex flex-col justify-center text-m pl-4">
                    <span>Social Media Templates</span>
                </div>
            </div>

            <div className="size-full rounded-3xl grid grid-rows-[1fr_60px] overflow-hidden border border-black/10 cursor-pointer hover:border-black/20 hover:shadow">
                <div className='grid grid-cols-2 grid-rows-2 gap-[3px] overflow-hidden'>
                    <div
                        className="col-span-1 row-span-2"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/1624630/pexels-photo-1624630.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>

                    <div
                        className="col-span-1 row-span-1 overflow-hidden"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/4068965/pexels-photo-4068965.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>

                    <div
                        className="col-span-1 row-span-1 overflow-hidden"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/139759/pexels-photo-139759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>
                </div>

                <div
                    className="flex flex-col justify-center text-m pl-4">
                    <span>Monochrome Flowers</span>
                </div>
            </div>

            <div className="size-full rounded-3xl grid grid-rows-[1fr_60px] overflow-hidden border border-black/10 cursor-pointer hover:border-black/20 hover:shadow">
                <div className='grid grid-cols-2 grid-rows-2 gap-[3px] overflow-hidden'>
                    <div
                        className="col-span-1 row-span-2"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/937787/pexels-photo-937787.jpeg?auto=compress&cs=tinysrgb&h=650&w=9400"
                            alt=""
                        />
                    </div>

                    <div
                        className="col-span-1 row-span-1 overflow-hidden"
                    >
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.pexels.com/photos/4161872/pexels-photo-4161872.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>

                    <div
                        className="col-span-1 row-span-1 overflow-hidden"
                    >
                        <img
                            className="h-full w-full object-cover object-bottom"
                            src="https://images.pexels.com/photos/4744911/pexels-photo-4744911.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                            alt=""
                        />
                    </div>
                </div>

                <div
                    className="flex flex-col justify-center text-m pl-4">
                    <span>Soft Summer Scenes</span>
                </div>
            </div>
        </section>
    )
}

export default FeaturedCollections