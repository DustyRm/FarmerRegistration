import FarmersTable from '@/components/FarmersTable';

export default function FarmersPage() {
  return (
    <main className="container">
      <h1>Agri Registry</h1>
      <div className="card">
        <FarmersTable />
      </div>
    </main>
  );
}
