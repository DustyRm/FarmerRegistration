import FarmerForm from '@/components/FarmerForm';

type FarmerDTO = {
  id?: string;
  fullName: string;
  cpf: string;
  birthDate?: string | null;
  phone?: string | null;
  active: boolean;
};

function normCPF(v: string) {
  return (v || '').replace(/\D/g, '');
}

export default async function EditFarmerPage({ params }: { params: { cpf: string } }) {
  const api =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8080';

  const cpf = normCPF(decodeURIComponent(params.cpf));

  const res = await fetch(`${api}/farmers?cpf=${cpf}`, { cache: 'no-store' });
  if (!res.ok) {
    return (
      <main className="container">
        <h1>Editar Agricultor</h1>
        <div className="card">Falha ao carregar registro.</div>
      </main>
    );
  }

  const list = (await res.json()) as FarmerDTO[];

  const f = list.find((it) => normCPF(it.cpf) === cpf);

  if (!f) {
    return (
      <main className="container">
        <h1>Editar Agricultor</h1>
        <div className="card">Registro não encontrado para CPF {cpf}.</div>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Editar Agricultor</h1>
      <div className="card">
        <FarmerForm
          mode="edit"
          id={f.id} 
          initial={{
            fullName: f.fullName,
            cpf: f.cpf,
            birthDate: f.birthDate ? f.birthDate.slice(0, 10) : undefined, 
            phone: f.phone ?? undefined,
            active: f.active, 
          }}
        />
      </div>
    </main>
  );
}
