import { RealtimeService } from '../realtime/realtime.service';
import { SettingsService } from '../settings/settings.service';
import { HttpException, Injectable } from '@nestjs/common';
import {
  ROADTRIP_PREFERENCE_KEYS,
  roadtripPreferencesSchema,
  roadtripPreferencesUpdateSchema,
  type RoadtripPreferences,
} from '@trek/shared';

@Injectable()
export class RoadtripPreferencesService {
  constructor(
    private readonly settings: SettingsService,
    private readonly realtime: RealtimeService,
  ) {}

  read(userId: number): RoadtripPreferences {
    const settings = this.settings.getUserSettings(userId);
    const preferences: Record<string, unknown> = {};
    for (const key of ROADTRIP_PREFERENCE_KEYS) {
      const parsed = roadtripPreferencesSchema.shape[key].safeParse(settings[key]);
      if (parsed.success && parsed.data !== undefined) preferences[key] = parsed.data;
    }
    return roadtripPreferencesSchema.parse(preferences);
  }

  update(userId: number, patch: RoadtripPreferences): RoadtripPreferences {
    const validated = roadtripPreferencesUpdateSchema.parse(patch);
    const next = { ...this.read(userId), ...validated };
    if (next.roadtrip_day_start && next.roadtrip_day_end && next.roadtrip_day_end <= next.roadtrip_day_start) {
      throw new HttpException({ error: 'Day end must be later than day start.' }, 400);
    }
    this.settings.bulkUpsertSettings(userId, validated);
    const saved = this.read(userId);
    this.realtime.broadcastToUser(userId, { type: 'roadtripPreferences:changed', preferences: saved });
    return saved;
  }
}
