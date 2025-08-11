'use client';

import { Modal } from 'antd';
import KnowledgeForm from './KnowledgeForm';

interface KnowledgeData {
  id: string | number;
  name?: string;
  prompt?: string;
  content?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  topicId: string | number;
}

interface EditKnowledgeModalProps {
  open: boolean;
  knowledge: KnowledgeData | null;
  onCancel: () => void;
  onSuccess?: () => void;
  onKnowledgeUpdate?: (updatedKnowledge: { id: string; prompt: string }) => void;
}

export default function EditKnowledgeModal({ open, knowledge, onCancel, onSuccess, onKnowledgeUpdate }: EditKnowledgeModalProps) {
  const handleCancel = () => {
    onCancel();
  };

  if (!knowledge) {
    return null;
  }

  return (
    <Modal
      title="Edit Knowledge"
      open={open}
      onCancel={handleCancel}
      footer={null}
      maskClosable={true}
      closable={true}
      destroyOnHidden
      width={600}
    >
      <KnowledgeForm
        mode="edit"
        topicId={knowledge.topicId+""}
        knowledgeId={knowledge.id+""}
        initialValues={{
          content: knowledge.prompt || knowledge.content || '',
        }}
        onSuccess={onSuccess}
        onKnowledgeUpdate={onKnowledgeUpdate}
        onCancel={handleCancel}
      />
    </Modal>
  );
} 