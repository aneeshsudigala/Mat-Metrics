/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchWrestlingData, type WrestlingRecord } from './wrestlingData'

interface WrestlingDataState {
  data: WrestlingRecord[]
  loading: boolean
  error: string | null
}

const WrestlingDataContext = createContext<WrestlingDataState>({
  data: [],
  loading: true,
  error: null,
})

export function WrestlingDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WrestlingDataState>({
    data: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    fetchWrestlingData()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => setState({ data: [], loading: false, error: String(err) }))
  }, [])

  return (
    <WrestlingDataContext.Provider value={state}>
      {children}
    </WrestlingDataContext.Provider>
  )
}

export function useWrestlingData(): WrestlingDataState {
  return useContext(WrestlingDataContext)
}
