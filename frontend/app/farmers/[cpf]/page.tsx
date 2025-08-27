import FarmerForm from '@/components/FarmerForm';

type FarmerDTO = {
  _id: string;
  fullName: string;
  cpf: string;
  birthDate?: string;
  phone?: string;
  active: boolean;
};

function normCPF(v: string) {
  return (v || '').replace(/\D/g, '');
}

export default async function EditFarmerPage({ params }: { params: { cpf: string } }) {
  const api =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  const f = list[0];

  return (
    <main className="container">
      <h1>Editar Agricultor</h1>
      <div className="card">
        {f ? (
          <FarmerForm
            mode="edit"
            id={f._id}
            initial={{
              fullName: f.fullName,
              cpf: f.cpf,
              birthDate: f.birthDate ? f.birthDate.slice(0, 10) : undefined,
              phone: f.phone,
            }}
          />
        ) : (
          <p>Registro não encontrado para CPF {cpf}.</p>
        )}
      </div>
    </main>
  );
}
