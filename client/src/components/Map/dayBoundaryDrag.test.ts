import { expect, it, vi } from 'vitest'
import { bindDayBoundaryDrag } from './dayBoundaryDrag'
import type { RoadtripStop } from '../Roadtrip/useRoadtripRoutes'

function setup() {
  const el = document.createElement('span')
  document.body.append(el)
  const save = vi.fn(async () => true), setPosition = vi.fn(), unlock = vi.fn()
  const stop = (assignmentId: number, lng: number) => ({ assignmentId, lat: 0, lng }) as RoadtripStop
  const dispose = bindDayBoundaryDrag(el, { lat: 0, lng: 0.5, tone: 'default', nightPause: { day: 1, atPlace: false, manual: true, position: 0.5 } }, {
    path: [{ from: stop(1, 0), to: stop(2, 1), position: 0, line: [[0, 0], [0, 1]] }], move: save, hint: 'Move',
  }, { project: (lat, lng) => ({ x: lng * 1000, y: lat * 1000 }), setPosition, lock: () => unlock })
  const pointer = (node: EventTarget, type: string, x: number) => node.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: 0, bubbles: true, cancelable: true, button: 0 }))
  return { el, save, setPosition, unlock, dispose, pointer }
}

it('saves the snapped visit once on release and restores map dragging', async () => {
  const s = setup()
  s.pointer(s.el, 'pointerdown', 500)
  s.pointer(document, 'pointermove', 990)
  expect(s.save).not.toHaveBeenCalled()
  s.pointer(document, 'pointerup', 990)
  expect(s.save).toHaveBeenCalledWith(1, { day_number: 1, from_assignment_id: 2, to_assignment_id: null, fraction: 1 })
  expect(s.unlock).toHaveBeenCalledOnce()
  s.dispose()
})

it('escape cancels without saving and removes document handlers', () => {
  const s = setup()
  s.pointer(s.el, 'pointerdown', 500)
  s.pointer(document, 'pointermove', 300)
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  s.pointer(document, 'pointerup', 300)
  expect(s.save).not.toHaveBeenCalled()
  expect(s.setPosition).toHaveBeenLastCalledWith(0, 0.5)
  expect(s.unlock).toHaveBeenCalledOnce()
  s.dispose()
})

it('a right click clears the manual override and a click alone does not save', async () => {
  const s = setup()
  s.pointer(s.el, 'pointerdown', 500)
  s.pointer(document, 'pointerup', 500)
  expect(s.save).not.toHaveBeenCalled()
  s.el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
  expect(s.save).toHaveBeenCalledWith(1, null)
  s.dispose()
})
