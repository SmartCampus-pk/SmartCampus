import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import Link from 'next/link'
import React from 'react'

export function Navigation() {
  return (
    <NavigationMenu.Root className="navigation-root">
      <div className="navigation-container">
        <Link href="/" className="navigation-brand">
          Smart Campus
        </Link>
        <NavigationMenu.List className="navigation-list">
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/" className="navigation-link">
                Strona główna
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/events" className="navigation-link">
                Wydarzenia
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </div>
    </NavigationMenu.Root>
  )
}
