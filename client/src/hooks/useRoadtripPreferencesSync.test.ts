import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRoadtripPreferencesSync } from './useRoadtripPreferencesSync'
import { useSettingsStore } from '../store/settingsStore'
import { addListener, removeListener } from '../api/websocket'

vi.mock('../api/websocket', () => ({ addListener: vi.fn(), removeListener: vi.fn() }))

describe('Roadtrip settings from MCP', () => {
  it('merges valid user events, refuses unrelated settings and unsubscribes', () => {
    const before = useSettingsStore.getState().settings
    const hook = renderHook(() => useRoadtripPreferencesSync())
    const calls = vi.mocked(addListener).mock.calls
    const listener = calls[calls.length - 1][0]
    act(() => listener({ type: 'roadtripPreferences:changed', preferences: { roadtrip_day_start: '07:00' } }))
    expect(useSettingsStore.getState().settings.roadtrip_day_start).toBe('07:00')
    expect(useSettingsStore.getState().settings.distance_unit).toBe(before.distance_unit)
    act(() => listener({ type: 'roadtripPreferences:changed', preferences: { roadtrip_day_start: '99:00' } }))
    expect(useSettingsStore.getState().settings.roadtrip_day_start).toBe('07:00')
    hook.unmount()
    expect(removeListener).toHaveBeenCalledWith(listener)
    useSettingsStore.setState({ settings: before })
  })
})
