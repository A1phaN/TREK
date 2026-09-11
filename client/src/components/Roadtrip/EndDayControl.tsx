import { useState } from 'react'
import { Moon } from 'lucide-react'
import { useTranslation } from '../../i18n/TranslationContext'
import ToggleSwitch from '../Settings/ToggleSwitch'

export interface EndDayControlProps {
  active: boolean
  onToggle: () => Promise<void>
}

export default function EndDayControl({ active, onToggle }: EndDayControlProps) {
  const { t } = useTranslation()
  const [pending, setPending] = useState(false)
  return (
    <fieldset disabled={pending} aria-busy={pending} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-edge-faint bg-surface-secondary px-3 py-2.5 disabled:opacity-60">
      <span className="flex flex-1 items-center gap-2 text-caption font-medium text-content"><Moon size={15} className={`shrink-0 ${active ? 'text-accent-on' : 'text-content-faint'}`} aria-hidden />{t('roadtrip.window.endHere')}</span>
      <ToggleSwitch on={active} label={t('roadtrip.window.endHere')} onToggle={async () => {
        if (pending) return
        setPending(true)
        try { await onToggle() } finally { setPending(false) }
      }} />
    </fieldset>
  )
}
