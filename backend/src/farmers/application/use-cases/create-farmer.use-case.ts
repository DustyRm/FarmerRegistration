import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { FarmerRepository } from '../../domain/repositories/farmer.repository';
import { CPF } from '../../domain/value-objects/cpf.vo';
import { Farmer } from '../../domain/entities/farmer';

type CreateInput = { fullName: string; cpf: string; birthDate?: Date; phone?: string };

@Injectable()
export class CreateFarmerUseCase {
  constructor(@Inject('FarmerRepository') private readonly repo: FarmerRepository) {}

  async execute(data: CreateInput): Promise<Farmer> {
    const fullName = data.fullName?.trim();
    if (!fullName) throw new BadRequestException('fullName é obrigatório.');

    const normalizedCPF = (data.cpf ?? '').replace(/\D/g, '');
    CPF.create(normalizedCPF);

    const exists = await this.repo.findByCPF(normalizedCPF);
    if (exists) throw new ConflictException('Já existe um agricultor com este CPF.');

    return this.repo.create({
      fullName,
      cpf: normalizedCPF,
      birthDate: data.birthDate ?? null,
      phone: data.phone?.trim() || null,
      active: true,
    });
  }
}
