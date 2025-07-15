'use client';

import TopicForm from './TopicForm';

interface CreateTopicFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateTopicForm({ onSuccess, onCancel }: CreateTopicFormProps) {
  return (
    <TopicForm
      mode="create"
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
} 