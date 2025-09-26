"use client";

import { Modal } from 'antd';
import KnowledgeForm from './KnowledgeForm';

interface CreateKnowledgeModalProps {
  open: boolean;
  topicId: string | number;
  onCancel: () => void;
  onSuccess?: () => void;
  name?: string;
  prompt?: string;
  parentId?: string;
  onPendingChange?: (pending: boolean) => void;
}

export default function CreateKnowledgeModal({ open, topicId, onCancel, onSuccess, name, prompt, parentId, onPendingChange }: CreateKnowledgeModalProps) {
  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title="Create New Knowledge"
      open={open}
      onCancel={handleCancel}
      footer={null}
      maskClosable={true}
      closable={true}
      destroyOnHidden
      width={600}
    >
      <KnowledgeForm
        mode="create"
        topicId={topicId+""}
        initialValues={{ name: name ?? '', content: prompt ?? '' }}
        parentId={parentId}
        onPendingChange={onPendingChange}
        onSuccess={onSuccess}
        onCancel={handleCancel}
      />
    </Modal>
  );
} 