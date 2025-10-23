interface SuspenseViewProps {
  promise?: Promise<unknown>;
  error?: Error;
}

export function SuspenseView({ promise, error }: SuspenseViewProps) {
  if (!promise) {
    return <span></span>;
  }

  if (error) {
    return <span>{error.toString()}</span>;
  }

  return <img src="https://brfenergi.se/iprog/loading.gif" alt="Loading..." />;
}
