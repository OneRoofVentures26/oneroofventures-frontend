export default function AgencyCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 border-b border-mist px-3 py-5 md:flex-row md:items-center md:gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="h-11 w-11 flex-shrink-0 rounded-sm bg-mist/70" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-4 w-2/3 rounded-sm bg-mist/70" />
          <div className="h-3 w-1/3 rounded-sm bg-mist/70" />
          <div className="flex gap-1.5 pt-1">
            <div className="h-5 w-16 rounded-sm bg-mist/70" />
            <div className="h-5 w-20 rounded-sm bg-mist/70" />
            <div className="h-5 w-14 rounded-sm bg-mist/70" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pl-14 md:w-60 md:flex-col md:items-end md:pl-0">
        <div className="h-9 w-24 rounded-sm bg-mist/70" />
        <div className="h-9 w-44 rounded-sm bg-mist/70" />
      </div>
    </div>
  );
}
