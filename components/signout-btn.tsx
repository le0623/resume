"use client"

import { signOut } from '@workos-inc/authkit-nextjs';
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react';

export const SignOutBtn = () => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => signOut({ returnTo: "/" })}
    >
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Sign Out</span>
    </Button>
  )
}