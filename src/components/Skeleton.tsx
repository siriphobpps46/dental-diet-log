export function EntryCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/70 p-4 animate-pulse">
      <div className="h-14 w-14 shrink-0 rounded-xl bg-purple-100" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 w-1/3 rounded-full bg-purple-100" />
        <div className="h-3 w-2/3 rounded-full bg-purple-100" />
        <div className="h-3 w-1/2 rounded-full bg-purple-100" />
      </div>
    </div>
  );
}

export function EntryListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <EntryCardSkeleton key={i} />
      ))}
    </div>
  );
}
