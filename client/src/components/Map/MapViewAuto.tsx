import { Suspense } from 'react'
import { AlertTriangle, Clock, Info } from 'lucide-react'
import { Tooltip } from '../shared/Tooltip'
import { useSettingsStore } from '../../store/settingsStore'
import { MapView } from './MapView'
import ErrorBoundary from '../shared/ErrorBoundary'
import { MapViewGLMapbox, MapViewGLMaplibre } from './glLazy'
import { useRoadtripHazards } from './useRoadtripHazards'
import { useTranslation } from '../../i18n/TranslationContext'

// Auto-selects the map renderer based on user settings. Keeps the existing
// Leaflet MapView untouched so the Mapbox GL variant can mature iteratively
// behind a toggle. Atlas is not affected — it imports Leaflet directly.
//
// Offline maps: only the Leaflet renderer supports full pre-download (raster
// tiles via sync/tilePrefetcher.ts). GL maps are best-effort offline — their
// vector tiles are cached opportunistically by the Service Worker as you view
// them online (see the GL tile rules in vite.config.js), not prefetched.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MapViewAuto(props: any) {
  const { t } = useTranslation()
  const hazards = useRoadtripHazards(props.tripId, !!props.clusterLoosely)
  const mapProps = { ...props, hazards: hazards.feed?.hazards }
  const status = hazards.enabled ? <div role="status" className="absolute bottom-10 left-1/2 z-[500] flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-edge-faint bg-surface-card px-3 py-2 text-caption text-content shadow-md">
    {hazards.status !== 'ready' ? t(`roadtrip.hazards.${hazards.status}`) : <>
      <span className="flex items-center gap-2 whitespace-nowrap font-medium">
        <AlertTriangle size={14} className="text-content-muted" aria-hidden />
        {t('roadtrip.hazards.current')}
      </span>
      <span className="flex items-center gap-1 whitespace-nowrap tabular-nums text-content-muted">
        <Clock size={12} aria-hidden />
        {new Date(hazards.feed!.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <span className="flex items-center gap-1.5">
        {hazards.feed!.sources.map(source => <Tooltip key={source.source} placement="top"
          label={source.status === 'ok' ? source.source : `${source.source}: ${t(`roadtrip.hazards.${source.status}`)}`}>
          <span tabIndex={0} className={`inline-flex items-center gap-1 rounded-md bg-surface-secondary px-2 py-1 font-medium ${source.status === 'ok' ? 'text-content-secondary' : 'text-warning'}`}>
            {source.source}
            {source.status !== 'ok' && <Info size={12} aria-label={t(`roadtrip.hazards.${source.status}`)} />}
          </span>
        </Tooltip>)}
      </span>
    </>}
  </div> : null
  const provider = useSettingsStore(s => s.settings.map_provider)
  const token = useSettingsStore(s => s.settings.mapbox_access_token)
  // Fall back to Leaflet when Mapbox is selected but no token is set,
  // so trip planner never shows an empty map due to a missing token.
  const glProvider = provider === 'maplibre-gl' ? 'maplibre-gl'
    : provider === 'mapbox-gl' && token ? 'mapbox-gl'
    : null
  // One chunk per engine: picking the binding here is what keeps mapbox-gl and
  // maplibre-gl out of each other's downloads.
  const MapViewGL = glProvider === 'maplibre-gl' ? MapViewGLMaplibre : MapViewGLMapbox
  if (glProvider) {
    // Render the previous Leaflet map as the fallback so there's no blank flash
    // while the GL chunk loads on first use.
    return (
      // Outside the Suspense on purpose: Suspense handles the pending promise,
      // a rejected one (chunk gone after a deploy) throws past it. Falling back
      // to Leaflet keeps a usable map instead of an error card.
      // resetKeys: with two engine chunks, a failure under one provider must not
      // keep showing Leaflet after the user switches to the other.
      <><ErrorBoundary boundaryId="map:gl" resetKeys={[glProvider]} fallback={<MapView {...mapProps} />}>
        <Suspense fallback={<MapView {...mapProps} />}>
          <MapViewGL {...mapProps} glProvider={glProvider} />
        </Suspense>
      </ErrorBoundary>{status}</>
    )
  }
  return <><MapView {...mapProps} />{status}</>
}
