import type { TaskResponse } from "@/schemas/task_schema";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ProfileChartProps {
  tasks: TaskResponse[];
}

const COLORS = ["#8B5CF6", "#10B981", "#F59E0B"];

const ProfileChart = ({ tasks }: ProfileChartProps) => {
  // Count tasks by status
  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const pendingTasks = tasks.filter((task) => task.status === "TO_DO").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const data = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: pendingTasks },
    { name: "In Progress", value: inProgressTasks },
  ];

  return (
    <div className="w-full h-64 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfileChart;
