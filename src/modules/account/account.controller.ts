import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { ApiJWTAuth } from 'src/decorators/apiJwtAuth.decorator';
import { Account } from 'src/schemas/account';
import { JwtAuthGuard } from '../guards/jwtAuth.guard';
import { AccountService } from './account.service';
import { SearchAccountDto } from './dto/searchAccount.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseGuards(JwtAuthGuard)
  @ApiJWTAuth()
  @Get('/search')
  @ApiTags('Account')
  @ApiOperation({ summary: 'Search account' })
  @ApiResponse({ type: [Account], status: 200 })
  async search(
    @Query() searchAccountDto: SearchAccountDto,
  ): Promise<Account[] | Observable<never>> {
    return this.accountService.searchAccount(searchAccountDto);
  }
}
