import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FarmerModel, FarmerSchema } from './infra/schemas/farmer.schema';
import { FarmersController } from './presentation/farmers.controller';
import { MongooseFarmerRepository } from './infra/repositories/mongoose-farmer.repository';

import { CreateFarmerUseCase } from './application/use-cases/create-farmer.use-case';
import { ListFarmersUseCase } from './application/use-cases/list-farmers.use-case';
import { GetFarmerUseCase } from './application/use-cases/get-farmer.use-case';
import { UpdateFarmerUseCase } from './application/use-cases/update-farmer.use-case';
import { RemoveFarmerUseCase } from './application/use-cases/remove-farmer.use-case';

@Module({
  imports: [MongooseModule.forFeature([{ name: FarmerModel.name, schema: FarmerSchema }])],
  controllers: [FarmersController],
  providers: [
    MongooseFarmerRepository,
    { provide: 'FarmerRepository', useExisting: MongooseFarmerRepository },
    CreateFarmerUseCase,
    ListFarmersUseCase,
    GetFarmerUseCase,
    UpdateFarmerUseCase,
    RemoveFarmerUseCase,
  ],
})
export class FarmersModule {}
