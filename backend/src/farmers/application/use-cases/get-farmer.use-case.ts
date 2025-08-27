import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FarmerRepository } from '../../domain/repositories/farmer.repository';
import { Farmer } from '../../domain/entities/farmer';

@Injectable()
export class GetFarmerUseCase {
  constructor(@Inject('FarmerRepository') private readonly repo: FarmerRepository) {}

  async execute(id: string): Promise<Farmer> {
    const farmer = await this.repo.findById(id);
    if (!farmer) throw new NotFoundException('Agricultor não encontrado.');
    return farmer;
  }
}
