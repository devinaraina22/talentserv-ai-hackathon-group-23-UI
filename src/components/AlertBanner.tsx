export function AlertBanner({
  type,
  message,
}: {
  type: "success" | "error" | "info";
  message: string;
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    error: "bg-red-50 text-red-800 border-red-200",
    info: "bg-sky-50 text-sky-800 border-sky-200",
  };

  return (
    <div className={`rounded-xl border p-4 text-sm ${styles[type]}`} role="alert">
      {message}
    </div>
  );
}
