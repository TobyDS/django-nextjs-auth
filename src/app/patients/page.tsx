'use client';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import useApi from '@/hooks/useApi';
import useSafeSession from '@/hooks/useSafeSession';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function PatientList() {
  const session = useSafeSession();

  const $api = useApi();

  // Get logic example
  const {
    isLoading,
    data: patients,
    error,
  } = $api.useQuery('get', '/patients/patient-profiles/');

  // Mutation example
  const { data: patientToUpdate } = $api.useQuery(
    'get',
    '/patients/patient-profiles/{id}/',
    { params: { path: { id: 6 } } }
  );
  const mutation = $api.useMutation('put', '/patients/patient-profiles/{id}/');
  const handleUpdate = () =>
    mutation.mutateAsync({
      params: {
        path: {
          id: 6,
        },
      },
      body: {
        ...patientToUpdate!,
        last_name: 'Doe',
        first_name: 'John',
      },
    });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-4'>
        <p className='text-gray-500'>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return <div className='p-4 text-red-500'>Error: {error}</div>;
  }

  if (!patients?.length) {
    return <p className='text-gray-500'>No patients found</p>;
  }

  return (
    <div>
      <div className='flex-row m-2 space-x-2'>
        <Button>
          <Link href='/'>Go to Server Page</Link>
        </Button>
        <Button onClick={() => signOut()}>Logout</Button>
      </div>
      <Accordion type='single' collapsible>
        <AccordionItem value='item-1'>
          <AccordionTrigger className='text-xl font-bold'>
            Client Session:
          </AccordionTrigger>
          <AccordionContent>
            <pre className='text-sm'>{JSON.stringify(session, null, 2)}</pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
      <Button onClick={handleUpdate} disabled={mutation.isPending}>
        {mutation.isPending ? 'Updating...' : 'Update Patient'}
      </Button>
    </div>
  );
}
