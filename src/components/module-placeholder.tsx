export function ModulePlaceholder({
  title,
  issue,
}: {
  title: string;
  issue: number;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Screen not built yet — tracked in{" "}
        <a
          href={`https://github.com/garosan/refine-foods/issues/${issue}`}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          issue #{issue}
        </a>
        .
      </p>
    </div>
  );
}
