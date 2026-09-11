import { ADDON_IDS } from '../../addons';
import {
  McpController,
  Tool,
  TOOL_ANNOTATIONS_READONLY,
  TOOL_ANNOTATIONS_WRITE,
  demoDenied,
  ok,
  type McpContext,
} from '../../nest-mcp';
import { addonGate } from '../addons/addon-gate';
import { AddonsService } from '../addons/addons.service';
import { AuthService } from '../auth/auth.service';
import { RoadtripPreferencesService } from './roadtrip-preferences.service';
import { roadtripPreferencesUpdateSchema, type RoadtripPreferences } from '@trek/shared';

const when = addonGate(ADDON_IDS.ROADTRIP);

@McpController()
export class RoadtripPreferencesMcp {
  constructor(
    private readonly preferences: RoadtripPreferencesService,
    private readonly auth: AuthService,
    readonly addons: AddonsService,
  ) {}

  @Tool({
    name: 'get_roadtrip_settings',
    description:
      'Read your personal driving preferences, including daily start and end times, day-ending behavior, vehicle specifications, range, fill percentage, driving limits, avoided road classes and route display options. These preferences apply to all your trips, not to other travellers. Missing numbers mean no limit, missing daily times disable automatic scheduling, missing vehicle means unspecified, and missing end mode means route. Range and consumption always use kilometres, litres and kWh. Instance URLs and credentials are not exposed.',
    inputSchema: {},
    annotations: TOOL_ANNOTATIONS_READONLY,
    access: { group: 'settings', mode: 'read' },
    when,
  })
  async read(_input: Record<string, never>, ctx: McpContext) {
    return ok({ settings: this.preferences.read(ctx.userId), scope: 'current_user' });
  }

  @Tool({
    name: 'update_roadtrip_settings',
    description:
      'Change personal driving preferences for all your trips. Read get_roadtrip_settings first for relative changes. Daily times use HH:mm; clear either with an empty string to disable automatic daily scheduling. Fixed visit times retain priority. Numeric zero clears a limit. Vehicle specifications take precedence over manual range when complete; clear the relevant specifications to use a manual range. Avoid classes are a comma-separated selection of toll,motorway,ferry. Unspecified fields remain unchanged. End mode route pauses at the cutoff; stop ends at the last reachable visit. Per-visit end_day and dragged boundaries are edited with set_assignment_end_day and set_day_boundary. This never changes instance routing URLs or credentials.',
    inputSchema: { settings: roadtripPreferencesUpdateSchema },
    annotations: TOOL_ANNOTATIONS_WRITE,
    access: { group: 'settings', mode: 'write' },
    when,
  })
  async update({ settings }: { settings: RoadtripPreferences }, ctx: McpContext) {
    if (this.auth.isDemoUser(ctx.userId)) return demoDenied();
    return ok({ settings: this.preferences.update(ctx.userId, settings), scope: 'current_user' });
  }
}
