import type { RoadtripHazard } from '@trek/shared'
import type { Feature, Geometry } from 'geojson'

export function hazardFeature(hazard: RoadtripHazard): Feature {
  return { type: 'Feature', properties: { id: hazard.id }, geometry: hazard.geometry as Geometry }
}

export function hazardPopup(hazard: RoadtripHazard, note: string, pointNote: string): HTMLDivElement {
  const box = document.createElement('div')
  box.className = 'flex max-w-xs flex-col gap-2 text-caption text-content'
  const title = document.createElement('strong')
  title.textContent = hazard.title
  const details = document.createElement('p')
  details.textContent = hazard.description
  const timestamp = document.createElement('p')
  timestamp.textContent = `${hazard.source}: ${new Date(hazard.updatedAt).toLocaleString()}`
  const caution = document.createElement('p')
  caution.textContent = hazard.geometry.type === 'Point' ? `${pointNote} ${note}` : note
  const source = document.createElement('a')
  source.textContent = hazard.source
  source.href = hazard.url
  source.target = '_blank'
  source.rel = 'noopener noreferrer'
  source.className = 'text-accent-on underline'
  box.append(title, details, timestamp, caution, source)
  return box
}
