'use client';

import useApi from '@/hooks/useApi';
import useSafeSession from '@/hooks/useSafeSession';

export default function PatientList() {
  const session = useSafeSession();

  const $api = useApi();

  const {
    isLoading,
    data: patients,
    error,
  } = $api.useQuery('get', '/patients/patient-profiles/');

  // const mutation = $api.useMutation('post', '/patients/patient-profiles/');
  // const handleUpdate = async () => {
  //   try {
  //     await mutation.mutateAsync({
  //       params: {
  //         id: '3', // or 3 depending on your API spec
  //       },
  //       body: {
  //         // whatever fields you want to update
  //         first_name: 'John',
  //         last_name: 'Doe',
  //       },
  //     });
  //     // Optionally invalidate queries to refetch data
  //     api.queryClient.invalidateQueries({
  //       queryKey: ['get', '/patients/patient-profiles/'],
  //     });
  //   } catch (error) {
  //     console.error('Failed to update:', error);
  //   }
  // };

  // return (
  //   <button onClick={handleUpdate} disabled={mutation.isPending}>
  //     {mutation.isPending ? 'Updating...' : 'Update Patient'}
  //   </button>
  // );

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
