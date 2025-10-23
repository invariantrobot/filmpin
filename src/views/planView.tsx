import '../index.css';

interface PlanViewProps {
  model: unknown;
}

export function PlanView(_props: PlanViewProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Plan</h1>
      <p className="text-gray-600 mb-6">Plan your location lists here.</p>
      <h3 className="mt-20 text-lg font-semibold text-gray-700 mb-4">
        TEST PAGES
      </h3>
      <ul className="space-y-3">
        <li>
          <a
            href="#/film"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
          >
            Go to Film View
          </a>
        </li>
        <li>
          <a
            href="#/location"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
          >
            Go to Location View
          </a>
        </li>
      </ul>
    </div>
  );
}
