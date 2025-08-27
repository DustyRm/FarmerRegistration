export interface FarmerProps {
  fullName: string;
  cpf: string;
  birthDate?: Date | null;
  phone?: string | null;
  active: boolean;
}

export class Farmer {
  constructor(
    public readonly id: string,
    public props: FarmerProps,
  ) {}

  canDelete(): boolean {
    return this.props.active === false;
  }
  activate() {
    this.props.active = true;
  }
  deactivate() {
    this.props.active = false;
  }
}
