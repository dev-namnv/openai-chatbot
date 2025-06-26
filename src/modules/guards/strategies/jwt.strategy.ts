import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Observable, throwError } from 'rxjs';
import configuration from 'src/config/configuration';
import { Account } from 'src/schemas/account';

export interface JwtPayload {
  accountId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(Account.name) private accountModel: Model<Account>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration().jwt.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<Account | Observable<never>> {
    if (payload.accountId) {
      const account = await this.accountModel.findById(payload.accountId);
      if (account) return account;
    }
    return throwError(new ForbiddenException('Unauthenticated'));
  }
}
