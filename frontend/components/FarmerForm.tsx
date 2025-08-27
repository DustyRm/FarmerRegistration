'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { apiGet, apiSend } from '@/lib/api';

const schema = z.object({
  fullName: z.string().trim().min(1, 'Nome é obrigatório').max(120, 'Nome muito longo'),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => /^\d{11}$/.test(v), 'CPF deve conter 11 números'),
  birthDate: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Data de nascimento inválida'),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ?? '').trim())
    .refine(
      (v) => v === '' || /^(?:\+?\d{1,3}\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/.test(v),
      'Telefone inválido'
    )
    .transform((v) => (v === '' ? undefined : v)),
  active: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;
type Mode = 'create' | 'edit';

type FarmerDTO = {
  id: string;
  fullName: string;
  cpf: string;             
  birthDate?: string | null; 
  phone?: string | null;
  active: boolean;
};

function toDateInput(iso?: string | null): string {
  if (!iso) return '';
  return String(iso).slice(0, 10);
}
function fromDateInputToISO(date?: string): string | undefined {
  if (!date) return undefined;
  return new Date(`${date}T12:00:00Z`).toISOString();
}
function normCPF(v: string) {
  return (v || '').replace(/\D/g, '');
}

export default function FarmerForm({
  mode = 'create',
  id,
  initial,
  onSaved,
}: {
  mode?: Mode;
  id?: string; 
  initial?: Partial<FormData> & { birthDate?: string | null; active?: boolean };
  onSaved?: () => void;
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const [syncing, setSyncing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initial?.fullName ?? '',
      cpf: initial?.cpf ?? '',
      birthDate: toDateInput(initial?.birthDate ?? null),
      phone: initial?.phone ?? '',
      active: isEdit ? initial?.active : true,
    },
  });

  const initialCpf = useMemo(() => normCPF(initial?.cpf ?? ''), [initial?.cpf]);

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    const refresh = async () => {
      try {
        setSyncing(true);

        let latest: FarmerDTO | undefined;

        if (id) {
          latest = await apiGet<FarmerDTO>(`/farmers/${id}`);
        } else if (initialCpf) {
          const list = await apiGet<FarmerDTO[]>(`/farmers?cpf=${initialCpf}`);
          latest = list.find((f) => f.cpf === initialCpf) ?? list[0];
        }

        if (!cancelled && latest) {
          reset({
            fullName: latest.fullName ?? '',
            cpf: latest.cpf ?? '',
            birthDate: toDateInput(latest.birthDate ?? null),
            phone: latest.phone ?? '',
            active: latest.active, 
          });
        }
      } catch (e) {
        console.warn('Falha ao sincronizar dados do registro:', e);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    };

    refresh();
    return () => {
      cancelled = true;
    };
  }, [isEdit, id, initialCpf, reset]);

  const isActive = watch('active');

  const submit = async (data: FormData) => {
    try {
      const birthISO = fromDateInputToISO(data.birthDate);

      if (isEdit) {
        if (!id) {
          alert('ID ausente para edição. Volte e tente novamente.');
          return;
        }
        await apiSend(`/farmers/${id}`, 'PATCH', {
          fullName: data.fullName,
          birthDate: birthISO,
          phone: data.phone,
          active: data.active,
        });
      } else {
        await apiSend(`/farmers`, 'POST', {
          fullName: data.fullName,
          cpf: data.cpf,
          birthDate: birthISO,
          phone: data.phone,
        });
      }

      onSaved?.();
      if (typeof window !== 'undefined' && window.history.length > 1) router.back();
      else router.push('/farmers');
    } catch (err: unknown) {
      if (!isEdit && axios.isAxiosError(err) && err.response?.status === 409) {
        const apiMsg = (err.response.data as any)?.message;
        setError('cpf', {
          type: 'server',
          message: typeof apiMsg === 'string' ? apiMsg : 'Já existe um agricultor cadastrado com este CPF.',
        });
        document.getElementById('cpf')?.focus();
        return;
      }
      if (axios.isAxiosError(err)) {
        const apiMsg = (err.response?.data as any)?.message;
        const text = Array.isArray(apiMsg) ? apiMsg.join('; ') : apiMsg || err.message;
        alert(text ?? 'Erro ao salvar.');
      } else {
        alert('Erro ao salvar.');
      }
    }
  };

  const onCancel = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/farmers');
  };

  const disabledAll = syncing || isSubmitting;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <fieldset disabled={disabledAll} aria-busy={disabledAll}>
        <div>
          <label className="label" htmlFor="fullName">Nome</label>
          <input
            id="fullName"
            className={`input ${errors.fullName ? 'is-error' : ''}`}
            placeholder="Maria da Silva"
            {...register('fullName')}
          />
          {errors.fullName ? <p className="error">{errors.fullName.message}</p> : null}
        </div>

        <div>
          <label className="label" htmlFor="cpf">
            CPF
            {isEdit && (
              <span
                className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                style={{ background: '#2b3340', color: '#d7dee7', border: '1px solid #394253' }}
                title="CPF não pode ser alterado após criação"
              >
                🔒 Imutável
              </span>
            )}
          </label>

          <input
            id="cpf"
            className={[
              'input',
              errors.cpf ? 'is-error' : '',
              isEdit ? 'cursor-not-allowed select-none opacity-60' : '',
            ].join(' ')}
            placeholder="Somente números"
            inputMode="numeric"
            {...register('cpf')}
            disabled={isEdit}
            aria-disabled={isEdit}
            tabIndex={isEdit ? -1 : 0}
            title={isEdit ? 'CPF não pode ser alterado após criação' : 'Digite 11 números (apenas dígitos)'}
            style={isEdit ? { filter: 'blur(1px)' } : undefined}
          />

          {errors.cpf ? (
            <p className="error">{errors.cpf.message}</p>
          ) : isEdit ? (
            <p className="hint">CPF não pode ser alterado após criação.</p>
          ) : (
            <p className="hint">Digite 11 números (apenas dígitos).</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="birthDate">Nascimento</label>
          <input
            id="birthDate"
            type="date"
            className={`input ${errors.birthDate ? 'is-error' : ''}`}
            {...register('birthDate')}
          />
          {errors.birthDate ? <p className="error">{errors.birthDate.message}</p> : null}
        </div>

        <div>
          <label className="label" htmlFor="phone">Telefone</label>
          <input
            id="phone"
            className={`input ${errors.phone ? 'is-error' : ''}`}
            placeholder="+55 11 99999-0000"
            {...register('phone')}
          />
          {errors.phone ? (
            <p className="error">{errors.phone.message}</p>
          ) : (
            <p className="hint">Formato sugerido: +55 11 99999-0000</p>
          )}
        </div>

        {isEdit && (
          <div>
            <span className="label">Status</span>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" {...register('active')} />
              <span>{isActive ? 'Ativo' : 'Inativo'}</span>
            </label>
            <p className="hint">Inativo permite exclusão do registro (regra RN5).</p>
          </div>
        )}
      </fieldset>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn" disabled={disabledAll}>
          {isSubmitting ? (isEdit ? 'Atualizando…' : 'Salvando…') : isEdit ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
