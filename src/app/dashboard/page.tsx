import { auth } from '@/auth';
import api from '@/lib/api';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  const { data, error } = await api.GET('/patients/patient-profiles/');

  if (error) {
    console.error('API Error:', error);
    return <div>Error loading data</div>;
  }

  return (
    <div>
      <h2 className='text-xl font-bold'>Server Session:</h2>
      <pre className='text-sm'>{JSON.stringify(session, null, 2)}</pre>
      <h2>Patients: </h2>
      <ul className='ml-5 list-disc'>
        {data.map((patient) => (
          <li key={patient.id}>{patient.full_name}</li>
        ))}
      </ul>
    </div>
  );
}
