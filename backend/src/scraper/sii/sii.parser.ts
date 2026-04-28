import {
    DatosPersonalesCompletos,
    SeccionSII,
} from './sii.types';

export class SiiParser {
    static extraerDatosPersonales(html: string): DatosPersonalesCompletos {
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);

        const resultado: DatosPersonalesCompletos = {
            datosPersonales: {
                direcciones: { titulos: [], filas: [] },
                telefonosCorreos: { titulos: ['Tipo', 'Valor'], filas: [] },
                inicioActividadesGiro: { titulos: [], filas: [] },
                estadoCumplimientoTributario: { estadoGeneral: '', titulos: [], filas: [] },
                representantesLegales: { formaActuacion: '', titulos: [], filas: [] },
                sociosCapital: {
                    titulos: [],
                    filas: [],
                    subtotales: { capitalEnterado: '', capitalPorEnterar: '', porcentajeCapital: '', porcentajeUtilidades: '' },
                    capitalTotalInformado: ''
                },
                actividadesEconomicas: { glosaDescriptiva: '', titulos: [], filas: [] },
                sociedadesContribuyente: { titulos: [], filas: [] },
                caracteristicasContribuyente: { titulos: [], filas: [] },
                apoderadosGruposEmpresariales: { descripcion: '', instrucciones: '', estado: '' },
                documentosTributarios: { titulos: [], filas: [] },
                bienesRaices: { titulos: [], filas: [] },
                oficinaSII: { titulo: '', oficina: '' },
                secciones: [],
            }
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

        $('#direccionesVigentes thead th').each((i, th) => {
            const titulo = $(th).text().trim();
            if (titulo) resultado.datosPersonales.direcciones.titulos.push(titulo);
        });

        $('#tablaDirecciones tr').each((i, row) => {
            const $row = $(row);
            const codigoSucursal = $row.find('td[data-title="Código Sucursal"]').text().trim();
            const tipoDireccion = $row.find('td[data-title="Tipo Dirección"]').text().trim();
            const direccion = $row.find('td[data-title="Dirección"]').text().trim();
            const aPartirDe = $row.find('td[data-title="A partir de"]').text().trim();

            if (codigoSucursal) {
                resultado.datosPersonales.direcciones.filas.push({ codigoSucursal, tipoDireccion, direccion, aPartirDe });
            }
        });

        $('#tablaDatosTelefonos tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            if (celdas.length >= 2) {
                const tipo = $(celdas[0]).find('b').text().trim() || $(celdas[0]).text().trim();
                const valor = $(celdas[1]).text().trim();
                if (tipo && valor) {
                    resultado.datosPersonales.telefonosCorreos.filas.push({ tipo, valor });
                }
            }
        });

        $('#tablaDatosActividad').closest('table').find('thead th').each((i, th) => {
            const titulo = $(th).text().replace(/\s+/g, ' ').trim();
            if (titulo) resultado.datosPersonales.inicioActividadesGiro.titulos.push(titulo);
        });

        $('#tablaDatosActividad tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            if (celdas.length >= 3) {
                const fechaConstitucion = $(celdas[0]).text().trim();
                const fechaInicioActividades = $(celdas[1]).text().trim();
                const terminoGiro = $(celdas[2]).text().trim();
                if (fechaConstitucion || fechaInicioActividades || terminoGiro) {
                    resultado.datosPersonales.inicioActividadesGiro.filas.push({ fechaConstitucion, fechaInicioActividades, terminoGiro });
                }
            }
        });

        const estadoGeneral = $('#divObligacionLeyCot div[style*="background-color"]').text().replace(/Estado:/g, '').trim();
        if (estadoGeneral) {
            resultado.datosPersonales.estadoCumplimientoTributario.estadoGeneral = estadoGeneral;
        }

        let titulosEncontrados = false;
        $('#divObligacionLeyCot table thead th').each((i, th) => {
            const titulo = $(th).text().trim();
            if (titulo) {
                resultado.datosPersonales.estadoCumplimientoTributario.titulos.push(titulo);
                titulosEncontrados = true;
            }
        });
        
        if (!titulosEncontrados) {
            const primeraFilaCabecera = $('#divObligacionLeyCot table tr:first-child th');
            if (primeraFilaCabecera.length > 0) {
                primeraFilaCabecera.each((i, th) => {
                    const titulo = $(th).text().trim();
                    if (titulo) resultado.datosPersonales.estadoCumplimientoTributario.titulos.push(titulo);
                });
            } else {
                resultado.datosPersonales.estadoCumplimientoTributario.titulos = ['Requisitos', 'Ayudas', 'Estado'];
            }
        }

        $('#divObligacionLeyCot table tbody tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            if (celdas.length >= 3) {
                const requisito = $(celdas[0]).text().trim();
                const ayudas = $(celdas[1]).text().trim();
                const estado = $(celdas[2]).text().trim();
                if (requisito) {
                    resultado.datosPersonales.estadoCumplimientoTributario.filas.push({ requisito, ayudas, estado });
                }
            }
        });

        const formaActuacion = $('#tablaActuacion td').text().trim();
        if (formaActuacion) {
            resultado.datosPersonales.representantesLegales.formaActuacion = formaActuacion;
        }

        $('#tablaRepresentantes').closest('table').find('thead th').each((i, th) => {
            const titulo = $(th).text().trim();
            if (titulo) resultado.datosPersonales.representantesLegales.titulos.push(titulo);
        });

        $('#tablaRepresentantes tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            if (celdas.length >= 3) {
                const nombre = $(celdas[0]).text().trim();
                const rut = $(celdas[1]).text().trim();
                const aPartirDe = $(celdas[2]).text().trim();
                if (nombre && rut) {
                    resultado.datosPersonales.representantesLegales.filas.push({ nombre, rut, aPartirDe });
                }
            }
        });

        $('#tablaSociosVigentes table thead th').each((i, th) => {
            const titulo = $(th).text().trim();
            if (titulo) resultado.datosPersonales.sociosCapital.titulos.push(titulo);
        });

        $('#tablaSociosVigentes table tbody tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            const celdasTh = $row.find('th');
            
            if (celdasTh.length > 0) {
                const primeraColumna = $(celdasTh[0]).text().trim();
                if (primeraColumna === 'Sub-totales') {
                    resultado.datosPersonales.sociosCapital.subtotales = {
                        capitalEnterado: $(celdasTh[1]).text().trim(),
                        capitalPorEnterar: $(celdasTh[2]).text().trim(),
                        porcentajeCapital: $(celdasTh[3]).text().trim(),
                        porcentajeUtilidades: $(celdasTh[4]).text().trim(),
                    };
                } else if (primeraColumna === 'Capital Total informado M$') {
                    resultado.datosPersonales.sociosCapital.capitalTotalInformado = $(celdasTh[1]).text().trim();
                }
            } else if (celdas.length >= 7) {
                const nombre = $(celdas[0]).text().trim();
                const rut = $(celdas[1]).text().trim();
                const capitalEnterado = $(celdas[2]).text().trim();
                const capitalPorEnterar = $(celdas[3]).text().trim();
                const porcentajeCapital = $(celdas[4]).text().trim();
                const porcentajeUtilidades = $(celdas[5]).text().trim();
                const fechaIncorporacion = $(celdas[6]).text().trim();
                if (nombre && rut) {
                    resultado.datosPersonales.sociosCapital.filas.push({
                        nombre, rut, capitalEnterado, capitalPorEnterar, porcentajeCapital, porcentajeUtilidades, fechaIncorporacion
                    });
                }
            }
        });

        const glosaDescriptiva = $('#glosaActividad').text().trim();
        if (glosaDescriptiva) {
            resultado.datosPersonales.actividadesEconomicas.glosaDescriptiva = glosaDescriptiva;
        }

        $('#actividadesBody').closest('table').find('thead th').each((i, th) => {
            const titulo = $(th).text().trim();
            if (titulo) resultado.datosPersonales.actividadesEconomicas.titulos.push(titulo);
        });

        $('#actividadesBody tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            if (celdas.length >= 5) {
                const actividad = $(celdas[0]).text().trim();
                const codigo = $(celdas[1]).text().trim();
                const categoriaTributaria = $(celdas[2]).text().trim();
                const afectaIVA = $(celdas[3]).text().trim();
                const aPartirDe = $(celdas[4]).text().trim();
                if (actividad && codigo) {
                    resultado.datosPersonales.actividadesEconomicas.filas.push({ actividad, codigo, categoriaTributaria, afectaIVA, aPartirDe });
                }
            }
        });

        $('#idTableMiSoc thead th').each((i, th) => {
            const titulo = $(th).text().trim();
            if (titulo) resultado.datosPersonales.sociedadesContribuyente.titulos.push(titulo);
        });

        $('#idTableMiSoc tbody tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            
            if (celdas.length === 1 && $(celdas[0]).attr('colspan')) {
                return;
            }
            
            if (celdas.length >= 9) {
                const nombreSociedad = $(celdas[0]).text().trim();
                const rut = $(celdas[1]).text().trim();
                const terminoGiro = $(celdas[2]).text().trim();
                const capitalEnterado = $(celdas[3]).text().trim();
                const capitalPorEnterar = $(celdas[4]).text().trim();
                const fechaPorEnterar = $(celdas[5]).text().trim();
                const porcentajeCapital = $(celdas[6]).text().trim();
                const porcentajeParticipacionUtilidades = $(celdas[7]).text().trim();
                const fechaIncorporacion = $(celdas[8]).text().trim();
                if (nombreSociedad && rut) {
                    resultado.datosPersonales.sociedadesContribuyente.filas.push({
                        nombreSociedad, rut, terminoGiro, capitalEnterado, capitalPorEnterar,
                        fechaPorEnterar, porcentajeCapital, porcentajeParticipacionUtilidades, fechaIncorporacion
                    });
                }
            }
        });

        $('#tablaAtributos').closest('table').find('thead th').each((i, th) => {
            const titulo = $(th).text().trim();
            if (titulo) resultado.datosPersonales.caracteristicasContribuyente.titulos.push(titulo);
        });

        $('#tablaAtributos tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            if (celdas.length >= 2) {
                const descripcion = $(celdas[0]).text().trim();
                const aPartirDe = $(celdas[1]).text().trim();
                if (descripcion) {
                    resultado.datosPersonales.caracteristicasContribuyente.filas.push({ descripcion, aPartirDe });
                }
            }
        });

        const apoderadosTextos = $('#divApoderadosGE p');
        if (apoderadosTextos.length >= 2) {
            resultado.datosPersonales.apoderadosGruposEmpresariales.descripcion = $(apoderadosTextos[0]).text().trim();
            resultado.datosPersonales.apoderadosGruposEmpresariales.instrucciones = $(apoderadosTextos[1]).text().trim();
            const estadoElement = $('#geTable p').text().trim();
            if (estadoElement) {
                resultado.datosPersonales.apoderadosGruposEmpresariales.estado = estadoElement;
            }
        }

        $('#tblUltimosDoc thead th').each((i, th) => {
            const titulo = $(th).text().trim();
            if (titulo) resultado.datosPersonales.documentosTributarios.titulos.push(titulo);
        });

        $('#tblUltimosDocBody tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            if (celdas.length >= 3) {
                const tipo = $(celdas[0]).text().trim();
                const autorizadoHasta = $(celdas[1]).text().trim();
                const fechaAutorizacion = $(celdas[2]).text().trim();
                if (tipo) {
                    resultado.datosPersonales.documentosTributarios.filas.push({ tipo, autorizadoHasta, fechaAutorizacion });
                }
            }
        });

        let titulosBienesEncontrados = false;
        $('#divPropiedades table thead th').each((i, th) => {
            const titulo = $(th).text().trim();
            resultado.datosPersonales.bienesRaices.titulos.push(titulo);
            titulosBienesEncontrados = true;
        });
        
        if (!titulosBienesEncontrados) {
            const primeraFilaCabecera = $('#divPropiedades table tr:first-child th');
            if (primeraFilaCabecera.length > 0) {
                primeraFilaCabecera.each((i, th) => {
                    const titulo = $(th).text().trim();
                    resultado.datosPersonales.bienesRaices.titulos.push(titulo);
                });
            } else {
                resultado.datosPersonales.bienesRaices.titulos = ['', 'ROL', 'Comuna', 'Dirección', 'Destino', 'Cuotas Vencidas por pagar', 'Cuotas Vigentes por pagar'];
            }
        }

        $('#divPropiedades table tbody tr').each((i, row) => {
            const $row = $(row);
            const celdas = $row.find('td');
            
            if (celdas.length === 1 && $(celdas[0]).attr('colspan')) {
                return;
            }
            
            if (celdas.length >= 7) {
                const columna1 = $(celdas[0]).text().trim();
                const rol = $(celdas[1]).text().trim();
                const comuna = $(celdas[2]).text().trim();
                const direccion = $(celdas[3]).text().trim();
                const destino = $(celdas[4]).text().trim();
                const cuotasVencidasPorPagar = $(celdas[5]).text().trim();
                const cuotasVigentesPorPagar = $(celdas[6]).text().trim();
                if (rol || direccion) {
                    resultado.datosPersonales.bienesRaices.filas.push({
                        columna1, rol, comuna, direccion, destino, cuotasVencidasPorPagar, cuotasVigentesPorPagar
                    });
                }
            }
        });

        const oficinaTablaHead = $('#tablaHead');
        if (oficinaTablaHead.length > 0) {
            const titulo = oficinaTablaHead.find('th').text().trim();
            const oficina = oficinaTablaHead.find('td').text().trim().replace(/\s+/g, ' ');
            if (titulo && oficina) {
                resultado.datosPersonales.oficinaSII.titulo = titulo;
                resultado.datosPersonales.oficinaSII.oficina = oficina;
            }
        }

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
                    contenidoTexto,
                    contenidoHtml,
                };
            }
        });

        titulosDeseados.forEach(titulo => {
            if (seccionesEncontradas[titulo]) {
                const seccionesEstructuradas = [
                    'Direcciones', 'Teléfonos y Correos electrónicos',
                    'Inicio de actividades y término de giro',
                    'Estado de cumplimiento de las obligaciones tributarias',
                    'Representantes legales', 'Socios y Capital',
                    'Actividades económicas', 'Sociedades a las que pertenece el contribuyente',
                    'Características del contribuyente', 'Apoderados de Grupos Empresariales',
                    'Documentos tributarios autorizados', 'Bienes Raíces',
                    'Oficina del SII para trámites presenciales'
                ];
                
                if (seccionesEstructuradas.includes(titulo)) {
                    return;
                }
                
                resultado.datosPersonales.secciones.push(seccionesEncontradas[titulo]);
            }
        });

        return resultado;
    }
}
