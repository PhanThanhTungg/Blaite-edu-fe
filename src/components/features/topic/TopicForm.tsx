'use client';

import { BetaSchemaForm, ProFormColumnsType } from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/services/axios-customize.service';
import { getContextualErrorMessage } from '@/lib/utils/error.utils';

interface TopicFormValues {
  name: string;
  description?: string;
}

interface TopicFormProps {
  mode: 'create' | 'edit';
  initialValues?: TopicFormValues;
  topicId?: string | number;
  classId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TopicForm({ 
  mode, 
  initialValues, 
  topicId, 
  classId,
  onSuccess, 
  onCancel 
}: TopicFormProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp()

  // TODO: Replace serverActions.createTopic, serverActions.updateTopic calls with corresponding API when available.

  const updateTopicMutation = useMutation({
    mutationFn: (values: TopicFormValues) => {
      if (!topicId) {
        throw new Error('Topic ID is required');
      }
      console.log('🔍 Updating topic with ID:', topicId);
      console.log('🔍 Update values:', values);
      
      const updateData = {
        name: values.name,
        prompt: values.description || ''
      };
      
      console.log('🔍 API update data:', updateData);
      return api.patch(`/topics/${topicId}`, updateData).then(res => {
        console.log('🔍 Update response:', res.data);
        return res.data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['topic'] });
      message.success('Topic updated successfully!');
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = getContextualErrorMessage(error, 'updating topic');
      message.error(errorMessage);
      console.error('Error updating topic:', error);
    },
  });

  const isPending = updateTopicMutation.isPending;

  const columns : ProFormColumnsType<TopicFormValues, "text">[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      formItemProps: {
        rules: [
          { required: true, message: 'Please enter a name' },
          { min: 1, message: 'Name must be at least 1 character' },
          { max: 100, message: 'Name must be less than 100 characters' }
        ],
      },
      fieldProps: {
        placeholder: 'Enter topic name',
      },
    },
    {
      title: 'Prompt',
      dataIndex: 'description',
      valueType: 'textarea',
      fieldProps: {
        placeholder: 'Enter your learning goal and preferences for this topic (optional)',
        rows: 7,
        maxLength: 1000,
        showCount: true,
      },
    },
  ];

  // Replace topic creation submit logic:
  interface CreateTopicInput {
    name: string;
    prompt?: string;
    description?: string;
  }

  const createTopicMutation = useMutation({
    mutationFn: (values: CreateTopicInput) => {
      if (!classId) {
        throw new Error('Class ID is required');
      }
      console.log('🔍 Mutation values:', values);
      console.log('🔍 Values description:', values.description);
      
      const requestData = {
        name: values.name,
        prompt: values.description || ''
      };
      console.log('🔍 API request data:', requestData);
      console.log('🔍 API endpoint:', `/topics/class/${classId}`);
      return api.post(`/topics/class/${classId}`, requestData).then(res => {
        console.log('🔍 API response:', res.data);
        return res.data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      message.success('Topic created successfully!');
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = getContextualErrorMessage(error, 'creating topic');
      message.error(errorMessage);
      console.error('Error creating topic:', error);
    }
  });

  const handleSubmit = async (values: TopicFormValues) => {
    console.log('🔍 Form values:', values);
    console.log('🔍 Description value:', values.description);
    console.log('🔍 Description type:', typeof values.description);
    
    if (mode === 'create') {
      const createData = { 
        name: values.name, 
        description: values.description || '' 
      };
      console.log('🔍 Create data being sent:', createData);
      await createTopicMutation.mutateAsync(createData);
    } else {
      await updateTopicMutation.mutateAsync(values);
    }
  };

  return (
    <BetaSchemaForm<TopicFormValues>
      layoutType="Form"
      columns={columns}
      initialValues={initialValues}
      onFinish={handleSubmit}
      
      submitter={{
        searchConfig: {
          submitText: mode === 'create' ? 'Create Topic' : 'Update Topic',
          resetText: 'Cancel',
        },
        submitButtonProps: {
          loading: isPending,
          disabled: isPending,
        },
        resetButtonProps: {
          disabled: isPending,
          onClick: onCancel,
        },
        render: (props, doms) => (
          <div className="flex justify-end gap-2 mt-4">{doms}</div>
        ),
      }}
    />
  );
} 