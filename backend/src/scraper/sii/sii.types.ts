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

export interface TablaDireccionesSII {
    titulos: string[];
    filas: DireccionSII[];
}

export interface TelefonoCorreoSII {
    tipo: string;
    valor: string;
}

export interface TablaTelefonosCorreosSII {
    titulos: string[];
    filas: TelefonoCorreoSII[];
}

export interface InicioActividadesGiroSII {
    fechaConstitucion: string;
    fechaInicioActividades: string;
    terminoGiro: string;
}

export interface TablaInicioActividadesSII {
    titulos: string[];
    filas: InicioActividadesGiroSII[];
}

export interface ObligacionTributariaSII {
    requisito: string;
    ayudas: string;
    estado: string;
}

export interface EstadoCumplimientoTributarioSII {
    estadoGeneral: string;
    titulos: string[];
    filas: ObligacionTributariaSII[];
}

export interface RepresentanteLegalSII {
    nombre: string;
    rut: string;
    aPartirDe: string;
}

export interface RepresentantesLegalesSII {
    formaActuacion: string;
    titulos: string[];
    filas: RepresentanteLegalSII[];
}

export interface SocioSII {
    nombre: string;
    rut: string;
    capitalEnterado: string;
    capitalPorEnterar: string;
    porcentajeCapital: string;
    porcentajeUtilidades: string;
    fechaIncorporacion: string;
}

export interface SubtotalesSociosSII {
    capitalEnterado: string;
    capitalPorEnterar: string;
    porcentajeCapital: string;
    porcentajeUtilidades: string;
}

export interface SociosCapitalSII {
    titulos: string[];
    filas: SocioSII[];
    subtotales: SubtotalesSociosSII;
    capitalTotalInformado: string;
}

export interface ActividadEconomicaSII {
    actividad: string;
    codigo: string;
    categoriaTributaria: string;
    afectaIVA: string;
    aPartirDe: string;
}

export interface ActividadesEconomicasSII {
    glosaDescriptiva: string;
    titulos: string[];
    filas: ActividadEconomicaSII[];
}

export interface SociedadContribuyenteSII {
    nombreSociedad: string;
    rut: string;
    terminoGiro: string;
    capitalEnterado: string;
    capitalPorEnterar: string;
    fechaPorEnterar: string;
    porcentajeCapital: string;
    porcentajeParticipacionUtilidades: string;
    fechaIncorporacion: string;
}

export interface SociedadesContribuyenteSII {
    titulos: string[];
    filas: SociedadContribuyenteSII[];
}

export interface CaracteristicaContribuyenteSII {
    descripcion: string;
    aPartirDe: string;
}

export interface CaracteristicasContribuyenteSII {
    titulos: string[];
    filas: CaracteristicaContribuyenteSII[];
}

export interface ApoderadosGruposEmpresarialesSII {
    descripcion: string;
    instrucciones: string;
    estado: string;
}

export interface DocumentoTributarioSII {
    tipo: string;
    autorizadoHasta: string;
    fechaAutorizacion: string;
}

export interface DocumentosTributariosSII {
    titulos: string[];
    filas: DocumentoTributarioSII[];
}

export interface BienRaizSII {
    columna1: string;
    rol: string;
    comuna: string;
    direccion: string;
    destino: string;
    cuotasVencidasPorPagar: string;
    cuotasVigentesPorPagar: string;
}

export interface BienesRaicesSII {
    titulos: string[];
    filas: BienRaizSII[];
}

export interface OficinaSIISII {
    titulo: string;
    oficina: string;
}

export interface SeccionSII {
    id: string;
    titulo: string;
    contenidoTexto: string;
    contenidoHtml: string;
}

export interface DatosPersonalesSII {
    direcciones: TablaDireccionesSII;
    telefonosCorreos: TablaTelefonosCorreosSII;
    inicioActividadesGiro: TablaInicioActividadesSII;
    estadoCumplimientoTributario: EstadoCumplimientoTributarioSII;
    representantesLegales: RepresentantesLegalesSII;
    sociosCapital: SociosCapitalSII;
    actividadesEconomicas: ActividadesEconomicasSII;
    sociedadesContribuyente: SociedadesContribuyenteSII;
    caracteristicasContribuyente: CaracteristicasContribuyenteSII;
    apoderadosGruposEmpresariales: ApoderadosGruposEmpresarialesSII;
    documentosTributarios: DocumentosTributariosSII;
    bienesRaices: BienesRaicesSII;
    oficinaSII: OficinaSIISII;
    secciones: SeccionSII[];
}

export interface DatosPersonalesCompletos {
    datosPersonales: DatosPersonalesSII;
}
