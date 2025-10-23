import '../index.css';

interface PlanViewProps {
  model: unknown;
}

export function PlanView(_props: PlanViewProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Plan</h1>
      <p className="text-gray-600 mb-6">Plan your location lists here.</p>
    </div>
  );
}
