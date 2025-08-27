'use client';

import { useRouter } from 'next/navigation';
import FarmerForm from '@/components/FarmerForm';

export default function NewFarmerPage() {
  const router = useRouter();
  return (
    <main className="container">
      <h1>Novo Agricultor</h1>
      <div className="card">
        <FarmerForm mode="create" onSaved={() => router.push('/farmers')} />
      </div>
    </main>
  );
}
