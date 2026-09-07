import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '../../../tests/helpers/render'
import { useSettingsStore } from '../../store/settingsStore'
import RoadtripLimitsCard from './RoadtripLimitsCard'

/**
 * FE-ROADTRIP-LIMITS-001..008 — the three numbers that decide every warning.
 *
 * The one that matters is when a number is written. These fields had no local
 * state, so every keystroke was a settings PUT: typing "180" sent three, and
 * they raced. The value that decides whether a day is over budget could end up a
 * tenth of what was typed and only say so after the next reload.
 */

function open(onSave?: (key: string, value: number) => void) {
  render(<RoadtripLimitsCard onSave={onSave} />)
  fireEvent.click(screen.getByRole('button'))
}

/** The three inputs, in the order the dialog lists them. */
const inputs = () => screen.getAllByRole('spinbutton') as HTMLInputElement[]

beforeEach(() => {
  useSettingsStore.setState({
    settings: {
      roadtrip_leg_minutes: 0,
      roadtrip_day_minutes: 0,
      roadtrip_range_km: 0,
      distance_unit: 'metric',
    } as never,
  })
})

describe('RoadtripLimitsCard', () => {
  it('FE-ROADTRIP-LIMITS-001: typing a number writes nothing until the field is left', () => {
    const onSave = vi.fn()
    open(onSave)

    const [leg] = inputs()
    fireEvent.change(leg, { target: { value: '1' } })
    fireEvent.change(leg, { target: { value: '18' } })
    fireEvent.change(leg, { target: { value: '180' } })

    // Three keystrokes used to be three unordered PUTs carrying 1, 18 and 180.
    expect(onSave).not.toHaveBeenCalled()
    expect(leg.value).toBe('180')
  })

  it('FE-ROADTRIP-LIMITS-002: leaving the field saves once, with what was typed', () => {
    const onSave = vi.fn()
    open(onSave)

    const [leg] = inputs()
    fireEvent.change(leg, { target: { value: '180' } })
    fireEvent.blur(leg)

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith('roadtrip_leg_minutes', 180)
  })

  it('FE-ROADTRIP-LIMITS-003: Enter commits without having to click away', () => {
    const onSave = vi.fn()
    open(onSave)

    const [, day] = inputs()
    fireEvent.change(day, { target: { value: '540' } })
    fireEvent.keyDown(day, { key: 'Enter' })

    expect(onSave).toHaveBeenCalledWith('roadtrip_day_minutes', 540)
  })

  it('FE-ROADTRIP-LIMITS-004: leaving a field nobody touched saves nothing', () => {
    const onSave = vi.fn()
    open(onSave)

    fireEvent.blur(inputs()[0])

    expect(onSave).not.toHaveBeenCalled()
  })

  it('FE-ROADTRIP-LIMITS-005: retyping the value it already had is not a write', () => {
    useSettingsStore.setState({
      settings: { roadtrip_leg_minutes: 180, roadtrip_day_minutes: 0, roadtrip_range_km: 0, distance_unit: 'metric' } as never,
    })
    const onSave = vi.fn()
    open(onSave)

    const [leg] = inputs()
    fireEvent.change(leg, { target: { value: '180' } })
    fireEvent.blur(leg)

    expect(onSave).not.toHaveBeenCalled()
  })

  it('FE-ROADTRIP-LIMITS-006: clearing a field turns the limit off', () => {
    useSettingsStore.setState({
      settings: { roadtrip_leg_minutes: 180, roadtrip_day_minutes: 0, roadtrip_range_km: 0, distance_unit: 'metric' } as never,
    })
    const onSave = vi.fn()
    open(onSave)

    const [leg] = inputs()
    fireEvent.change(leg, { target: { value: '' } })
    fireEvent.blur(leg)

    expect(onSave).toHaveBeenCalledWith('roadtrip_leg_minutes', 0)
  })

  it('FE-ROADTRIP-LIMITS-007: the range field carries the reader own unit', () => {
    useSettingsStore.setState({
      settings: { roadtrip_leg_minutes: 0, roadtrip_day_minutes: 0, roadtrip_range_km: 0, distance_unit: 'imperial' } as never,
    })
    open(vi.fn())

    expect(screen.getByText('mi')).toBeInTheDocument()
    expect(screen.queryByText('km')).not.toBeInTheDocument()
  })

  it('FE-ROADTRIP-LIMITS-008: without a way to save, the dialog is read-only', () => {
    // `onSave` absent is how the caller says the reader may look but not change.
    open(undefined)

    const [leg] = inputs()
    fireEvent.change(leg, { target: { value: '180' } })
    // Nothing to assert but the absence of a crash: the commit path has no
    // handler to call, and must not assume one.
    expect(() => fireEvent.blur(leg)).not.toThrow()
  })
})
