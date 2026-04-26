import { Controller, Get, Query } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Scraper')
@Controller('scraper')
export class ScraperController {
    constructor(private readonly scraperService: ScraperService) { }

    @Get()
    @ApiOperation({ summary: 'Test del servicio de scraper' })
    getService(): string { return this.scraperService.getService(); }

    @Get('books/categories')
    @ApiOperation({ summary: 'Obtener categorías de libros' })
    getBooksCategories() { return this.scraperService.getBooksCategories(); }

    @Get('sii/datos-personales')
    @ApiOperation({ 
        summary: 'Obtener datos personales y tributarios del SII',
        description: 'Hace login en el SII y extrae todos los datos personales y tributarios del contribuyente. Si no se proporcionan los parámetros, usa las variables de entorno.'
    })
    @ApiQuery({ 
        name: 'rut', 
        required: false, 
        description: 'RUT del contribuyente (formato: 12345678-9). Si no se proporciona, usa RUT_TRIBUTARIO del .env',
        example: '12345678-9'
    })
    @ApiQuery({ 
        name: 'password', 
        required: false, 
        description: 'Contraseña del contribuyente. Si no se proporciona, usa PASS_TRIBUTARIO del .env',
        example: 'MiPassword123'
    })
    obtenerDatosPersonalesCompletos(
        @Query('rut') rut?: string,
        @Query('password') password?: string
    ) { 
        return this.scraperService.obtenerDatosPersonalesCompletos(rut, password); 
    }
}
