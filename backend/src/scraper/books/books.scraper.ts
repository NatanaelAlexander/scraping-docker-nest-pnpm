import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { parseCategories } from './books.parser';

@Injectable()
export class BooksScraper {
  async getCategories() {
    const res = await fetch('https://books.toscrape.com/');
    const html = await res.text();

    const $ = cheerio.load(html);

    return parseCategories($);
  }
}