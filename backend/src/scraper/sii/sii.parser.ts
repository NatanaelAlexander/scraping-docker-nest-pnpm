export interface DatosBasicosSII {
    rut: string;
    razonSocial: string;
    domicilio: string;
    correoElectronico: string;
    regimenTributario: string;
}

export interface DireccionSII {
    codigoSucursal: string;
    tipoDireccion: string;
    direccion: string;
    aPartirDe: string;
}

export interface TelefonoCorreoSII {
    tipo: string;
    valor: string;
}

export interface SeccionSII {
    id: string;
    titulo: string;
    contenidoTexto: string;
    contenidoHtml: string;
}

export interface DatosPersonalesCompletos {
    direcciones: DireccionSII[];
    telefonosCorreos: TelefonoCorreoSII[];
    secciones: SeccionSII[];
}

export class SiiParser {
    static extraerDatosBasicos(texto: string): DatosBasicosSII | null {
        const datos: Partial<DatosBasicosSII> = {};

        const rutMatch = texto.match(/RUT:\s*(\d{1,2}\.\d{3}\.\d{3}-[\dkK]|\d{7,8}-[\dkK])/i);
        if (rutMatch) {
            datos.rut = rutMatch[1].replace(/\./g, '');
        }

        const razonSocialMatch = texto.match(/Nombre o razón social:\s*([^\n]+)/i);
        if (razonSocialMatch) {
            datos.razonSocial = razonSocialMatch[1].trim();
        }

        const domicilioMatch = texto.match(/Domicilio:\s*([^\n]+)/i);
        if (domicilioMatch) {
            datos.domicilio = domicilioMatch[1].trim();
        }

        const correoMatch = texto.match(/Correo electrónico:\s*([^\s]+@[^\s]+)/i);
        if (correoMatch) {
            datos.correoElectronico = correoMatch[1].trim();
        }

        const regimenMatch = texto.match(/REGIMEN\s+([^(]+)\s*\(([^)]+)\)/i);
        if (regimenMatch) {
            datos.regimenTributario = `${regimenMatch[1].trim()} (${regimenMatch[2].trim()})`;
        }

        if (!datos.rut) {
            return null;
        }

        return datos as DatosBasicosSII;
    }

    static extraerDatosPersonales(html: string): DatosPersonalesCompletos {
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);

        const resultado: DatosPersonalesCompletos = {
            direcciones: [],
            telefonosCorreos: [],
            secciones: [],
        };

        const titulosDeseados = [
            'Direcciones',
            'Teléfonos y Correos electrónicos',
            'Inicio de actividades y término de giro',
            'Estado de cumplimiento de las obligaciones tributarias',
            'Representantes legales',
            'Socios y Capital',
            'Actividades económicas',
            'Sociedades a las que pertenece el contribuyente',
            'Características del contribuyente',
            'Apoderados de Grupos Empresariales',
            'Documentos tributarios autorizados',
            'Bienes Raíces',
            'Oficina del SII para trámites presenciales',
        ];

        $('#tablaDirecciones tr').each((i, row) => {
            const $row = $(row);
            const codigoSucursal = $row.find('td[data-title="Código Sucursal"]').text().trim();
            const tipoDireccion = $row.find('td[data-title="Tipo Dirección"]').text().trim();
            const direccion = $row.find('td[data-title="Dirección"]').text().trim();
            const aPartirDe = $row.find('td[data-title="A partir de"]').text().trim();

            if (codigoSucursal) {
                resultado.direcciones.push({
                    codigoSucursal,
                    tipoDireccion,
                    direccion,
                    aPartirDe,
                });
            }
        });

        $('#tablaDatosTelefonos tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            if (celdas.length >= 2) {
                const tipo = $(celdas[0]).find('b').text().trim() || $(celdas[0]).text().trim();
                const valor = $(celdas[1]).text().trim();
                
                if (tipo && valor && valor !== 'No registra información') {
                    resultado.telefonosCorreos.push({
                        tipo,
                        valor,
                    });
                }
            }
        });

        const seccionesEncontradas: { [key: string]: SeccionSII } = {};

        $('.panel.panel-default').each((i, panel) => {
            const $panel = $(panel);
            const tituloCompleto = $panel.find('.panel-heading h4 a').text().trim();
            const collapseHref = $panel.find('.panel-heading h4 a').attr('href');
            const collapseId = collapseHref ? collapseHref.replace('#', '') : '';
            
            if (collapseId && tituloCompleto) {
                const $contenido = $panel.find(`#${collapseId}`);
                const contenidoHtml = $contenido.html() || '';
                const contenidoTexto = $contenido.text().replace(/\s+/g, ' ').trim();
                
                seccionesEncontradas[tituloCompleto] = {
                    id: collapseId,
                    titulo: tituloCompleto,
                    contenidoTexto: contenidoTexto,
                    contenidoHtml: contenidoHtml,
                };
            }
        });

        titulosDeseados.forEach(titulo => {
            if (seccionesEncontradas[titulo]) {
                resultado.secciones.push(seccionesEncontradas[titulo]);
            }
        });

        return resultado;
    }
}
