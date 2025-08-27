import { Farmer } from '../../domain/entities/farmer';
import { FarmerHttp } from '../view-models/farmer.view-model';

export function presentFarmer(f: Farmer): FarmerHttp {
  const { id, props } = f;
  return {
    id,
    _id: id,
    fullName: props.fullName,
    cpf: props.cpf,
    birthDate: props.birthDate ? props.birthDate.toISOString() : null,
    phone: props.phone ?? null,
    active: props.active,
  };
}

export function presentFarmers(list: Farmer[]): FarmerHttp[] {
  return list.map(presentFarmer);
}
