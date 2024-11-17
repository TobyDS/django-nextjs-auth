import { auth } from '@/auth';
import apiClient from '@/lib/api';
import { redirect } from 'next/navigation';

type PatientProfile = {
  id: number;
  nhs_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  dob: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  patient_coverage: string;
  patient_coverage_category: string;
  gp_name: string;
  state: string;
  recall_timer: string;
};

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  try {
    const response = await apiClient.get<PatientProfile[]>(
      '/patients/patient-profiles/'
    );

    return (
      <div>
        <h2 className='text-xl font-bold'>Server Session:</h2>
        <pre className='text-sm'>{JSON.stringify(session, null, 2)}</pre>
        <h2>Patients: </h2>
        <ul className='ml-5 list-disc'>
          {response.data.map((patient) => (
            <li key={patient.id}>{patient.full_name}</li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error('API Error:', error);
    return <div>Error loading data</div>;
  }
}
