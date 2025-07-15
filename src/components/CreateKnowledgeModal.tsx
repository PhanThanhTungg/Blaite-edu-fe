"use client";

import { Modal } from 'antd';
import KnowledgeForm from './KnowledgeForm';

interface CreateKnowledgeModalProps {
  open: boolean;
  topicId: number;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function CreateKnowledgeModal({ open, topicId, onCancel, onSuccess }: CreateKnowledgeModalProps) {
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
      destroyOnClose
      width={600}
    >
      <KnowledgeForm
        mode="create"
        topicId={topicId}
        onSuccess={onSuccess}
        onCancel={handleCancel}
      />
    </Modal>
  );
} 