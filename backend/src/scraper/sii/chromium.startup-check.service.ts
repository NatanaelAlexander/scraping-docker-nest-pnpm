import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ChromiumUtil } from './chromium.util';

@Injectable()
export class ChromiumStartupCheckService implements OnApplicationBootstrap {
    private readonly logger = new Logger(ChromiumStartupCheckService.name);
    private readonly chromium = new ChromiumUtil();

    async onApplicationBootstrap(): Promise<void> {
        const result = await this.chromium.verificarDisponibilidad();
        if (result.ok) {
            this.logger.log(
                `Chromium/Puppeteer OK al iniciar (executablePath=${result.executablePath}, timeout=${result.timeoutMs}ms)`,
            );
            return;
        }

            this.logger.error(
            `Chromium/Puppeteer NO disponible al iniciar (executablePath=${result.executablePath}): ${result.error}`,
            );
    }
}
