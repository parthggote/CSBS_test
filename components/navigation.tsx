"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Settings, Moon, Sun, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation";

interface NavigationProps {
  currentUser?: {
    name: string
    role: "student" | "admin"
  }
}

export function Navigation({ currentUser }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  };

  // Navigation items - only show Events, Resources, Quizzes for non-logged-in users
  const navItems = currentUser && (currentUser.role === 'student' || currentUser.role === 'admin')
    ? [
        { href: '/', label: 'Home' },
        // Events, Resources, Quizzes are hidden for logged-in users
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/events', label: 'Events' },
        { href: '/resources', label: 'Resources' },
        { href: '/quizzes', label: 'Quizzes' },
      ];

  return (
    <nav className="border-b bg-white dark:bg-black/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            {/* KITCOEK Logo */}
            <img
              src="/kit-logo.png"
              alt="KITCOEK Logo"
              className="w-35 h-10 object-contain"
            />
            <div className="hidden sm:block">
              <span className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/40 dark:to-purple-900/40 ring-1 ring-blue-200/40 dark:ring-blue-900/40 shadow-sm text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 tracking-tight transition-all backdrop-blur-sm">
                Computer Science & Business Systems
                <ChevronRight className="w-4 h-4 ml-2 text-blue-500 dark:text-blue-300" />
                <span className="ml-2 w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 animate-pulse" />
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_white] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}

            {/* Dark mode toggle */}
            <div className="flex items-center space-x-2">
              <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                aria-label="Toggle dark mode"
              />
              <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>

            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{currentUser.role === 'admin' ? currentUser.name : (currentUser.name ? currentUser.name : (currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'User'))}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={currentUser.role === 'admin' ? '/admin' : '/dashboard'}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium hover:text-blue-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {!currentUser && (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Login</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
