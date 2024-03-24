export type LoadingSpinnerProps = {
  size?: number;
}


export default function LoadingSpinner(props: LoadingSpinnerProps) {
  return (
    <div
      className={`inline-block h-${props.size || 36} w-${props.size || 36} animate-spin rounded-full border-[10px] border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.4s_linear_infinite]`}
      role="status"
    ></div>
  );
}
