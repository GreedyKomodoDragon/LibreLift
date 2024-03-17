type DashboardCardProps = {
  title: string;
  value: string;
};

export function DashboardCard(props: DashboardCardProps) {
  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm"
      data-v0-t="card"
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold whitespace-nowrap tracking-tight text-3xl">
          {props.title}
        </h3>
      </div>
      <div className="flex items-center justify-center mb-10">
        <div className="text-6xl">{props.value}</div>
      </div>
    </div>
  );
}
