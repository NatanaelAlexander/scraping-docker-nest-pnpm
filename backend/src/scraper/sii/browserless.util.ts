/**
 * Cliente para interactuar con Browserless.io API
 * Documentación: https://docs.browserless.io/
 */

const BROWSERLESS_ENDPOINT = 'https://production-sfo.browserless.io/chromium/bql';

export class BrowserlessUtil {
    private readonly token: string;

    constructor(token: string) {
        this.token = token;
    }

    async executeQuery(query: string, variables: Record<string, any> = {}) {
        try {
            const response = await fetch(`${BROWSERLESS_ENDPOINT}?token=${this.token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Browserless error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();

            if (result.errors) {
                console.error('❌ Errores de BrowserQL:', result.errors);
                throw new Error(`BrowserQL errors: ${JSON.stringify(result.errors)}`);
            }

            return result.data;

        } catch (error: any) {
            console.error('❌ Error ejecutando query:', error.message);
            throw error;
        }
    }

    async takeScreenshot(url: string): Promise<{ status: number; base64: string }> {
        const query = `
            mutation Screenshot($url: String!) {
                goto(url: $url, waitUntil: load) {
                    status
                }
                screenshot(type: jpeg) {
                    base64
                }
            }
        `;

        const data = await this.executeQuery(query, { url });

        return {
            status: data.goto.status,
            base64: data.screenshot.base64
        };
    }

    async getPageContent(url: string): Promise<{ status: number; title: string; content: string }> {
        const query = `
            mutation GetContent($url: String!) {
                goto(url: $url, waitUntil: networkidle) {
                    status
                }
                title
                content
            }
        `;

        const data = await this.executeQuery(query, { url });

        return {
            status: data.goto.status,
            title: data.title,
            content: data.content
        };
    }

    async loginSII(rut: string, password: string) {
        const query = `
            mutation SIILogin($url: String!, $rut: String!, $password: String!) {
                goto(url: $url, waitUntil: domContentLoaded) {
                    status
                    time
                }
                
                typeRut: type(selector: "#rutcntr", text: $rut) {
                    time
                    selector
                }
                
                typePassword: type(selector: "#clave", text: $password) {
                    time
                    selector
                }
                
                clickLogin: click(selector: "#bt_ingresar, button[type='submit'], input[type='submit']") {
                    time
                    x
                    y
                }
                
                waitForTimeout(time: 5000) {
                    time
                }
                
                pageText: text {
                    text
                }
                
                pageHtml: html {
                    html
                }
                
                screenshot(type: jpeg) {
                    base64
                }
            }
        `;

        const variables = {
            url: 'https://zeusr.sii.cl/AUT2000/InicioAutenticacion/IngresoRutClave.html?https://misiir.sii.cl/cgi_misii/siihome.cgi',
            rut,
            password
        };

        const data = await this.executeQuery(query, variables);

        return {
            gotoTime: data.goto.time,
            gotoStatus: data.goto.status,
            typeRutTime: data.typeRut.time,
            typePasswordTime: data.typePassword.time,
            clickTime: data.clickLogin.time,
            pageText: data.pageText.text,
            content: data.pageHtml.html,
            screenshot: data.screenshot?.base64
        };
    }

    async obtenerDatosPersonales(rut: string, password: string) {
        const query = `
            mutation SIIGetDatosPersonales($url: String!, $rut: String!, $password: String!) {
                goto(url: $url, waitUntil: domContentLoaded) {
                    status
                }
                
                typeRut: type(selector: "#rutcntr", text: $rut) {
                    time
                }
                
                typePassword: type(selector: "#clave", text: $password) {
                    time
                }
                
                clickLogin: click(selector: "#bt_ingresar, button[type='submit'], input[type='submit']") {
                    time
                }
                
                waitAfterLogin: waitForTimeout(time: 5000) {
                    time
                }
                
                clickDatosPersonales: click(selector: "#menu_datos_contribuyente") {
                    time
                }
                
                waitAfterClick1: waitForTimeout(time: 3000) {
                    time
                }
                
                expandAccordions: evaluate(content: """
                (() => {
                    try {
                        const accordions = document.querySelectorAll('[data-toggle="collapse"]');
                        let expanded = 0;
                        
                        accordions.forEach(accordion => {
                            const target = accordion.getAttribute('href') || accordion.getAttribute('data-target');
                            if (target) {
                                const panel = document.querySelector(target);
                                if (panel && !panel.classList.contains('in')) {
                                    accordion.click();
                                    expanded++;
                                }
                            }
                        });
                        
                        return JSON.stringify({ 
                            totalAccordions: accordions.length, 
                            expanded: expanded,
                            error: null 
                        });
                    } catch (e) {
                        return JSON.stringify({ 
                            totalAccordions: 0, 
                            expanded: 0, 
                            error: e.message 
                        });
                    }
                })()
                """) {
                    value
                }
                
                waitAfterExpand: waitForTimeout(time: 2000) {
                    time
                }
                
                boxRightHtml: html(selector: "#box_right") {
                    html
                }
                
                screenshot(type: jpeg) {
                    base64
                }
            }
        `;

        const variables = {
            url: 'https://zeusr.sii.cl/AUT2000/InicioAutenticacion/IngresoRutClave.html?https://misiir.sii.cl/cgi_misii/siihome.cgi',
            rut,
            password
        };

        const data = await this.executeQuery(query, variables);

        let accordionResult = { totalAccordions: 0, expanded: 0, error: null };
        try {
            accordionResult = JSON.parse(data.expandAccordions.value);
        } catch (e) {
            console.warn('⚠️ No se pudo parsear el resultado de expandAccordions');
        }

        return {
            clickDatosPersonalesTime: data.clickDatosPersonales.time,
            accordionsExpanded: accordionResult.expanded,
            totalAccordions: accordionResult.totalAccordions,
            boxRightHtml: data.boxRightHtml.html,
            screenshot: data.screenshot?.base64
        };
    }
}
