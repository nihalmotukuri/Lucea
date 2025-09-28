import Masonry from "react-responsive-masonry"

const Featured = () => (
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
                </Masonry>
            </div>
        </div>
    </section>
)

export default Featured