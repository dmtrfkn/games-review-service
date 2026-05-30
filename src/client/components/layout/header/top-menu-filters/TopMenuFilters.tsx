import { GENRES } from './genres'
import cn from 'clsx'
const ACTIVE_ID = 'action'

const TopMenuFilters = () => {
  return (
    <nav className='max-w-4xl mx-auto'>
      <ul className='flex items-center gap-12 justify-center'>
        {GENRES.map(genre => (
          <li>
            <button
              className={cn(
                'font-serif text-xl font-medium  transition-colors hover:text-accent hover:underline hover:underline-offset-5',
                {
                  'text-accent underline underline-offset-5 ':
                    genre.id === ACTIVE_ID
                }
              )}
              key={genre.id}
            >
              {genre.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TopMenuFilters
