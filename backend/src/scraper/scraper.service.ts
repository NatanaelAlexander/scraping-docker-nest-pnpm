import { Injectable } from '@nestjs/common';
import { BooksScraper } from './books/books.scraper';
import { SiiScraper } from './sii/sii.scraper';

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

    obtenerDatosPersonalesCompletos(rut?: string, password?: string) {
        return this.siiScraper.obtenerDatosPersonalesCompletos(rut, password);
    }
}