'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiSend } from '@/lib/api';
import { normalizeCPF } from '@/utils/cpf';

type Farmer = {
  _id?: string;
  id?: string;
  fullName: string;
  cpf: string;          
  birthDate?: string;
  phone?: string;
  active: boolean;
};

function formatCPF(value: string): string {
  const d = (value || '').replace(/\D/g, '').slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  let out = '';
  if (p1) out = p1;
  if (p2) out += (out ? '.' : '') + p2;
  if (p3) out += '.' + p3;
  if (p4) out += '-' + p4;
  return out;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const e = err as { message?: unknown; response?: { data?: { message?: unknown } } };
    const apiMsg = e.response?.data?.message;
    if (Array.isArray(apiMsg)) return apiMsg.join('; ');
    if (typeof apiMsg === 'string') return apiMsg;
    if (typeof e.message === 'string') return e.message;
  }
  return 'Ocorreu um erro inesperado.';
}

export default function FarmersTable() {
  const [items, setItems] = useState<Farmer[]>([]);
  const [name, setName] = useState('');
  const [cpfDigits, setCpfDigits] = useState(''); 
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [active, setActive] = useState<string>('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (name) q.set('name', name);
    if (cpfDigits) q.set('cpf', cpfDigits); 
    if (active) q.set('active', active);
    return q.toString();
  }, [name, cpfDigits, active]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await apiGet(`/farmers${query ? `?${query}` : ''}`)) as Farmer[];
      setItems(data);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const onChangeCpfFilter: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits.length > 11) {
      setCpfDigits(digits.slice(0, 11));
      setCpfError('CPF no filtro deve ter no máximo 11 dígitos.');
    } else {
      setCpfDigits(digits);
      setCpfError(null);
    }
  };

  const handleDelete = async (farmer: Farmer) => {
    try {
      const id = farmer._id ?? farmer.id;
      if (!id) {
        alert('Não foi possível resolver o ID do registro. Atualize a página.');
        return;
      }
      const ok = confirm(
        farmer.active
          ? 'Este registro está ATIVO. Deseja inativar e excluir?'
          : 'Confirma excluir este registro?'
      );
      if (!ok) return;

      setBusyId(id);

      if (farmer.active) {
        await apiSend(`/farmers/${id}`, 'PATCH', { active: false });
      }
      await apiSend(`/farmers/${id}`, 'DELETE');

      alert('Registro excluído com sucesso.');
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          className="input max-w-xs"
          placeholder="Filtrar por nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="max-w-xl w-full">
          <input
            className={`input w-full ${cpfError ? 'is-error' : ''}`}
            placeholder="Filtrar por CPF (opcional · Colocar CPF completo)"
            value={formatCPF(cpfDigits)}           
            onChange={onChangeCpfFilter}
            inputMode="numeric"
          />
          {cpfError ? <p className="error">{cpfError}</p> : null}
        </div>

        <select
          className="input max-w-[150px]"
          value={active}
          onChange={(e) => setActive(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>

        <Link href="/farmers/new" className="btn ml-auto">
          Novo
        </Link>
      </div>

      <div className="table-container overflow-x-auto">
        <table className="table w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col /> {/* Nome */}
            <col /> {/* CPF */}
            <col /> {/* Nascimento */}
            <col /> {/* Telefone */}
            <col style={{ width: '8rem' }} />  {/* Status */}
            <col style={{ width: '14rem' }} /> {/* Ações */}
          </colgroup>

          <thead>
            <tr>
              <th className="px-3">Nome</th>
              <th className="px-3">CPF</th>
              <th className="px-3">Nascimento</th>
              <th className="px-3">Telefone</th>
              <th className="px-3 text-left">Status</th>
              <th className="px-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {items.map((f) => {
              const id = f._id ?? f.id ?? f.cpf;
              return (
                <tr key={id}>
                  <td className="px-3">{f.fullName}</td>
                  <td className="px-3">{formatCPF(f.cpf)}</td> 
                  <td className="px-3">
                    {f.birthDate ? new Date(f.birthDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-3">{f.phone || '-'}</td>

                  <td className="px-3 text-left whitespace-nowrap">
                    {f.active ? 'Ativo' : 'Inativo'}
                  </td>

                  <td className="px-3">
                    <div className="flex justify-start gap-2 whitespace-nowrap">
                      {f.cpf ? (
                        <Link
                          href={`/farmers/${encodeURIComponent(normalizeCPF(f.cpf))}`} 
                          className="btn secondary"
                          prefetch={false}
                        >
                          Editar
                        </Link>
                      ) : (
                        <button
                          className="btn secondary opacity-50 cursor-not-allowed"
                          title="CPF ausente neste registro"
                          onClick={(e) => e.preventDefault()}
                        >
                          Editar
                        </button>
                      )}
                      <button
                        className="btn"
                        onClick={() => handleDelete(f)}
                        disabled={busyId === (f._id ?? f.id)}
                        title={f.active ? 'É preciso inativar antes de excluir (RN5)' : 'Excluir'}
                      >
                        {busyId === (f._id ?? f.id) ? 'Excluindo…' : 'Excluir'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-sm text-[var(--muted)]">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-sm text-[var(--muted)]">
                  Carregando…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
