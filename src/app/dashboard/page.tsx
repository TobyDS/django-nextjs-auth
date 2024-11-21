import { auth, signOut } from '@/auth';
import api from '@/lib/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  const { data, error } = await api.GET('/patients/patient-profiles/');

  async function updatePatientName() {
    'use server';
    const patientId = 6;
    const { data } = await api.GET(`/patients/patient-profiles/{id}/`, {
      params: { path: { id: patientId } },
    });
    // Conditionally pick new name for patient for testing purposes
    const newFirstName = data?.first_name === 'John' ? 'Jane' : 'John';
    const newLastName = data?.last_name === 'Doe' ? 'Smith' : 'Doe';
    // Construct updated patient object
    const updatedPatient = {
      ...data!,
      first_name: newFirstName,
      last_name: newLastName,
    };

    // Make Put request to update patient
    await api.PUT(`/patients/patient-profiles/{id}/`, {
      body: updatedPatient,
      params: { path: { id: patientId } },
    });
    // Invalidate cache to refetch data
    revalidatePath('/dashboard');
  }

  if (error) {
    console.error('API Error:', error);
    return <div>Error loading data</div>;
  }

  return (
    <div>
      <form
        className='flex-row m-2 space-x-2'
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <Button>
          <Link href='/patients'>Go to Client Page</Link>
        </Button>
        <Button type='submit'>Logout</Button>
      </form>
      <Accordion type='single' collapsible>
        <AccordionItem value='item-1'>
          <AccordionTrigger className='text-xl font-bold'>
            Server Session:
          </AccordionTrigger>
          <AccordionContent>
            <pre className='text-sm'>{JSON.stringify(session, null, 2)}</pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <h2 className='mt-5 font-bold text-xl'>Patients: </h2>
      <ul className='ml-5 list-disc'>
        {data.map((patient) => (
          <li key={patient.id}>{`ID ${patient.id}: ${patient.full_name}`}</li>
        ))}
      </ul>
      <Button className='m-3' onClick={updatePatientName}>
        Update Patient Name
      </Button>
    </div>
  );
}
