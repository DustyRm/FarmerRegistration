'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { apiSend } from '@/lib/api';

const schema = z.object({
  fullName: z.string().trim().min(1, 'Nome é obrigatório').max(120, 'Nome muito longo'),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => /^\d{11}$/.test(v), 'CPF deve conter 11 números'),
  birthDate: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Data de nascimento inválida'),
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

export default function FarmerForm({
  mode = 'create',
  id,
  initial,
  onSaved,
}: {
  mode?: Mode;
  id?: string;
  initial?: Partial<FormData>;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initial?.fullName ?? '',
      cpf: initial?.cpf ?? '',
      birthDate: initial?.birthDate ?? '',
      phone: initial?.phone ?? '',
      active: initial?.active ?? true,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        fullName: initial.fullName ?? '',
        cpf: initial.cpf ?? '',
        birthDate: initial.birthDate ?? '',
        phone: initial.phone ?? '',
        active: initial.active ?? true,
      });
    }
  }, [initial, reset]);

  const isActive = watch('active', initial?.active ?? true);

  const submit = async (data: FormData) => {
    try {
      if (isEdit) {
        if (!id) {
          alert('ID ausente para edição. Volte e tente novamente.');
          return;
        }
        await apiSend(`/farmers/${id}`, 'PATCH', {
          fullName: data.fullName,
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
          phone: data.phone,
          active: data.active,
        });
      } else {
        await apiSend(`/farmers`, 'POST', {
          fullName: data.fullName,
          cpf: data.cpf,
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
          phone: data.phone,
        });
      }

      onSaved?.();
      if (typeof window !== 'undefined' && window.history.length > 1) router.back();
      else router.push('/farmers');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar.';
      alert(msg);
    }
  };

  const onCancel = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/farmers');
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
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
          // “embacado” leve no modo edição
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

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? (isEdit ? 'Atualizando…' : 'Salvando…') : isEdit ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
