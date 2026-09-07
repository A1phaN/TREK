import { useCallback, useEffect, useState } from 'react'
import { roadtripApi } from '../../api/client'
import { isEmptyReanchoring, type Reanchoring } from './roadtripModel'
import type { RoadtripDayTrack, RoadtripVia } from '@trek/shared'

export interface RoadtripVias {
  /** Every via of the trip, keyed by day. */
  byDay: Record<number, RoadtripVia[]>
  /**
   * Which imported track each day was fitted to, keyed by day.
   *
   * The vias are what make the day follow it; this is what lets the day say so. Empty for
   * a day shaped by hand, and gone by itself when the track is deleted — the row cascades
   * with the place, so nothing here can name a line that no longer exists.
   */
  trackByDay: Record<number, RoadtripDayTrack>
  /**
   * True when the last read failed for a reason other than "there is nothing
   * here", so what is drawn may be older than what the server holds.
   *
   * The read runs after every write, and the via list feeds the routing key, so
   * emptying on a transient failure re-routed the whole trip along the roads the
   * traveller had steered away from — indistinguishable from having deleted
   * them. The list is kept and the staleness is said instead.
   */
  stale: boolean
  add: (dayId: number, afterOrderIndex: number, lat: number, lng: number) => Promise<void>
  /**
   * Lay a chain of vias on one day, optionally clearing the legs it fills first.
   *
   * One request and one reload for the whole chain. `add` per point would trigger a full
   * trip re-route between each one, spaced by the routing host's rate limit, so a
   * twenty-anchor track would spend half a minute drawing routes nobody asked to see.
   */
  addMany: (
    dayId: number,
    vias: { after_order_index: number; lat: number; lng: number }[],
    replaceLegs?: number[],
    /** Absent leaves the day's track alone, null clears it, an object records a new one. */
    track?: { place_id: number; stray_km?: number | null } | null,
  ) => Promise<void>
  move: (dayId: number, id: number, lat: number, lng: number) => Promise<void>
  remove: (dayId: number, id: number) => Promise<void>
  /**
   * Correct a day's anchors after its stops changed shape.
   *
   * Awaited by the caller before it lets the day re-route: the routing effect resolves
   * `after_order_index` against whatever the stop list looks like at that moment, so a
   * re-anchoring that lands afterwards is a second, visibly wrong route in between.
   */
  reanchor: (dayId: number, plan: Reanchoring) => Promise<void>
}

const EMPTY: Record<number, RoadtripVia[]> = {}
const EMPTY_TRACKS: Record<number, RoadtripDayTrack> = {}

/**
 * The points this trip's drives are routed through.
 *
 * Loaded once for the whole trip rather than per day: a road trip routes every day at
 * once, and one request for the lot beats one per day against a server that has to open
 * the same table each time.
 *
 * Writes are optimistic in the sense that the list is refreshed from the answer, not
 * patched by hand — a via has a server-assigned id and sequence, and guessing them would
 * be a second source of truth for the sake of one round trip.
 */
export function useRoadtripVias(tripId: number | string | null, active: boolean): RoadtripVias {
  const [byDay, setByDay] = useState<Record<number, RoadtripVia[]>>(EMPTY)
  const [trackByDay, setTrackByDay] = useState<Record<number, RoadtripDayTrack>>(EMPTY_TRACKS)
  /**
   * The list on screen may be older than the server's.
   *
   * Set when a read fails for a reason that is not "there is nothing here", so
   * the rail can say the shaping it is drawing might be out of date rather than
   * quietly showing a trip that has lost its detours.
   */
  const [stale, setStale] = useState(false)

  const group = useCallback((vias: RoadtripVia[]) => {
    const next: Record<number, RoadtripVia[]> = {}
    for (const v of vias) (next[v.day_id] ??= []).push(v)
    return next
  }, [])

  const reload = useCallback(async () => {
    if (!tripId || !active) { setByDay(EMPTY); setTrackByDay(EMPTY_TRACKS); return }
    try {
      const { vias, tracks } = await roadtripApi.listVias(tripId)
      setByDay(group(vias))
      const byId: Record<number, RoadtripDayTrack> = {}
      for (const track of tracks ?? []) byId[track.day_id] = track
      setTrackByDay(byId)
      setStale(false)
    } catch (err) {
      // An instance with the addon off answers 404 here, and a caller without
      // the permission 403. Neither is worth reporting: it just means there are
      // no vias to draw, and emptying is the truthful answer.
      //
      // Anything else is not. This read runs after every write, so a 502 from a
      // proxy, a dropped connection or a tab that has just gone offline used to
      // empty the map — and because the via list feeds the routing key, the whole
      // trip was then re-routed along the roads the traveller had steered away
      // from. Nothing said so, nothing retried, and it looked exactly like
      // having deleted them. The last known list is kept instead.
      const status = (err as { response?: { status?: number } } | null)?.response?.status
      if (status === 404 || status === 403) {
        setByDay(EMPTY)
        setTrackByDay(EMPTY_TRACKS)
        setStale(false)
        return
      }
      setStale(true)
    }
  }, [tripId, active, group])

  useEffect(() => { void reload() }, [reload])

  const add = useCallback(async (dayId: number, afterOrderIndex: number, lat: number, lng: number) => {
    if (!tripId) return
    await roadtripApi.addVia(tripId, dayId, { after_order_index: afterOrderIndex, lat, lng })
    await reload()
  }, [tripId, reload])

  const addMany = useCallback(async (
    dayId: number,
    vias: { after_order_index: number; lat: number; lng: number }[],
    replaceLegs?: number[],
    track?: { place_id: number; stray_km?: number | null } | null,
  ) => {
    if (!tripId) return
    // An empty chain with nothing to clear is not a write. It is a real call though, from
    // a track that thinned down to nothing on a very short day, and from a track that the
    // drive already followed — which still has a name to record.
    if (!vias.length && !replaceLegs?.length && track === undefined) return
    await roadtripApi.addVias(tripId, dayId, {
      vias,
      replace_legs: replaceLegs,
      ...(track === undefined ? {} : { track }),
    })
    await reload()
  }, [tripId, reload])

  const move = useCallback(async (dayId: number, id: number, lat: number, lng: number) => {
    if (!tripId) return
    await roadtripApi.moveVia(tripId, dayId, id, { lat, lng })
    await reload()
  }, [tripId, reload])

  const reanchor = useCallback(async (dayId: number, plan: Reanchoring) => {
    if (!tripId || isEmptyReanchoring(plan)) return
    await roadtripApi.reanchorVias(tripId, dayId, plan)
    await reload()
  }, [tripId, reload])

  const remove = useCallback(async (dayId: number, id: number) => {
    if (!tripId) return
    await roadtripApi.removeVia(tripId, dayId, id)
    await reload()
  }, [tripId, reload])

  return { byDay, trackByDay, stale, add, addMany, move, remove, reanchor }
}
