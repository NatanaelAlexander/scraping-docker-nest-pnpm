import { Injectable } from '@nestjs/common';
import { BooksScraper } from './books/books.scraper';
import { SiiScraper } from './sii/sii.scraper';
import { SiiParser } from './sii/sii.parser';

@Injectable()
export class ScraperService {
    constructor(
        private readonly booksScraper: BooksScraper,
        private readonly siiScraper: SiiScraper,
    ) { }

    getService(): string {
        return 'Im The scraper service';
    }

    getBooksCategories() {
        return this.booksScraper.getCategories();
    }

    async obtenerDatosBasicos(rut?: string, password?: string) {
        const sesion = await this.siiScraper.obtenerSesionDatosDelContribuyente(rut, password);
        if (!sesion.success) {
            return sesion;
        }
        return {
            success: true,
            datosBasicos: SiiParser.parseDatosBasicos(sesion.datosBasicos),
        };
    }

    async obtenerDatosPersonalesExtraidos(rut?: string, password?: string) {
        const sesion = await this.siiScraper.obtenerSesionDatosDelContribuyente(rut, password);
        if (!sesion.success) {
            return sesion;
        }
        return {
            success: true,
            datosExtraidos: SiiParser.parseDatosPersonalesDesdeHtml(sesion.boxRightHtml),
        };
    }
}
