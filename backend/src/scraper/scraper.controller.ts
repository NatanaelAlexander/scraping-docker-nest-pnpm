import { Controller, Get } from '@nestjs/common';
import {ScraperService} from './scraper.service'
@Controller('scraper')
export class ScraperController {
    constructor(private readonly scraperService: ScraperService) {}

    @Get()
        getService(): string {return this.scraperService.getService();}

    @Get('books/categories')
        getBooksCategories() {return this.scraperService.getBooksCategories();}
}
