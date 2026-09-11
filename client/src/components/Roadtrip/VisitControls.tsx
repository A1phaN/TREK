import { Clock, Pencil } from 'lucide-react'
import EndDayControl, { type EndDayControlProps } from './EndDayControl'
import { useTranslation } from '../../i18n/TranslationContext'
import { formatDurationShort } from './roadtripModel'

export interface RoadtripStayControl {
  minutes: number | null
  onEdit?: () => void
}

export default function VisitControls({ endDay, stay }: { endDay?: EndDayControlProps; stay?: RoadtripStayControl }) {
  const { t } = useTranslation()
  return (
    <div className={`grid gap-2 ${endDay && stay ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {endDay && <EndDayControl {...endDay} />}
      {stay && <button type="button" onClick={stay.onEdit} disabled={!stay.onEdit}
        className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-edge-faint bg-surface-secondary px-3 py-2.5 text-start enabled:hover:bg-surface-hover disabled:cursor-default">
        <span className="flex items-center gap-2 text-caption font-medium uppercase text-content"><Clock size={15} className="shrink-0 text-content-faint" aria-hidden />{t('roadtrip.stop.stayShort')}</span>
        {' '}<span className="flex shrink-0 items-center gap-2 text-caption font-medium text-content">
          {formatDurationShort((stay.minutes ?? 0) * 60)}{stay.onEdit && <Pencil size={12} className="text-content-faint" aria-hidden />}
        </span>
      </button>}
    </div>
  )
}
