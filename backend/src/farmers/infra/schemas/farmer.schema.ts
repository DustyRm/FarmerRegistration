import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FarmerDocument = HydratedDocument<FarmerModel>;

@Schema({ timestamps: true, collection: 'farmers' })
export class FarmerModel {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true, index: true })
  cpf!: string;

  @Prop()
  birthDate?: Date;

  @Prop()
  phone?: string;

  @Prop({ default: true })
  active!: boolean;
}

export const FarmerSchema = SchemaFactory.createForClass(FarmerModel);
FarmerSchema.index({ cpf: 1 }, { unique: true });
