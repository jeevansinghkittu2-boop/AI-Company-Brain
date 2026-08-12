import { FileText } from "lucide-react";

type Activity = {
  id: number;
  name: string;
  uploadedAt: Date;
};

export default function ActivityTimeline({
  activities,
}: {
  activities: Activity[];
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        🕒 Recent Activity
      </h2>

      <div className="space-y-5">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 border-b pb-4"
          >
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="text-blue-600" size={20} />
            </div>

            <div>
              <p className="font-semibold">
                Uploaded {activity.name}
              </p>

              <p className="text-gray-500 text-sm">
                {activity.uploadedAt.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}