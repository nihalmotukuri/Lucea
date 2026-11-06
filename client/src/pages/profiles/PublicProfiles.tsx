import { useEffect, useState, type FormEvent } from "react"
import { Link, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ArrowUpRight, LockKeyhole, UserRound } from "lucide-react"
import { getOwnProfile, getPublicMoodboard, getPublicProfile, saveOwnProfile } from "@/api/moodboards"
import PublicMoodboardCard from "@/components/features/PublicMoodboardCard"
import { useAuth } from "@/auth/useAuth"
import { useMoodboards } from "@/store/useMoodboards"

const surfaceClass = "min-h-screen bg-[#fdfcfb] px-5 pb-10 pt-24 text-neutral-800 md:px-8 md:pt-12"
const handlePattern = /^[a-z0-9_]{3,30}$/

export const MyProfilePage = () => {
    const { user, accessToken, isAuthLoading, openAuthDialog } = useAuth()
    const queryClient = useQueryClient()
    const [handle, setHandle] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const moodboards = useMoodboards(state => state.moodboards)
    const profileQuery = useQuery({
        queryKey: ["own-profile", user?.id],
        queryFn: () => getOwnProfile(accessToken!),
        enabled: Boolean(user && accessToken),
    })
    const saveProfile = useMutation({
        mutationFn: (nextHandle: string) => saveOwnProfile(accessToken!, nextHandle),
        onSuccess: profile => {
            queryClient.setQueryData(["own-profile", user?.id], profile)
            setHandle(profile.handle)
            setErrorMessage("")
        },
        onError: error => {
            setErrorMessage(error instanceof Error ? error.message : "Unable to save your profile.")
        },
    })

    useEffect(() => {
        if (profileQuery.data?.handle) setHandle(profileQuery.data.handle)
    }, [profileQuery.data?.handle])

    if (isAuthLoading || (user && profileQuery.isPending)) {
        return <section className={`${surfaceClass} grid place-items-center`}><p role="status">Loading your profile…</p></section>
    }

    if (!user) {
        return (
            <section className={`${surfaceClass} grid place-items-center`}>
                <div className="max-w-md text-center">
                    <UserRound className="mx-auto text-neutral-500" aria-hidden="true" />
                    <h1 className="mt-3 font-editorial text-3xl">Your public profile</h1>
                    <p className="mt-2 text-sm text-neutral-500">Sign in to choose a handle and share your public moodboards.</p>
                    <button
                        type="button"
                        onClick={() => openAuthDialog("Sign in to set up your public profile.")}
                        className="mt-5 min-h-11 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white"
                    >
                        Sign in
                    </button>
                </div>
            </section>
        )
    }

    const publicMoodboards = moodboards.filter(board => board.isPublic)

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const normalizedHandle = handle.trim().toLowerCase()
        if (!handlePattern.test(normalizedHandle)) {
            setErrorMessage("Use 3–30 lowercase letters, numbers, or underscores.")
            return
        }
        saveProfile.mutate(normalizedHandle)
    }

    return (
        <section className={surfaceClass}>
            <div className="mx-auto max-w-4xl">
                <header className="border-b border-black/[0.08] pb-6 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f4efe9] text-neutral-700">
                        <UserRound size={20} aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Your creator page</p>
                    <h1 className="font-editorial mt-1 text-4xl text-neutral-800">Public profile</h1>
                    <p className="mt-2 text-sm text-neutral-500">Choose a unique handle people can use to find your shared moodboards.</p>
                </header>

                {profileQuery.isError && (
                    <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                        Unable to load your profile. Refresh the page and try again.
                    </p>
                )}
                <form onSubmit={submit} className="mx-auto mt-6 max-w-xl">
                    <label htmlFor="public-profile-handle" className="mb-2 block text-sm font-medium">Your handle</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex min-h-11 min-w-0 flex-1 items-center rounded-xl border border-black/10 bg-white px-3 text-sm">
                            <span className="shrink-0 text-neutral-400">/profiles/</span>
                            <input
                                id="public-profile-handle"
                                value={handle}
                                maxLength={30}
                                autoComplete="username"
                                aria-invalid={Boolean(errorMessage)}
                                onChange={event => {
                                    setHandle(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                                    setErrorMessage("")
                                }}
                                className="min-w-0 flex-1 bg-transparent px-1 outline-none"
                                placeholder="your_handle"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saveProfile.isPending || !handlePattern.test(handle.trim().toLowerCase())}
                            className="min-h-11 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saveProfile.isPending ? "Saving…" : profileQuery.data ? "Save handle" : "Create profile"}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">3–30 characters; lowercase letters, numbers, and underscores only. Your email stays private.</p>
                    {errorMessage && <p role="alert" className="mt-2 text-sm text-red-700">{errorMessage}</p>}
                    {saveProfile.isSuccess && !errorMessage && (
                        <p role="status" className="mt-2 text-sm text-green-700">Profile handle saved.</p>
                    )}
                </form>

                {profileQuery.data && (
                    <div className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-5">
                        <p className="text-sm font-medium">Your public page</p>
                        <Link
                            to={`/profiles/${encodeURIComponent(profileQuery.data.handle)}`}
                            className="mt-2 inline-flex min-h-9 items-center gap-2 break-all text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
                        >
                            {window.location.origin}/profiles/{profileQuery.data.handle}
                            <ArrowUpRight size={15} aria-hidden="true" />
                        </Link>
                    </div>
                )}

                <div className="mt-10">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">Your public moodboards</h2>
                        <Link to="/moodboards" className="text-sm text-neutral-600 underline underline-offset-4">Manage all</Link>
                    </div>
                    {publicMoodboards.length ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {publicMoodboards.map(board => (
                                <PublicMoodboardCard
                                    key={board.id}
                                    moodboard={{
                                        id: board.id,
                                        title: board.title,
                                        createdAt: board.createdAt,
                                        mediaCount: board.media.length,
                                        preview: board.media.slice(0, 3),
                                        handle: profileQuery.data?.handle ?? "",
                                        userId: user.id,
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-black/15 bg-white/60 p-7 text-center">
                            <LockKeyhole className="mx-auto text-neutral-500" aria-hidden="true" />
                            <p className="mt-3 text-sm text-neutral-600">Your moodboards are private until you publish them.</p>
                            <Link to="/moodboards" className="mt-3 inline-flex min-h-9 items-center gap-2 text-sm underline underline-offset-4">
                                Manage moodboards <ArrowUpRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export const PublicProfilePage = () => {
    const { handle = "" } = useParams()
    const { data: profile, isPending, isError } = useQuery({
        queryKey: ["public-profile", handle],
        queryFn: () => getPublicProfile(handle),
        enabled: handle.length > 0,
    })

    if (isPending) return <section className={`${surfaceClass} grid place-items-center`}><p role="status">Loading profile…</p></section>
    if (isError || !profile) {
        return (
            <section className={`${surfaceClass} grid place-items-center`}>
                <div className="text-center">
                    <h1 className="font-editorial text-3xl">Profile not found</h1>
                    <p className="mt-2 text-sm text-neutral-500">This profile may have moved or been removed.</p>
                    <Link to="/" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm underline underline-offset-4">
                        <ArrowLeft size={15} aria-hidden="true" /> Back to explore
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section className={surfaceClass}>
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 border-b border-black/[0.08] pb-6 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f4efe9] text-neutral-700">
                        <UserRound size={20} aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Lucea creator</p>
                    <h1 className="font-editorial mt-1 text-4xl text-neutral-800">@{profile.handle}</h1>
                    <p className="mt-2 text-sm text-neutral-500">{profile.moodboards.length} public moodboards</p>
                </header>
                {profile.moodboards.length ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {profile.moodboards.map(board => (
                            <PublicMoodboardCard
                                key={board.id}
                                moodboard={board}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="rounded-2xl border border-dashed border-black/15 bg-white/60 p-8 text-center text-sm text-neutral-500">
                        This creator hasn’t published any moodboards yet.
                    </p>
                )}
            </div>
        </section>
    )
}

export const PublicMoodboardPage = () => {
    const { handle = "", moodboardId = "" } = useParams()
    const { data: moodboard, isPending, isError } = useQuery({
        queryKey: ["public-moodboard", handle, moodboardId],
        queryFn: () => getPublicMoodboard(handle, moodboardId),
        enabled: Boolean(handle && moodboardId),
    })

    if (isPending) return <section className={`${surfaceClass} grid place-items-center`}><p role="status">Loading moodboard…</p></section>
    if (isError || !moodboard) {
        return (
            <section className={`${surfaceClass} grid place-items-center`}>
                <div className="text-center">
                    <h1 className="font-editorial text-3xl">Moodboard not found</h1>
                    <p className="mt-2 text-sm text-neutral-500">It may be private or no longer available.</p>
                    <Link to={`/profiles/${encodeURIComponent(handle)}`} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm underline underline-offset-4">
                        <ArrowLeft size={15} aria-hidden="true" /> Back to @{handle}
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section className={surfaceClass}>
            <div className="mx-auto max-w-6xl">
                <Link to={`/profiles/${encodeURIComponent(moodboard.handle)}`} className="inline-flex min-h-9 items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
                    <ArrowLeft size={15} aria-hidden="true" /> @{moodboard.handle}
                </Link>
                <header className="my-6 border-b border-black/[0.08] pb-5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Public moodboard</p>
                    <h1 className="font-editorial mt-1 break-words text-4xl text-neutral-800">{moodboard.title}</h1>
                    <p className="mt-2 text-sm text-neutral-500">
                        {moodboard.media.length} {moodboard.media.length === 1 ? "item" : "items"} by{" "}
                        <Link to={`/profiles/${encodeURIComponent(moodboard.handle)}`} className="font-medium text-neutral-700 underline underline-offset-4">
                            {moodboard.handle}
                        </Link>
                    </p>
                </header>
                {moodboard.media.length ? (
                    <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
                        {moodboard.media.map(media => (
                            <Link key={media.key} to={media.detailPath} className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-3xl bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800">
                                <img src={media.thumbnail} alt={media.alt} loading="lazy" className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]" />
                                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />
                                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-3.5 pb-3.5 text-xs text-white sm:px-4 sm:pb-4">
                                    <span className="min-w-0 truncate font-medium">{media.creator}</span>
                                    <span className="shrink-0 capitalize text-white/75">{media.type}</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="rounded-2xl border border-dashed border-black/15 bg-white/60 p-8 text-center text-sm text-neutral-500">
                        This moodboard is empty.
                    </p>
                )}
            </div>
        </section>
    )
}
