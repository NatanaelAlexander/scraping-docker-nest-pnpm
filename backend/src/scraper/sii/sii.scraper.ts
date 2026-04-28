import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { BrowserlessUtil } from './browserless.util';
import { SiiParser } from './sii.parser';
import { DatosBasicosSII, DatosPersonalesCompletos } from './sii.types';

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
            console.warn('Variables de entorno RUT_TRIBUTARIO o PASS_TRIBUTARIO no configuradas');
        }

        if (!this.BROWSERLESS_TOKEN) {
            console.warn('Variable de entorno TOKEN_BROWSLESS no configurada');
        }

        this.browserless = new BrowserlessUtil(this.BROWSERLESS_TOKEN);
    }

    async obtenerDatosPersonalesCompletos(rut?: string, password?: string) {
        try {
            if (!this.BROWSERLESS_TOKEN) {
                throw new Error('TOKEN_BROWSLESS no está configurado');
            }

            const rutToUse = rut || process.env.RUT_TRIBUTARIO;
            const passwordToUse = password || this.PASSWORD;

            if (!rutToUse || !passwordToUse) {
                throw new Error('RUT y contraseña son requeridos');
            }

            const result = await this.browserless.obtenerDatosPersonales(
                rutToUse,
                passwordToUse
            );

            const datosBasicos: DatosBasicosSII = {
                rut: result.datosBasicos.rut,
                razonSocial: result.datosBasicos.razonSocial,
                domicilio: result.datosBasicos.domicilio,
                correoElectronico: result.datosBasicos.correoElectronico || 'No registra información',
                regimenTributario: result.datosBasicos.regimenTributario || 'No registra información',
            };

            const datosExtraidos = SiiParser.extraerDatosPersonales(result.boxRightHtml || '');

            return {
                success: true,
                datosBasicos,
                datosExtraidos,
            };

        } catch (error: any) {
            console.error('Error obteniendo datos personales:', error.message);

            return {
                success: false,
                error: error.message,
                stack: error.stack,
            };
        }
    }
}
