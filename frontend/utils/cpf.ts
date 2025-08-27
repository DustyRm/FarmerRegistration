export function normalizeCPF(input: string) {
  return (input || '').replace(/\D/g, '');
}

export function isValidCPF(cpf: string): boolean {
  const value = normalizeCPF(cpf);
  if (!value || value.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(value)) return false;

  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * factor--;
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calc(value.slice(0, 9), 10);
  if (d1 !== parseInt(value[9], 10)) return false;
  const d2 = calc(value.slice(0, 10), 11);
  return d2 === parseInt(value[10], 10);
}
