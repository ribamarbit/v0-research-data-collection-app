"use client"

import type React from "react"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const demoUserStr = localStorage.getItem("demo_user")
      if (demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr)
          setUser({ email: demoUser.email })
          setProfile({ full_name: demoUser.full_name, institution: demoUser.institution })
          setIsDemo(true)
          return
        } catch (e) {
          localStorage.removeItem("demo_user")
        }
      }

      // Se não for demo, carrega do Supabase
      const supabase = createBrowserClient()

      const {
        data: { user: userData },
      } = await supabase.auth.getUser()

      if (userData) {
        setUser(userData)

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.id).single()

        setProfile(profileData)
      }
    }

    loadUserData()
  }, [])

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden w-64 md:block">
          <Sidebar />
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            user={{
              email: user?.email,
              full_name: profile?.full_name,
              isDemo: isDemo,
            }}
          />
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
