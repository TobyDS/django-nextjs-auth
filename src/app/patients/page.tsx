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

  const { queryClient, ...$api } = useApi();

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
  const newFirstName = patientToUpdate?.first_name === 'John' ? 'Jane' : 'John';
  const newLastName = patientToUpdate?.last_name === 'Doe' ? 'Smith' : 'Doe';
  const mutation = $api.useMutation('put', '/patients/patient-profiles/{id}/', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get', '/patients/patient-profiles/'],
      });
      queryClient.invalidateQueries({
        queryKey: ['get', '/patients/patient-profiles/{id}/'],
      });
    },
  });
  const handleUpdate = () =>
    mutation.mutateAsync({
      params: {
        path: {
          id: 6,
        },
      },
      body: {
        ...patientToUpdate!,
        first_name: newFirstName,
        last_name: newLastName,
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
        <Link href='/'>
          <Button>Go to Server Page</Button>
        </Link>
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
      <h2 className='mt-5 font-bold text-xl'>Patients: </h2>
      <ul className='ml-5 list-disc'>
        {patients.map((patient) => (
          <li key={patient.id}>{`ID ${patient.id}: ${patient.full_name}`}</li>
        ))}
      </ul>
      <Button
        className='m-3'
        onClick={handleUpdate}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Updating...' : 'Update Patient Name'}
      </Button>
    </div>
  );
}
