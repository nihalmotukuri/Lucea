interface SearchDropdownLoadingProps {
    label: string
}

const SearchDropdownLoading = ({ label }: SearchDropdownLoadingProps) => (
    <div role="status" className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
        <span
            aria-hidden="true"
            className="size-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700 dark:border-neutral-700 dark:border-t-neutral-200"
        />
        <span>{label}</span>
    </div>
)

export default SearchDropdownLoading
