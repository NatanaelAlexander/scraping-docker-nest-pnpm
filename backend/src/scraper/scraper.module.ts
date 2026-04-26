import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { BooksScraper } from './books/books.scraper';
import { SiiScraper } from './sii/sii.scraper';

@Module({
  controllers: [ScraperController],
  providers: [ScraperService, BooksScraper, SiiScraper],
})
export class ScraperModule { }
