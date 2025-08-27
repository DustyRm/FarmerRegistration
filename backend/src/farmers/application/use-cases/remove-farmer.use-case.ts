import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FarmerRepository } from '../../domain/repositories/farmer.repository';

@Injectable()
export class RemoveFarmerUseCase {
  constructor(@Inject('FarmerRepository') private readonly repo: FarmerRepository) {}

  async execute(id: string): Promise<void> {
    const farmer = await this.repo.findById(id);
    if (!farmer) throw new NotFoundException('Agricultor não encontrado.');
    if (!farmer.canDelete())
      throw new BadRequestException('Exclusão permitida apenas quando active=false.');
    await this.repo.delete(id);
  }
}
