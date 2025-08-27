import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Farmer } from '../../domain/entities/farmer';
import { FarmerRepository } from '../../domain/repositories/farmer.repository';
import { FarmerModel, FarmerDocument } from '../schemas/farmer.schema';

function normalizeCpf(v?: string) {
  return (v ?? '').replace(/\D/g, '');
}
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MongooseFarmerRepository implements FarmerRepository {
  constructor(
    @InjectModel(FarmerModel.name)
    private readonly model: Model<FarmerDocument>,
  ) {}

  private toEntity(doc: FarmerDocument): Farmer {
    return new Farmer(doc._id.toString(), {
      fullName: doc.fullName,
      cpf: doc.cpf,
      birthDate: doc.birthDate ?? null,
      phone: doc.phone ?? null,
      active: doc.active,
    });
  }

  async create(data: Omit<Farmer['props'], 'active'> & { active?: boolean }): Promise<Farmer> {
    const created = await this.model.create({
      ...data,
      cpf: normalizeCpf((data as any).cpf),
      active: data.active ?? true,
    });
    return this.toEntity(created);
  }

  async findById(id: string): Promise<Farmer | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByCPF(cpf: string): Promise<Farmer | null> {
    const digits = normalizeCpf(cpf);
    const doc = await this.model.findOne({ cpf: digits }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async update(id: string, data: Partial<Omit<Farmer['props'], 'cpf'>>): Promise<Farmer | null> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async list(filters: { name?: string; cpf?: string; active?: boolean }): Promise<Farmer[]> {
    const q: FilterQuery<FarmerDocument> = {};

    if (filters.name?.trim()) {
      q.fullName = {
        $regex: new RegExp(escapeRegex(filters.name.trim()), 'i'),
      };
    }

    if (filters.cpf) {
      const digits = normalizeCpf(filters.cpf).slice(0, 11);
      if (digits.length === 11) {
        q.cpf = digits;
      } else if (digits.length > 0) {
        q.cpf = { $regex: new RegExp(`^${escapeRegex(digits)}`) };
      }
    }

    if (typeof filters.active === 'boolean') {
      q.active = filters.active;
    }

    const docs = await this.model.find(q).sort({ fullName: 1 }).limit(200).exec();

    return docs.map((d) => this.toEntity(d));
  }
}
