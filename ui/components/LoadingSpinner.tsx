export default function LoadingSpinner() {
  return (
    <div
      className="inline-block h-36 w-36 animate-spin rounded-full border-[10px] border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.4s_linear_infinite]"
      role="status"
    ></div>
  );
}
