'use client';

import { createKnowledge, editKnowledge } from '@/services/knowledge.service';
import { BetaSchemaForm, ProFormColumnsType } from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useEffect } from 'react';

interface KnowledgeFormValues {
  name: string;
  prompt: string;
}

interface KnowledgeFormProps {
  mode: 'create' | 'edit';
  topicId:  string;
  initialValues?: KnowledgeFormValues;
  knowledgeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onKnowledgeUpdate?: (updatedKnowledge: { id: string; prompt: string }) => void;
  parentId?: string;
  onPendingChange?: (pending: boolean) => void;
}

export default function KnowledgeForm({ 
  mode, 
  topicId,
  initialValues, 
  knowledgeId, 
  onSuccess, 
  onCancel,
  onKnowledgeUpdate,
  parentId,
  onPendingChange
}: KnowledgeFormProps) {
  const queryClient = useQueryClient();
  const {message} = App.useApp();

  // TODO: Thay thế các chỗ gọi serverActions.createKnowledge, serverActions.updateKnowledge bằng API tương ứng khi đã có.

  const updateKnowledgeMutation = useMutation({
    mutationFn: (values: KnowledgeFormValues) =>
      editKnowledge(knowledgeId as string, values.name, values.prompt),
    onSuccess: async (updatedKnowledge, variables) => {
      message.success('Knowledge updated successfully!');
      
      // Gọi callback để update UI ngay lập tức
      if (onKnowledgeUpdate && knowledgeId) {
        onKnowledgeUpdate({ id: knowledgeId, prompt: variables.prompt });
      }
      
      // Optimistic update: Update query cache immediately
      queryClient.setQueryData(['topic-knowledges', topicId], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(knowledge => 
          knowledge.id === knowledgeId 
            ? { ...knowledge, name: variables.name, prompt: variables.prompt }
            : knowledge
        );
      });
      
      // Also refetch to ensure data consistency
      queryClient.refetchQueries({ queryKey: ['knowledges', topicId] });
      queryClient.refetchQueries({ queryKey: ['topic-knowledges', topicId] });
      
      onSuccess?.();
    },
    onError: (error) => {
      message.error('Failed to update knowledge. Please try again.');
      console.error('Error updating knowledge:', error);
    },
  });

  // create mutation is declared below; pending computed after both exist

  const columns : ProFormColumnsType<KnowledgeFormValues, "text">[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      formItemProps: {
        rules: [
          { required: true, message: 'Please enter knowledge name' },
          { min: 1, message: 'Name must be at least 1 character' },
          { max: 200, message: 'Name must be less than 200 characters' }
        ],
      },
      fieldProps: {
        placeholder: 'Enter knowledge name...'
      },
      valueType: 'text',
    },
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      formItemProps: {
        rules: [
          { required: true, message: 'Please enter knowledge prompt' },
          { min: 1, message: 'Prompt must be at least 1 character' },
          { max: 1000, message: 'Prompt must be less than 1000 characters' }
        ],
      },
      fieldProps: {
        placeholder: 'Enter knowledge prompt...',
        rows: 4,
        showCount: true,
        maxLength: 1000,
      },
      valueType: 'textarea',
    },
  ] ;

  interface CreateKnowledgeInput {
    topicId: string;
    name: string;
    prompt: string;
    parentId?: string;
}

  const createKnowledgeMutation = useMutation({
    mutationFn: (values: CreateKnowledgeInput) => createKnowledge(values.topicId, values.name, values.prompt, values.parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledges', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topic-knowledges', topicId] });
      message.success('Knowledge created successfully!');
      onSuccess?.();
    },
    onError: () => {
      message.error('Failed to create knowledge.');
    }
  });

  const isPending = updateKnowledgeMutation.isPending || createKnowledgeMutation.isPending;

  // Bubble pending state to parent when creating
  useEffect(() => {
    if (onPendingChange) onPendingChange(isPending);
  }, [isPending, onPendingChange]);

  const handleSubmit = async (values: KnowledgeFormValues) => {
    if (mode === 'create') {
      await createKnowledgeMutation.mutateAsync({ topicId, name: values.name, prompt: values.prompt, parentId });
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