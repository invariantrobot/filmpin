import { observer } from 'mobx-react-lite';
import { MapView } from './views/mapView.tsx';
/* import { SearchView}  from "/src/views/searchView.jsx"; */

interface DashboardProps {
  model: {
    searchParams: {
      q?: string;
      [key: string]: unknown;
    };
  };
}

const Dashboard = observer(function DashboardRender({ model }: DashboardProps) {
  function searchTextChangeACB(text: string) {
    model.searchParams.q = text;
  }

  function searchTriggerACB() {
    // Trigger search logic here
    console.log('Search triggered for:', model.searchParams.q);
  }

  return (
    <div>
      <MapView
        searchQuery={model.searchParams.q}
        onSearchTextChange={searchTextChangeACB}
        onSearchButtonClick={searchTriggerACB}
      />
    </div>
  );
});

export { Dashboard };
