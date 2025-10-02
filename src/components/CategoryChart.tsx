import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryChartProps {
  movements: Array<{
    categoria: string;
    importo: number;
  }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  donazioni: "Donazioni",
  affitto: "Affitto",
  utenze: "Utenze",
  stipendi: "Stipendi",
  forniture: "Forniture",
  manutenzione: "Manutenzione",
  eventi: "Eventi",
  altro: "Altro",
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const CategoryChart = ({ movements }: CategoryChartProps) => {
  const categoryTotals = movements.reduce((acc, movement) => {
    const category = movement.categoria;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += movement.importo;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals).map(([categoria, value]) => ({
    name: CATEGORY_LABELS[categoria] || categoria,
    value: Number(value),
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spese per Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nessun dato disponibile
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spese per Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
