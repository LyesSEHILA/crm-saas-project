import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // Cette route unique va permettre au Frontend de récupérer tous les indicateurs clés (KPIs)
  @Get()
  findAll() {
    return this.statsService.getSummary();
  }
}