import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FarmersModule } from './farmers/farmers.module';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agri_registry';

@Module({
  imports: [MongooseModule.forRoot(mongoUri), FarmersModule],
})
export class AppModule {}
