interface SearchDropdownLoadingProps {
    label: string
}

const SearchDropdownLoading = ({ label }: SearchDropdownLoadingProps) => (
    <div role="status" className="flex items-center gap-2 text-xs text-neutral-400">
        <span
            aria-hidden="true"
            className="size-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700"
        />
        <span>{label}</span>
    </div>
)

export default SearchDropdownLoading
