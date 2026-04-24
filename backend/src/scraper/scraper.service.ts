import { Injectable } from '@nestjs/common';
import { BooksScraper } from './books/books.scraper';

@Injectable()
export class ScraperService {
    constructor(private readonly booksScraper: BooksScraper) {}

    getService(): string {
        return 'Im The scraper service';
    }

    getBooksCategories() {
        return this.booksScraper.getCategories();
    }
}