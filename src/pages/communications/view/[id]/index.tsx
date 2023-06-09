import AppLayout from 'layout/app-layout';
import Link from 'next/link';
import React, { useState } from 'react';
import { Text, Box, Spinner, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Button } from '@chakra-ui/react';
import { getCommunicationById } from 'apiSdk/communications';
import { Error } from 'components/error';
import { CommunicationInterface } from 'interfaces/communication';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';

function CommunicationViewPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<CommunicationInterface>(
    () => (id ? `/communications/${id}` : null),
    () =>
      getCommunicationById(id, {
        relations: ['user_communication_sender_idTouser', 'user_communication_receiver_idTouser'],
      }),
  );

  const [deleteError, setDeleteError] = useState(null);

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Communication Detail View
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {error && <Error error={error} />}
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <Text fontSize="md" fontWeight="bold">
              Message: {data?.message}
            </Text>
            <Text fontSize="md" fontWeight="bold">
              Sender:{' '}
              <Link href={`/users/view/${data?.user_communication_sender_idTouser?.id}`}>
                {data?.user_communication_sender_idTouser?.role}
              </Link>
            </Text>
            <Text fontSize="md" fontWeight="bold">
              Receiver:{' '}
              <Link href={`/users/view/${data?.user_communication_receiver_idTouser?.id}`}>
                {data?.user_communication_receiver_idTouser?.role}
              </Link>
            </Text>
          </>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'communication',
  operation: AccessOperationEnum.READ,
})(CommunicationViewPage);
