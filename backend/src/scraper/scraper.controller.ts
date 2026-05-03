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

    @Get('sii/datos-basicos')
    @ApiOperation({
        summary: 'Obtener datos básicos del contribuyente (SII)',
        description:
            'Inicia sesión y devuelve RUT, razón social, domicilio, correo y régimen tributario. Si omites rut/password, usa RUT_TRIBUTARIO y PASS_TRIBUTARIO del entorno.',
    })
    @ApiQuery({
        name: 'rut',
        required: false,
        description: 'RUT del contribuyente (ej. 12345678-9). Por defecto: RUT_TRIBUTARIO',
        example: '12345678-9',
    })
    @ApiQuery({
        name: 'password',
        required: false,
        description: 'Contraseña. Por defecto: PASS_TRIBUTARIO',
        example: 'MiPassword123',
    })
    obtenerDatosBasicos(@Query('rut') rut?: string, @Query('password') password?: string) {
        return this.scraperService.obtenerDatosBasicos(rut, password);
    }

    @Get('sii/datos-personales')
    @ApiOperation({
        summary: 'Datos del contribuyente (básicos + tablas personales/tributarias)',
        description:
            'Orquestación: llama al servicio de datos básicos y al de datos personales (tablas #box_right) y arma la respuesta unificada. Son dos ejecuciones Browserless independientes.',
    })
    @ApiQuery({
        name: 'rut',
        required: false,
        description: 'RUT del contribuyente (ej. 12345678-9). Por defecto: RUT_TRIBUTARIO',
        example: '12345678-9',
    })
    @ApiQuery({
        name: 'password',
        required: false,
        description: 'Contraseña. Por defecto: PASS_TRIBUTARIO',
        example: 'MiPassword123',
    })
    async obtenerDatosPersonalesCompletos(
        @Query('rut') rut?: string,
        @Query('password') password?: string,
    ) {
        const datosBasicosRes = await this.scraperService.obtenerDatosBasicos(rut, password);
        if (!datosBasicosRes.success) {
            return datosBasicosRes;
        }
        const datosExtraidosRes = await this.scraperService.obtenerDatosPersonalesExtraidos(
            rut,
            password,
        );
        if (!datosExtraidosRes.success) {
            return datosExtraidosRes;
        }
        return {
            success: true,
            datosBasicos: datosBasicosRes.datosBasicos,
            datos_personales_tributarios:
                datosExtraidosRes.datosExtraidos.datosPersonales,
        };
    }
}
