import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App') // 👈 agrupa en Swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Retorna Hello World' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  getHello(): string {
    return this.appService.getHello();
  }
}