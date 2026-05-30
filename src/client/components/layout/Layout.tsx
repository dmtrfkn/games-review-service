import React, { type PropsWithChildren } from 'react'
import Header from './header/Header'
import { useParallax } from './useParallax'

const Layout = ({ children }: PropsWithChildren<unknown>) => {
  const bgRef = useParallax()
  return (
    <div className='relative min-h-screen overflow-hidden'>
      <div ref={bgRef} className='absolute inset-0 will-change-transform'>
        <img
          src='/images/bg-forest.jpg'
          alt=''
          className='w-full h-full object-cover contrast-120 saturate-110 brightness-60'
          draggable={false}
        />
      </div>

      <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(4,12,24,0.85)_0%,rgba(6,20,40,0.85)_35%,rgba(4,12,24,0.4)_70%)]' />

      <div className='absolute inset-0 bg-linear-to-l from-accent/25 via-transparent to-transparent' />

      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(254,186,135,0.05),transparent_30%)]' />

      <div className='absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.65)_100%)]' />

      <div className='relative z-10'>
        <div className='container max-w-290 mx-auto'>
          <Header />
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Layout
