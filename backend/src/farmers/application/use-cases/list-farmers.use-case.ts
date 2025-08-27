import { Inject, Injectable } from '@nestjs/common';
import { FarmerRepository } from '../../domain/repositories/farmer.repository';
import { Farmer } from '../../domain/entities/farmer';

type ListFilters = { name?: string; cpf?: string; active?: boolean };

@Injectable()
export class ListFarmersUseCase {
  constructor(@Inject('FarmerRepository') private readonly repo: FarmerRepository) {}

  execute(filters: ListFilters): Promise<Farmer[]> {
    const name = filters.name?.trim() || undefined;
    const cpf = filters.cpf ? filters.cpf.replace(/\D/g, '') : undefined;
    const active = typeof filters.active === 'boolean' ? filters.active : undefined;
    return this.repo.list({ name, cpf, active });
  }
}
