import TopMenuFilters from './top-menu-filters/TopMenuFilters'
import { Logo } from './Logo'

const Header = () => {
  return (
    <header className='mt-8'>
      <Logo />
      <TopMenuFilters />
    </header>
  )
}

export default Header
