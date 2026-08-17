import { Search } from 'lucide-react';

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="searchbar">
      <Search size={16} />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
export default SearchBar;