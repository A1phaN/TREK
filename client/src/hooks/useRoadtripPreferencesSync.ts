import { useEffect } from 'react'
import { roadtripPreferencesSchema } from '@trek/shared'
import { addListener, removeListener } from '../api/websocket'
import { useSettingsStore } from '../store/settingsStore'

export function useRoadtripPreferencesSync() {
  useEffect(() => {
    const listener = (event: Record<string, unknown>) => {
      if (event.type !== 'roadtripPreferences:changed') return
      const parsed = roadtripPreferencesSchema.safeParse(event.preferences)
      if (parsed.success) useSettingsStore.setState(state => ({ settings: { ...state.settings, ...parsed.data } }))
    }
    addListener(listener)
    return () => removeListener(listener)
  }, [])
}
