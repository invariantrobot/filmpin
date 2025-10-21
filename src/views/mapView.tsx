interface MapViewProps {
  searchQuery?: string;
  onSearchTextChange: (text: string) => void;
  onSearchButtonClick: () => void;
}

export function MapView({
  searchQuery,
  onSearchTextChange,
  onSearchButtonClick,
}: MapViewProps) {
  function searchTextChangeACB(evt: React.ChangeEvent<HTMLInputElement>) {
    onSearchTextChange(evt.target.value);
  }

  function searchButtonClickACB() {
    onSearchButtonClick();
  }

  function searchTriggerCheckACB(evt: React.KeyboardEvent<HTMLInputElement>) {
    if (evt.key === 'Enter') {
      onSearchButtonClick();
    }
  }

  return (
    <div className="">
      <h3>Search films</h3>
      <input
        onChange={searchTextChangeACB}
        onKeyDown={searchTriggerCheckACB}
        type="text"
        placeholder="Enter film title or director..."
        value={searchQuery || ''}
      />
      <button onClick={searchButtonClickACB}>Search</button>
    </div>
  );
}
