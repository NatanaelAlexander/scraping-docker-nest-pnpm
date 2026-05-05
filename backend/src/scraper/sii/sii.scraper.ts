import { Injectable } from '@nestjs/common';
import { ChromiumUtil, SII_LOGIN_FALLIDO_MSJ } from './chromium.util';
import type { SesionDatosContribuyenteCruda } from './sii.types';

export type ObtenerSesionContribuyenteResultado =
    | ({ success: true } & SesionDatosContribuyenteCruda)
    | { success: false; error: string; stack?: string };
export type VerificarChromiumResultado = {
    success: boolean;
    chromium: { ok: boolean; executablePath: string; timeoutMs: number; error?: string };
};

@Injectable()
export class SiiScraper {
    private readonly RUT: string;
    private readonly PASSWORD: string;
    private readonly chromium: ChromiumUtil;

    constructor() {
        this.RUT = process.env.RUT_TRIBUTARIO?.replace('-', '').slice(0, -1) || '';
        this.PASSWORD = process.env.PASS_TRIBUTARIO || '';

        if (!this.RUT || !this.PASSWORD) {
            console.warn('Variables de entorno RUT_TRIBUTARIO o PASS_TRIBUTARIO no configuradas');
        }

        this.chromium = new ChromiumUtil();
    }

    /** Solo I/O Chromium (login + HTML / textos sin transformar dominio). El parseo va en `SiiParser`. */
    async obtenerSesionDatosDelContribuyente(
        rut?: string,
        password?: string,
    ): Promise<ObtenerSesionContribuyenteResultado> {
        try {
            const rutToUse = rut || process.env.RUT_TRIBUTARIO;
            const passwordToUse = password || this.PASSWORD;

            if (!rutToUse || !passwordToUse) {
                throw new Error('RUT y contraseña son requeridos');
            }

            const result = await this.chromium.obtenerDatosPersonales(rutToUse, passwordToUse);
            return {
                success: true,
                datosBasicos: result.datosBasicos,
                boxRightHtml: result.boxRightHtml || '',
            };
        } catch (error: any) {
            const message = error?.message ?? String(error);
            console.error('Error en sesión datos contribuyente SII (Chromium):', message);
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

    async verificarChromiumDisponible(): Promise<VerificarChromiumResultado> {
        const result = await this.chromium.verificarDisponibilidad();
        if (result.ok) {
            return {
                success: true,
                chromium: result,
            };
        }
        return {
            success: false,
            chromium: result,
        };
    }
}
