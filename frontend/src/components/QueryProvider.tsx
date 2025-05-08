'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

interface Props {
    children: React.ReactNode
}

export const QueryProvider = ({ children }:Props) => {
    const [queryClient] = useState(() =>new QueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}