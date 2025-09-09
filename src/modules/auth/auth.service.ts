import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Facebook } from 'fb';
import { google } from 'googleapis';
import { Model } from 'mongoose';
import { Observable, throwError } from 'rxjs';
import enviroment from 'src/config/enviroment';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { Account } from 'src/schemas/account';
import { LoginResponse } from './auth.controller';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LoginDto } from './dto/login.dto';
import { LoginSocialDto } from './dto/loginSocial.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<LoginResponse | Observable<never>> {
    try {
      const checkExist = await this.accountModel.findOne({
        email: registerDto.email,
      });
      if (checkExist) {
        return throwError(new ConflictException('Email already used!'));
      }
      const account = await this.accountModel.create(registerDto);
      const payload = { accountId: account._id.toString() };

      // TODO: generate auto
      return {
        accessToken: this.jwtService.sign(payload),
        account,
      };
    } catch (e) {
      return throwError(
        new InternalServerErrorException('Internal server error'),
      );
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse | Observable<never>> {
    try {
      const account = await this.accountModel.findOne({
        email: loginDto.email,
      });

      if (!account) {
        return throwError(new NotFoundException('Account not found'));
      }

      const isPasswordMatching = await bcrypt.compare(
        loginDto.password,
        account.password,
      );

      if (!isPasswordMatching) {
        return throwError(new UnauthorizedException('Password is invalid'));
      }

      const payload = { accountId: account._id.toString() };

      return {
        accessToken: this.jwtService.sign(payload),
        account,
      };
    } catch (e) {
      return throwError(
        new InternalServerErrorException('Internal server error'),
      );
    }
  }

  async loginGoogle(
    loginSocialDto: LoginSocialDto,
  ): Promise<LoginResponse | Observable<never>> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        enviroment().google.GOOGLE_CLIENT_ID,
        enviroment().google.GOOGLE_CLIENT_SECRET,
      );
      try {
        await oauth2Client.getTokenInfo(loginSocialDto.accessToken);
      } catch (e) {
        return throwError(new UnauthorizedException());
      }
      oauth2Client.setCredentials({
        access_token: loginSocialDto.accessToken,
      });
      const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2',
      });
      const userInfo = await oauth2.userinfo.get();
      const {
        id: googleId,
        email,
        given_name: firstName,
        family_name: lastName,
      } = userInfo.data;
      let account = await this.accountModel.findOne({
        $or: [{ googleId: googleId || '' }, { email: email || '' }],
      });
      if (!account) {
        account = await this.accountModel.create({
          googleId,
          email,
          firstName,
          lastName,
          isVerified: true,
        });
      } else if (!account.googleId) {
        account.googleId = googleId || '';
        await account.save();
      }
      const payload = { accountId: account._id.toString() };

      return {
        accessToken: this.jwtService.sign(payload),
        account,
      };
    } catch (e) {
      return throwError(
        new InternalServerErrorException('Internal server error'),
      );
    }
  }

  async loginFacebook(
    loginSocialDto: LoginSocialDto,
  ): Promise<LoginResponse | Observable<never>> {
    try {
      const fb = new Facebook({
        version: 'v8.0',
        appId: enviroment().facebook.FACEBOOK_CLIENT_ID,
        appSecret: enviroment().facebook.FACEBOOK_CLIENT_SECRET,
        accessToken: loginSocialDto.accessToken,
        timeout: 30000,
      });
      const userInfo = await fb.api('/me', {
        fields: 'id, email, first_name, last_name, middle_name, picture',
      });
      const {
        id: facebookId,
        email,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
      } = userInfo;
      let account = await this.accountModel.findOne({
        $or: [{ facebookId: facebookId || '' }, { email: email || '' }],
      });
      if (!account) {
        account = await this.accountModel.create({
          facebookId,
          email,
          firstName,
          lastName: lastName + (middleName ? `${middleName} ` : ''),
          isVerified: true,
        });
      } else if (!account.facebookId) {
        account.facebookId = facebookId || '';
        await account.save();
      }
      const payload = { accountId: account._id.toString() };
      return {
        accessToken: this.jwtService.sign(payload),
        account,
      };
    } catch (e) {
      return throwError(
        new InternalServerErrorException('Internal server error'),
      );
    }
  }

  async find(id: string | MongoId) {
    return this.accountModel.findById(id);
  }

  async changePassword(
    id: MongoId,
    data: ChangePasswordDto,
  ): Promise<object | Observable<never>> {
    try {
      if (data.newPassword !== data.newPasswordConfirm) {
        return throwError(
          new BadRequestException('Password confirm is invalid'),
        );
      }

      const account = await this.accountModel.findById(id);
      if (!account) {
        return throwError(new NotFoundException('Account not found'));
      }
      const isPasswordMatching = await bcrypt.compare(
        data.password,
        account.password,
      );

      if (!isPasswordMatching) {
        return throwError(new UnauthorizedException('Password is invalid'));
      }

      bcrypt.genSalt(10, (genSaltError, salt): any => {
        if (genSaltError) {
          return throwError(
            new InternalServerErrorException('Internal server error'),
          );
        }

        bcrypt.hash(data.newPassword, salt, async (err, hash): Promise<any> => {
          if (err) {
            return throwError(
              new InternalServerErrorException('Internal server error'),
            );
          }
          await this.accountModel.findByIdAndUpdate(
            id,
            { password: hash },
            { new: true },
          );
        });
      });

      return { message: 'Password changed successfully' };
    } catch (e) {
      return throwError(
        new InternalServerErrorException('Internal server error'),
      );
    }
  }

  async findByAccessToken(accessToken: string): Promise<Account | null> {
    const payload: { accountId: string } = this.jwtService.verify(accessToken, {
      secret: enviroment().jwt.secret,
    });
    if (!payload.accountId) {
      return null;
    }
    return this.accountModel.findById(payload.accountId);
  }
}
