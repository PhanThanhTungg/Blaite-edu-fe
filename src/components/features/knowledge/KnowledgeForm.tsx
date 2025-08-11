'use client';

import { createKnowledge, editKnowledge } from '@/services/knowledge.service';
import { BetaSchemaForm, ProFormColumnsType } from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';

interface KnowledgeFormValues {
  content: string;
}

interface KnowledgeFormProps {
  mode: 'create' | 'edit';
  topicId:  string;
  initialValues?: KnowledgeFormValues;
  knowledgeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onKnowledgeUpdate?: (updatedKnowledge: { id: string; prompt: string }) => void;
}

export default function KnowledgeForm({ 
  mode, 
  topicId,
  initialValues, 
  knowledgeId, 
  onSuccess, 
  onCancel,
  onKnowledgeUpdate
}: KnowledgeFormProps) {
  const queryClient = useQueryClient();
  const {message} = App.useApp();

  // TODO: Thay thế các chỗ gọi serverActions.createKnowledge, serverActions.updateKnowledge bằng API tương ứng khi đã có.

  const updateKnowledgeMutation = useMutation({
    mutationFn: (values: KnowledgeFormValues) =>
      editKnowledge(knowledgeId as string, values.content),
    onSuccess: async (updatedKnowledge, variables) => {
      message.success('Knowledge updated successfully!');
      
      // Gọi callback để update UI ngay lập tức
      if (onKnowledgeUpdate && knowledgeId) {
        onKnowledgeUpdate({ id: knowledgeId, prompt: variables.content });
      }
      
      // Optimistic update: Update query cache immediately
      queryClient.setQueryData(['topic-knowledges', topicId], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(knowledge => 
          knowledge.id === knowledgeId 
            ? { ...knowledge, prompt: variables.content }
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

  const isPending = updateKnowledgeMutation.isPending;

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

  interface CreateKnowledgeInput {
    topicId: string;
    content: string;
}

  const createKnowledgeMutation = useMutation({
    mutationFn: (values: CreateKnowledgeInput) => createKnowledge(values.topicId, values.content),
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