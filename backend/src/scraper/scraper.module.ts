import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { BooksScraper } from './books/books.scraper';

@Module({
  controllers: [ScraperController],
  providers: [ScraperService, BooksScraper]
})
export class ScraperModule {}
