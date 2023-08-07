import React from 'react'
import NavBar from '../navigation/nav_bar'


export default function MainLayout ({children}: {children: React.ReactNode}) {

    return (

      <main className="flex min-h-screen flex-col bg-[var(--primary-color)] text-white">
        <NavBar />
        {children}
      </main>
      )

    }
