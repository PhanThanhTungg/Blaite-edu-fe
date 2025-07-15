'use client';

import { BetaSchemaForm, ProFormColumnsType } from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/hooks/api';

interface TopicFormValues {
  name: string;
  description?: string;
}

interface TopicFormProps {
  mode: 'create' | 'edit';
  initialValues?: TopicFormValues;
  topicId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TopicForm({ 
  mode, 
  initialValues, 
  topicId, 
  onSuccess, 
  onCancel 
}: TopicFormProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp()

  // TODO: Thay thế các chỗ gọi serverActions.createTopic, serverActions.updateTopic bằng API tương ứng khi đã có.

  const updateTopicMutation = useMutation({
    mutationFn: (values: TopicFormValues) => 
      // serverActions.updateTopic(topicId!, values.name), // This line was removed
      // TODO: Replace with actual API call
      Promise.resolve({ success: true, message: 'Topic updated successfully!' }),
    onSuccess: () => {
      message.success('Topic updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess?.();
    },
    onError: (error) => {
      message.error('Failed to update topic. Please try again.');
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
      title: 'Description',
      dataIndex: 'description',
      valueType: 'textarea',
      fieldProps: {
        placeholder: 'Enter topic description (optional)',
        rows: 3,
        maxLength: 500,
        showCount: true,
      },
    },
  ];

  // Thay thế logic submit tạo topic:
  interface CreateTopicInput {
    name: string;
    description?: string;
  }

  const createTopicMutation = useMutation({
    mutationFn: (values: CreateTopicInput) => api.post('/api/topics', values).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      message.success('Topic created successfully!');
      onSuccess?.();
    },
    onError: () => {
      message.error('Failed to create topic.');
    }
  });

  const handleSubmit = async (values: TopicFormValues) => {
    if (mode === 'create') {
      await createTopicMutation.mutateAsync({ name: values.name, description: values.description });
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