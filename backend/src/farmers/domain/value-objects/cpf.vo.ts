export class CPF {
  private constructor(private readonly value: string) {}

  public static create(raw: string): CPF {
    const onlyDigits = (raw || '').replace(/\D/g, '');
    if (!CPF.isValid(onlyDigits)) {
      throw new Error('CPF inválido');
    }
    return new CPF(onlyDigits);
  }

  public toString(): string {
    return this.value;
  }

  static isValid(cpf: string): boolean {
    if (!cpf || cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calcCheck = (base: string, factor: number) => {
      let total = 0;
      for (let i = 0; i < base.length; i++) {
        total += parseInt(base.charAt(i), 10) * factor--;
      }
      const resto = total % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const base9 = cpf.substring(0, 9);
    const dig1 = calcCheck(base9, 10);
    if (dig1 !== parseInt(cpf.charAt(9), 10)) return false;

    const base10 = cpf.substring(0, 10);
    const dig2 = calcCheck(base10, 11);
    if (dig2 !== parseInt(cpf.charAt(10), 10)) return false;

    return true;
  }
}
