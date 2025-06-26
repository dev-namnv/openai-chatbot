import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ApiJWTAuth } from 'src/decorators/apiJwtAuth.decorator';
import { CurrentAccount } from 'src/decorators/currentAccount.decorator';
import { Account } from 'src/schemas/account';
import { JwtAuthGuard } from '../guards/jwtAuth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LoginDto } from './dto/login.dto';
import { LoginSocialDto } from './dto/loginSocial.dto';
import { RegisterDto } from './dto/register.dto';

export class LoginResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: Account })
  account: Account;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Account register' })
  @ApiResponse({ type: LoginResponse, status: 201 })
  async create(
    @Body() registerDto: RegisterDto,
  ): Promise<LoginResponse | Observable<never>> {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Account login' })
  @ApiResponse({ type: LoginResponse })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<LoginResponse | Observable<never>> {
    return this.authService.login(loginDto);
  }

  @Post('/login-google')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Account login google' })
  async loginGoogle(
    @Body() loginSocialDto: LoginSocialDto,
  ): Promise<LoginResponse | Observable<never>> {
    return this.authService.loginGoogle(loginSocialDto);
  }

  @Post('/login-facebook')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Account login facebook' })
  async loginFacebook(
    @Body() loginSocialDto: LoginSocialDto,
  ): Promise<LoginResponse | Observable<never>> {
    return this.authService.loginFacebook(loginSocialDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiJWTAuth()
  @ApiTags('Auth')
  @Get('/profile')
  async getProfile(@Req() req: Request): Promise<Account | null> {
    return req.user as Account;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Patch('/change-password')
  @ApiTags('Auth')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentAccount() account: Account,
    @Body() data: ChangePasswordDto,
  ): Promise<object | Observable<never>> {
    return this.authService.changePassword(account.id, data);
  }
}
