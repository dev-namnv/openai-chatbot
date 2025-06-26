import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { Account } from 'src/schemas/account';
import { SearchAccountDto } from './dto/searchAccount.dto';
import { UpdateLocationDto } from './dto/updateLocation.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

  async searchAccount(
    searchAccountDto: SearchAccountDto,
  ): Promise<Account[] | Observable<never>> {
    return this.accountModel
      .aggregate()
      .match({ $text: { $search: searchAccountDto.keyword } })
      .addFields({ score: { $meta: 'textScore' } })
      .sort({
        score: { $meta: 'textScore' },
      });
  }

  async updateLocation(
    _id: MongoId,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Account | null | Observable<never>> {
    return this.accountModel.findByIdAndUpdate(_id, updateLocationDto, {
      new: true,
    });
  }
}
