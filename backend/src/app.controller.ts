import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {

  @Get()
  @ApiOperation({ summary: 'Estado de la API' })
  @ApiResponse({ status: 200, description: 'API funcionando correctamente' })
  health() {
    return {
      status: 'ok',
      service: 'scraper-api',
    };
  }
}