import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { BooksScraper } from './books/books.scraper';
import { SiiScraper } from './sii/sii.scraper';
import { ChromiumStartupCheckService } from './sii/chromium.startup-check.service';

@Module({
  controllers: [ScraperController],
  providers: [ScraperService, BooksScraper, SiiScraper, ChromiumStartupCheckService],
})
export class ScraperModule { }