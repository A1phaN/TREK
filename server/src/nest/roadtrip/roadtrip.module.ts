import { Module } from '@nestjs/common';
import { RoadtripController } from './roadtrip.controller';
import { RoadtripService } from './roadtrip.service';
import { RoadtripMcp } from './roadtrip.mcp';
import { McpSharedModule } from '../mcp-shared/mcp-shared.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AddonsModule } from '../addons/addons.module';
import { DayBoundariesController } from './day-boundaries.controller';
import { DayBoundariesService } from './day-boundaries.service';
import { DayBoundariesMcp } from './day-boundaries.mcp';
import { SettingsModule } from '../settings/settings.module';
import { RoadtripPreferencesService } from './roadtrip-preferences.service';
import { RoadtripPreferencesMcp } from './roadtrip-preferences.mcp';
import { RoadtripRouterService } from './roadtrip-router.service';
import { RoadtripPlanService } from './roadtrip-plan.service';
import { RoadtripPlanningMcp } from './roadtrip-planning.mcp';
import { PluginsRuntimeModule } from '../plugins/plugins-runtime.module';
import { MapsModule } from '../maps/maps.module';

/** Road trip domain (#1797): the points a drive is routed through. Registered in AppModule. */
@Module({
  // McpShared brings the tool guards, Auth the demo check, Permissions the trip guard,
  // Addons the enabled-check the MCP tools gate on (the controller has @RequireAddon).
  imports: [McpSharedModule, PermissionsModule, AuthModule, AddonsModule, RealtimeModule, SettingsModule, PluginsRuntimeModule, MapsModule],
  controllers: [RoadtripController, DayBoundariesController],
  providers: [RoadtripService, RoadtripMcp, DayBoundariesService, DayBoundariesMcp, RoadtripPreferencesService, RoadtripPreferencesMcp, RoadtripRouterService, RoadtripPlanService, RoadtripPlanningMcp],
  exports: [RoadtripService],
})
export class RoadtripModule {}
