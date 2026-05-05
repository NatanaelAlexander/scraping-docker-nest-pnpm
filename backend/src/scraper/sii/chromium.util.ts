import puppeteer, { type Browser, type Page } from 'puppeteer';

const SII_LOGIN_URL =
    'https://zeusr.sii.cl/AUT2000/InicioAutenticacion/IngresoRutClave.html?https://misiir.sii.cl/cgi_misii/siihome.cgi';

/** Mensaje unificado ante credenciales inválidas o sesión que no llegó al portal esperado */
export const SII_LOGIN_FALLIDO_MSJ =
    'No fue posible iniciar sesión en el SII con los datos proporcionados, favor de revisar datos ingresados.';

export class ChromiumUtil {
    constructor() {}

    getExecutablePath(): string {
        return process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser';
    }

    getProtocolTimeoutMs(): number {
        return Number(process.env.PUPPETEER_PROTOCOL_TIMEOUT_MS || '90000');
    }

    private async sleep(ms: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async getTextOrEmpty(page: Page, selector: string) {
        const element = await page.$(selector);
        if (!element) return '';
        const text = await page.$eval(selector, (el) => (el.textContent || '').trim());
        return text || '';
    }

    private async createBrowser(): Promise<Browser> {
        const protocolTimeoutMs = this.getProtocolTimeoutMs();
        return puppeteer.launch({
            headless: true,
            executablePath: this.getExecutablePath(),
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            timeout: protocolTimeoutMs,
        });
    }

    async verificarDisponibilidad(): Promise<{
        ok: boolean;
        executablePath: string;
        timeoutMs: number;
        error?: string;
    }> {
        const executablePath = this.getExecutablePath();
        const timeoutMs = this.getProtocolTimeoutMs();
        try {
            const browser = await this.createBrowser();
            await browser.close();
            return { ok: true, executablePath, timeoutMs };
        } catch (error: any) {
            return {
                ok: false,
                executablePath,
                timeoutMs,
                error: error?.message ?? String(error),
            };
        }
    }

    private async setupPageForSpeed(page: Page) {
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (
                resourceType === 'image' ||
                resourceType === 'media' ||
                resourceType === 'font' ||
                resourceType === 'stylesheet'
            ) {
                request.abort();
                return;
            }
            request.continue();
        });
    }

    async obtenerDatosPersonales(rut: string, password: string) {
        const browser = await this.createBrowser();

        try {
            const page = await browser.newPage();
            page.setDefaultTimeout(Number(process.env.PUPPETEER_PROTOCOL_TIMEOUT_MS || '90000'));
            await this.setupPageForSpeed(page);

            await page.goto(SII_LOGIN_URL, { waitUntil: 'domcontentloaded' });
            await page.type('#rutcntr', rut);
            await page.type('#clave', password);
            await page.click("#bt_ingresar, button[type='submit'], input[type='submit']");
            await this.sleep(3000);

            const loginOk = await page.evaluate(() => {
                try {
                    const nombre = (document.querySelector('#nameCntr')?.textContent || '').trim();
                    const menuDatos = document.querySelector('#menu_datos_contribuyente');
                    if (nombre.length > 0 && menuDatos) return true;

                    const rutInput = document.querySelector('#rutcntr');
                    const passInput = document.querySelector('#clave');
                    const formularioLogin = !!(rutInput && passInput);
                    if (formularioLogin && nombre.length === 0) return false;

                    return nombre.length > 0;
                } catch {
                    return false;
                }
            });

            if (!loginOk) {
                throw new Error(SII_LOGIN_FALLIDO_MSJ);
            }

            const menuDatos = await page.$('#menu_datos_contribuyente');
            if (menuDatos) {
                await page.click('#menu_datos_contribuyente');
            }
            await this.sleep(1500);

            const accordionResult = await page.evaluate(() => {
                try {
                    const accordions = document.querySelectorAll('[data-toggle="collapse"]');
                    let expanded = 0;
                    accordions.forEach((accordion) => {
                        const target =
                            accordion.getAttribute('href') || accordion.getAttribute('data-target');
                        if (target) {
                            const panel = document.querySelector(target);
                            if (panel && !panel.classList.contains('in')) {
                                (accordion as HTMLElement).click();
                                expanded++;
                            }
                        }
                    });
                    return { totalAccordions: accordions.length, expanded, error: null };
                } catch (e: any) {
                    return { totalAccordions: 0, expanded: 0, error: e?.message ?? 'error' };
                }
            });

            await this.sleep(1000);

            const boxRightEl = await page.$('#box_right');
            const boxRightHtml = boxRightEl ? await page.$eval('#box_right', (el) => el.innerHTML) : '';

            const datosBasicos = {
                razonSocial: await this.getTextOrEmpty(page, '#nameCntr'),
                rut: await this.getTextOrEmpty(page, '#rutCntr'),
                domicilio: await this.getTextOrEmpty(page, '#domiCntr'),
                correoElectronico: await this.getTextOrEmpty(page, '#mailCntr'),
                regimenTributario: await this.getTextOrEmpty(page, '#box_user_info .icon_user_info'),
            };

            return {
                clickDatosPersonalesTime: 0,
                accordionsExpanded: accordionResult.expanded,
                totalAccordions: accordionResult.totalAccordions,
                datosBasicos,
                boxRightHtml,
            };
        } finally {
            await browser.close();
        }
    }
}
