export default function GenreFilter({ genres, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
          !selected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
        }`}
      >
        Все
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onChange(genre.id)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            selected === genre.id ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  )
}
