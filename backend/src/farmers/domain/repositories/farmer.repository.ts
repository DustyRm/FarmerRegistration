import { Farmer } from '../entities/farmer';

export interface FarmerRepository {
  create(data: Omit<Farmer['props'], 'active'> & { active?: boolean }): Promise<Farmer>;
  findById(id: string): Promise<Farmer | null>;
  findByCPF(cpf: string): Promise<Farmer | null>;
  update(id: string, data: Partial<Omit<Farmer['props'], 'cpf'>>): Promise<Farmer | null>;
  delete(id: string): Promise<void>;
  list(filters: { name?: string; cpf?: string; active?: boolean }): Promise<Farmer[]>;
}
