export interface Founder {
  name: string;
  role: string;
  bio: string;
  linkedinUrl?: string;
}

export default function FounderCard({ founder }: { founder: Founder }) {
  return (
    <div className="flex flex-col items-start border-t-2 border-primary pt-6">
      <span className="flex h-24 w-24 items-center justify-center rounded-lg bg-border/60 text-text-muted">
        <svg viewBox="0 0 24 24" className="h-11 w-11" fill="currentColor">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.42 0-8 2.24-8 5v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.76-3.58-5-8-5z" />
        </svg>
      </span>
      <p className="mt-4 font-display text-xl font-semibold text-text">{founder.name}</p>
      <p className="text-sm font-medium text-primary-text">{founder.role}</p>
      <p className="mt-3 text-sm text-text-muted">{founder.bio}</p>
      <a
        href={founder.linkedinUrl ?? "#"}
        className="mt-2 inline-flex min-h-11 items-center text-[13px] font-medium text-text-muted underline-offset-2 hover:text-primary-text hover:underline"
      >
        Add LinkedIn / social link
      </a>
    </div>
  );
}
