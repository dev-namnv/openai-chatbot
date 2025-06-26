import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @ApiTags('App')
  @ApiOperation({ summary: 'Clear all caching' })
  @Get('clear-caching')
  async clearCache() {
    await this.cacheManager.reset();
    return 'Cache was clear!';
  }
}
