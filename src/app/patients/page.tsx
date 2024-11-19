'use client';

import { useApi } from '@/hooks/useApi';
import useSession from '@/hooks/useSession';

interface Patient {
  id: number;
  full_name: string;
  email?: string;
}

export default function PatientList() {
  const session = useSession();
  const {
    data: patients,
    loading,
    error,
    refetch,
  } = useApi<Patient[]>('/patients/patient-profiles/');

  if (loading) {
    return (
      <div className='flex justify-center items-center p-4'>
        <p className='text-gray-500'>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 text-red-500'>
        Error: {error}
        <button
          onClick={refetch}
          className='ml-2 text-blue-500 hover:underline'
        >
          Retry
        </button>
      </div>
    );
  }

  if (!patients?.length) {
    return <p className='text-gray-500'>No patients found</p>;
  }

  return (
    <div>
      <h2 className='text-xl font-bold'>Client Session:</h2>
      <pre className='text-sm'>{JSON.stringify(session, null, 2)}</pre>
      <h2 className='text-xl font-bold'>Patients</h2>
      <span>Total: {patients?.length || 0}</span>
      <ul className=''>
        {patients.map((patient) => (
          <li key={patient.id} className='py-2'>
            <div className='flex items-center space-x-4'>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {patient.full_name}
                </p>
                {patient.email && (
                  <p className='text-sm text-gray-500 truncate'>
                    {patient.email}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
