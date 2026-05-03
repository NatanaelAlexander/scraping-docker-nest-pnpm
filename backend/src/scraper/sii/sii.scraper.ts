import { Injectable } from '@nestjs/common';
import { BrowserlessUtil, SII_LOGIN_FALLIDO_MSJ } from './browserless.util';
import type { SesionDatosContribuyenteCruda } from './sii.types';

export type ObtenerSesionContribuyenteResultado =
    | ({ success: true } & SesionDatosContribuyenteCruda)
    | { success: false; error: string; stack?: string };

@Injectable()
export class SiiScraper {
    private readonly RUT: string;
    private readonly PASSWORD: string;
    private readonly BROWSERLESS_TOKEN: string;
    private readonly browserless: BrowserlessUtil;

    constructor() {
        this.RUT = process.env.RUT_TRIBUTARIO?.replace('-', '').slice(0, -1) || '';
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

    /** Solo I/O Browserless (login + HTML / textos sin transformar doménio). El parseo va en `SiiParser`. */
    async obtenerSesionDatosDelContribuyente(
        rut?: string,
        password?: string,
    ): Promise<ObtenerSesionContribuyenteResultado> {
        try {
            if (!this.BROWSERLESS_TOKEN) {
                throw new Error('TOKEN_BROWSLESS no está configurado');
            }

            const rutToUse = rut || process.env.RUT_TRIBUTARIO;
            const passwordToUse = password || this.PASSWORD;

            if (!rutToUse || !passwordToUse) {
                throw new Error('RUT y contraseña son requeridos');
            }

            const result = await this.browserless.obtenerDatosPersonales(rutToUse, passwordToUse);
            return {
                success: true,
                datosBasicos: result.datosBasicos,
                boxRightHtml: result.boxRightHtml || '',
            };
        } catch (error: any) {
            const message = error?.message ?? String(error);
            console.error('Error en sesión datos contribuyente SII (Browserless):', message);
            if (message === SII_LOGIN_FALLIDO_MSJ) {
                return { success: false, error: message };
            }
            return {
                success: false,
                error: message,
                stack: error.stack,
            };
        }
    }
}
