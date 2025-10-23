import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchView } from './views/searchView';
import type { SearchTab } from './views/searchView';

export function SearchPresenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('films');
  const navigate = useNavigate();

  function handleSearchTextChange(text: string) {
    setSearchQuery(text);
    // TODO: Implement search logic here
  }

  function handleTabChange(tab: SearchTab) {
    setActiveTab(tab);
  }

  function handleBackClick() {
    navigate('/');
  }

  return (
    <SearchView
      searchQuery={searchQuery}
      onSearchTextChange={handleSearchTextChange}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onBackClick={handleBackClick}
    />
  );
}
