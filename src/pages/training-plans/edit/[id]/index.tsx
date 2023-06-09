import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
} from '@chakra-ui/react';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { useFormik, FormikHelpers } from 'formik';
import { getTrainingPlanById, updateTrainingPlanById } from 'apiSdk/training-plans';
import { Error } from 'components/error';
import { trainingPlanValidationSchema } from 'validationSchema/training-plans';
import { TrainingPlanInterface } from 'interfaces/training-plan';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { PlayerInterface } from 'interfaces/player';
import { getPlayers } from 'apiSdk/players';

function TrainingPlanEditPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<TrainingPlanInterface>(
    () => (id ? `/training-plans/${id}` : null),
    () => getTrainingPlanById(id),
  );
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: TrainingPlanInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updateTrainingPlanById(id, values);
      mutate(updated);
      resetForm();
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<TrainingPlanInterface>({
    initialValues: data,
    validationSchema: trainingPlanValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Edit Training Plan
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {error && <Error error={error} />}
        {formError && <Error error={formError} />}
        {isLoading || (!formik.values && !error) ? (
          <Spinner />
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl id="coach_id" mb="4" isInvalid={!!formik.errors?.coach_id}>
              <FormLabel>Coach</FormLabel>
              <Input type="text" name="coach_id" value={formik.values?.coach_id} onChange={formik.handleChange} />
              {formik.errors.coach_id && <FormErrorMessage>{formik.errors?.coach_id}</FormErrorMessage>}
            </FormControl>
            <FormControl id="plan" mb="4" isInvalid={!!formik.errors?.plan}>
              <FormLabel>Plan</FormLabel>
              <Input type="text" name="plan" value={formik.values?.plan} onChange={formik.handleChange} />
              {formik.errors.plan && <FormErrorMessage>{formik.errors?.plan}</FormErrorMessage>}
            </FormControl>
            <AsyncSelect<PlayerInterface>
              formik={formik}
              name={'player_id'}
              label={'Player'}
              placeholder={'Select Player'}
              fetcher={getPlayers}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record.user_id}
                </option>
              )}
            />
            <Button isDisabled={!formik.isValid || formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
              Submit
            </Button>
          </form>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'training_plan',
  operation: AccessOperationEnum.UPDATE,
})(TrainingPlanEditPage);
