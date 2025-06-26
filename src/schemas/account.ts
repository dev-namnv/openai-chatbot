import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';
import { AccountRole } from 'src/interfaces/account.interface';
import TimeUtil from '../utils/time.util';

export const ACCOUNT_COLLECTION = 'accounts';

export const ACCOUNT_FIELD_SELECTS = [
  '_id',
  'firstName',
  'lastName',
  'email',
  'phone',
  'avatar',
  'birthday',
  'gender',
];

@Schema({ collection: ACCOUNT_COLLECTION })
export class Account extends Document {
  @Prop({ default: null })
  @ApiProperty({ description: 'Google ID' })
  googleId: string;

  @Prop({ default: null })
  @ApiProperty({ description: 'Facebook ID' })
  facebookId: string;

  @Prop({ required: true, unique: true })
  @ApiProperty({ description: 'Email' })
  email: string;

  @Prop()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Prop({ default: null })
  @ApiProperty({ description: 'Phone' })
  phone: string;

  @Prop()
  @ApiProperty({ description: 'First name' })
  firstName: string;

  @Prop()
  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @Prop({ default: null })
  @ApiProperty({ description: 'Avatar', default: null })
  avatar: string;

  @Prop({ default: null })
  @ApiProperty({
    description: 'Birthday (YYYY-MM-DD)',
    default: null,
  })
  birthday: string;

  @Prop({ default: null })
  @ApiProperty({
    description: 'Gender (1: Male, 2: Female, 3: Other)',
    default: null,
  })
  gender: number;

  @Prop({ default: '' })
  @ApiProperty({ description: 'VND' })
  currency: string;

  @Prop({ default: false })
  @ApiProperty({ default: false })
  isVerified: boolean;

  @Prop({ enum: AccountRole, default: AccountRole.USER })
  @ApiProperty({ enum: AccountRole })
  role: AccountRole;

  @Prop()
  @ApiProperty({
    description: 'Created at',
  })
  createdAt: Date;

  @Prop({ default: null })
  @ApiProperty({
    description: 'Updated at',
    default: null,
  })
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

AccountSchema.pre<Account>(/(save|update)/i, function (next) {
  if (this.isNew) {
    this.set({ createdAt: TimeUtil.date() });
  } else {
    this.set({ updatedAt: TimeUtil.date() });
  }

  if (!this.password || !this.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (genSaltError, salt) => {
    if (genSaltError) {
      return next(genSaltError);
    }

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      this.password = hash;
      next();
    });
  });
});

AccountSchema.methods.toJSON = function (): Document<Account> {
  return this.toObject();
};

AccountSchema.index({ email: 'text', firstName: 'text', lastName: 'text' });
