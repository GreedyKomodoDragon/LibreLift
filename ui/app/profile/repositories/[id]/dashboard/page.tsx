import { DashboardCard } from "@/components/dashboardCard";
import { RevenueGraph } from "@/components/revenueGraph";

export default function Page({ params }: { params: { id: string } }) {
  console.log("params:", params);
//   const { isPending, error, data } = useQuery({
//     refetchInterval: 0,
//     queryKey: ["repo"],
//     queryFn: () => GetRepo(),
//   });

  return (
    <>
      <div className="p-4">
        <h1 className="text-5xl">Funding Dashboard {params.id}</h1>
      </div>
      <div className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <DashboardCard title="Total Funding" value="$2,345" />
          <DashboardCard title="Total Subscribers" value="20,345" />
          <DashboardCard title="Average Funding per Subscriber" value="$20" />
          <DashboardCard title="Average Funding per Subscriber" value="$20" />
        </div>
        <div
          className="rounded-lg border bg-card text-card-foreground shadow-sm mt-4"
          data-v0-t="card"
        >
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold whitespace-nowrap tracking-tight text-3xl">
              Top Selling Products
            </h3>
          </div>
          <div className="p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&amp;_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      Product
                    </td>
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      Units Sold
                    </td>
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      Revenue
                    </td>
                  </tr>
                </thead>
                <tbody className="[&amp;_tr:last-child]:border-0">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      Product A
                    </td>
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      100
                    </td>
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      $1,000
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      Product B
                    </td>
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      80
                    </td>
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      $800
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      Product C
                    </td>
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      120
                    </td>
                    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                      $1,200
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <RevenueGraph />
      </div>
    </>
  );
}
