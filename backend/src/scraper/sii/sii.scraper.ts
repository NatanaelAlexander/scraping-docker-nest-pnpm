import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { BrowserlessUtil } from './browserless.util';
import { SiiParser } from './sii.parser';

@Injectable()
export class SiiScraper {
    private readonly RUT: string;
    private readonly PASSWORD: string;
    private readonly BROWSERLESS_TOKEN: string;
    private readonly browserless: BrowserlessUtil;

    constructor() {
        this.RUT = process.env.RUT_TRIBUTARIO?.replace('-', '').slice(0, -1) || '';
        const rutCompleto = process.env.RUT_TRIBUTARIO || '';
        this.PASSWORD = process.env.PASS_TRIBUTARIO || '';
        this.BROWSERLESS_TOKEN = process.env.TOKEN_BROWSLESS || '';

        if (!this.RUT || !this.PASSWORD) {
            console.warn('⚠️ ADVERTENCIA: Variables de entorno RUT_TRIBUTARIO o PASS_TRIBUTARIO no configuradas');
        }

        if (!this.BROWSERLESS_TOKEN) {
            console.warn('⚠️ ADVERTENCIA: Variable de entorno TOKEN_BROWSLESS no configurada');
        }

        this.browserless = new BrowserlessUtil(this.BROWSERLESS_TOKEN);

        console.log('✅ SiiScraper inicializado');
        console.log('👤 RUT configurado:', rutCompleto ? rutCompleto.slice(0, 5) + '***' : 'NO CONFIGURADO');
        console.log('🔑 Token Browserless:', this.BROWSERLESS_TOKEN ? 'CONFIGURADO' : 'NO CONFIGURADO');
    }

    async obtenerDatosPersonalesCompletos(rut?: string, password?: string) {
        console.log('🚀 Obteniendo datos personales completos...');

        try {
            if (!this.BROWSERLESS_TOKEN) {
                throw new Error('TOKEN_BROWSLESS no está configurado');
            }

            const rutToUse = rut || process.env.RUT_TRIBUTARIO;
            const passwordToUse = password || this.PASSWORD;

            if (!rutToUse || !passwordToUse) {
                throw new Error('RUT y contraseña son requeridos. Proporciónalos como parámetros o configúralos en las variables de entorno (RUT_TRIBUTARIO y PASS_TRIBUTARIO)');
            }

            console.log('👤 RUT a usar:', rutToUse);

            const result = await this.browserless.obtenerDatosPersonales(
                rutToUse,
                passwordToUse
            );

            console.log('✅ Click en "Datos personales" realizado');
            console.log('📦 Acordeones expandidos:', result.accordionsExpanded);
            console.log('📏 Largo del HTML de box_right:', result.boxRightHtml?.length || 0, 'caracteres');

            const datosExtraidos = SiiParser.extraerDatosPersonales(result.boxRightHtml || '');

            console.log('\n╔════════════════════════════════════════════════════════════════╗');
            console.log('║     📋 DATOS PERSONALES Y TRIBUTARIOS - SII                   ║');
            console.log('╚════════════════════════════════════════════════════════════════╝\n');

            if (datosExtraidos.direcciones.length > 0) {
                console.log('📍 ══════════ DIRECCIONES VIGENTES ══════════');
                datosExtraidos.direcciones.forEach((dir, index) => {
                    console.log(`\n  ${index + 1}. ${dir.tipoDireccion}`);
                    console.log(`     📌 Código Sucursal: ${dir.codigoSucursal}`);
                    console.log(`     📍 Dirección: ${dir.direccion}`);
                    console.log(`     📅 A partir de: ${dir.aPartirDe}`);
                });
                console.log('\n');
            } else {
                console.log('📍 DIRECCIONES: No se encontraron direcciones\n');
            }

            if (datosExtraidos.telefonosCorreos.length > 0) {
                console.log('📞 ══════════ TELÉFONOS Y CORREOS ══════════');
                datosExtraidos.telefonosCorreos.forEach((item, index) => {
                    console.log(`\n  ${index + 1}. ${item.tipo}`);
                    console.log(`     📱 Valor: ${item.valor}`);
                });
                console.log('\n');
            }

            if (datosExtraidos.secciones.length > 0) {
                console.log('📂 ══════════ TODAS LAS SECCIONES ══════════');
                datosExtraidos.secciones.forEach((seccion, index) => {
                    console.log(`\n  ${index + 1}. 📄 ${seccion.titulo}`);
                    console.log(`     🆔 ID: ${seccion.id}`);
                    console.log(`     📏 Largo contenido: ${seccion.contenidoHtml.length} caracteres`);
                    console.log(`     📝 Preview texto (primeros 200 caracteres):`);
                    console.log(`     ${seccion.contenidoTexto.slice(0, 200)}${seccion.contenidoTexto.length > 200 ? '...' : ''}`);
                });
                console.log('\n');
            }

            console.log('╔════════════════════════════════════════════════════════════════╗');
            console.log('║                      ✅ EXTRACCIÓN COMPLETA                    ║');
            console.log(`║     Total de secciones extraídas: ${datosExtraidos.secciones.length.toString().padStart(2, '0')}                        ║`);
            console.log('╚════════════════════════════════════════════════════════════════╝\n');

            return {
                success: true,
                clickTime: result.clickDatosPersonalesTime,
                accordionsExpanded: result.accordionsExpanded,
                datosExtraidos,
                boxRightHtml: result.boxRightHtml,
                boxRightLength: result.boxRightHtml?.length || 0,
                screenshot: result.screenshot,
            };

        } catch (error: any) {
            console.error('\n❌ ERROR obteniendo datos personales');
            console.error('❌ Error:', error.message);

            return {
                success: false,
                error: error.message,
                stack: error.stack,
            };
        }
    }
}