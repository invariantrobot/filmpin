import { Search, X } from 'lucide-react';

export type SearchTab = 'films' | 'locations';

interface SearchViewProps {
  searchQuery: string;
  onSearchTextChange: (text: string) => void;
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
  onBackClick: () => void;
  // Results will be added later
  filmResults?: any[];
  locationResults?: any[];
}

export function SearchView({
  searchQuery,
  onSearchTextChange,
  activeTab,
  onTabChange,
  onBackClick,
  filmResults = [],
  locationResults = [],
}: SearchViewProps) {
  // Handle search text change
  function searchTextChangeACB(evt: React.ChangeEvent<HTMLInputElement>) {
    onSearchTextChange(evt.target.value);
  }

  // Handle tab click
  function handleTabClickACB(tab: SearchTab) {
    return () => onTabChange(tab);
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Search bar */}
      <div className="w-full max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center bg-white rounded-4xl shadow-lg p-2">
          <Search className="h-6 w-6 text-gray-400 ml-2" />
          <input
            onChange={searchTextChangeACB}
            type="text"
            placeholder="Search for movies or locations"
            value={searchQuery}
            className="flex-1 px-2 py-2 outline-none"
            autoFocus
          />
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close search"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mt-2">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={handleTabClickACB('films')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'films'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Films
            {activeTab === 'films' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={handleTabClickACB('locations')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'locations'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Locations
            {activeTab === 'locations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Results container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {activeTab === 'films' ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery
                  ? 'No films found. Start typing to search...'
                  : 'Search for films by title'}
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery
                  ? 'No locations found. Start typing to search...'
                  : 'Search for filming locations by name or address'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
