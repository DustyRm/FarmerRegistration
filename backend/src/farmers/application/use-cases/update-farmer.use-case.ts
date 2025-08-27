import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FarmerRepository } from '../../domain/repositories/farmer.repository';
import { Farmer } from '../../domain/entities/farmer';

type UpdateInput = {
  id: string;
  fullName?: string;
  birthDate?: Date | null;
  phone?: string | null;
  active?: boolean;
};

@Injectable()
export class UpdateFarmerUseCase {
  constructor(@Inject('FarmerRepository') private readonly repo: FarmerRepository) {}

  async execute({ id, ...data }: UpdateInput): Promise<Farmer> {
    if ('cpf' in (data as any)) delete (data as any).cpf;

    if (typeof data.fullName === 'string') {
      const name = data.fullName.trim();
      if (!name) throw new BadRequestException('fullName não pode ser vazio.');
      (data as any).fullName = name;
    }
    if (typeof data.phone === 'string') (data as any).phone = data.phone.trim() || null;

    const updated = await this.repo.update(id, data as any);
    if (!updated) throw new NotFoundException('Agricultor não encontrado.');
    return updated;
  }
}
