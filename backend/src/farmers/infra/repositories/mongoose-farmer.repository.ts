import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Farmer } from '../../domain/entities/farmer';
import { FarmerRepository } from '../../domain/repositories/farmer.repository';
import { FarmerModel, FarmerDocument } from '../schemas/farmer.schema';

export class MongooseFarmerRepository implements FarmerRepository {
  constructor(@InjectModel(FarmerModel.name) private readonly model: Model<FarmerDocument>) {}

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
    const created = await this.model.create({ ...data, active: data.active ?? true });
    return this.toEntity(created);
  }

  async findById(id: string): Promise<Farmer | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByCPF(cpf: string): Promise<Farmer | null> {
    const doc = await this.model.findOne({ cpf }).exec();
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
    const q: any = {};
    if (filters.name) q.fullName = { $regex: filters.name, $options: 'i' };
    if (filters.cpf) q.cpf = filters.cpf;
    if (typeof filters.active === 'boolean') q.active = filters.active;
    const docs = await this.model.find(q).sort({ fullName: 1 }).exec();
    return docs.map((d) => this.toEntity(d));
  }
}
