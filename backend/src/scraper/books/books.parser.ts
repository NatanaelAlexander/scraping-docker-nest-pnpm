import * as cheerio from 'cheerio';

export function parseCategories($: cheerio.CheerioAPI) {
  const categories: { name: string; url: string }[] = [];

  $('.side_categories ul li ul li a').each((_, el) => {
    const name = $(el).text().trim();
    const url = $(el).attr('href') || '';

    categories.push({ name, url });
  });

  return categories;
}   