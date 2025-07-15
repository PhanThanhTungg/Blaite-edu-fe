'use client';

import { BetaSchemaForm, ProFormColumnsType } from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serverActions } from '@/hooks/useServerActions';
import { App } from 'antd';

interface KnowledgeFormValues {
  content: string;
}

interface KnowledgeFormProps {
  mode: 'create' | 'edit';
  topicId: number;
  initialValues?: KnowledgeFormValues;
  knowledgeId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function KnowledgeForm({ 
  mode, 
  topicId,
  initialValues, 
  knowledgeId, 
  onSuccess, 
  onCancel 
}: KnowledgeFormProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp()

  const createKnowledgeMutation = useMutation({
    mutationFn: ({ topicId, content }: { topicId: number; content: string }) => 
      serverActions.createKnowledge(topicId, content),
    onSuccess: () => {
      message.success('Knowledge created successfully!');
      queryClient.invalidateQueries({ queryKey: ['knowledges', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topic-knowledges', topicId] });
      onSuccess?.();
    },
    onError: (error) => {
      message.error('Failed to create knowledge. Please try again.');
      console.error('Error creating knowledge:', error);
    },
  });

  const updateKnowledgeMutation = useMutation({
    mutationFn: (values: KnowledgeFormValues) => 
      serverActions.updateKnowledge(knowledgeId!, values.content),
    onSuccess: () => {
      message.success('Knowledge updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['knowledges', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topic-knowledges', topicId] });
      onSuccess?.();
    },
    onError: (error) => {
      message.error('Failed to update knowledge. Please try again.');
      console.error('Error updating knowledge:', error);
    },
  });

  const isPending = createKnowledgeMutation.isPending || updateKnowledgeMutation.isPending;

  const columns : ProFormColumnsType<KnowledgeFormValues, "text">[] = [
    {
      title: 'Content',
      dataIndex: 'content',
      formItemProps: {
        rules: [
          { required: true, message: 'Please enter knowledge content' },
          { min: 1, message: 'Content must be at least 1 character' },
          { max: 1000, message: 'Content must be less than 1000 characters' }
        ],
      },
      fieldProps: {
        placeholder: 'Enter knowledge content...',
        rows: 4,
        showCount: true,
        maxLength: 1000,
      },
      valueType: 'textarea',
    },
  ] ;

  const handleSubmit = async (values: KnowledgeFormValues) => {
    if (mode === 'create') {
      await createKnowledgeMutation.mutateAsync({ topicId, content: values.content });
    } else {
      await updateKnowledgeMutation.mutateAsync(values);
    }
    return true;
  };

  return (
    <BetaSchemaForm<KnowledgeFormValues>
      layoutType="Form"
      columns={columns}
      initialValues={initialValues}
      onFinish={handleSubmit}
      
      submitter={{
        searchConfig: {
          submitText: mode === 'create' ? 'Create Knowledge' : 'Update Knowledge',
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