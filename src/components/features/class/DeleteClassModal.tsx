'use client';

import { Modal, Typography } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { deleteClass } from '@/services/class.service';

const { Text } = Typography;

interface DeleteClassModalProps {
  open: boolean;
  classId: string | null;
  className: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function DeleteClassModal({
  open,
  classId,
  className,
  onCancel,
  onSuccess,
}: DeleteClassModalProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      message.success('Class deleted successfully!');
      onSuccess?.();
    },
    onError: () => {
      message.error('Failed to delete class.');
    },
  });

  const handleDelete = async () => {
    if (classId) {
      await deleteClassMutation.mutateAsync(classId);
    }
  };

  return (
    <Modal
      title="Delete Class"
      open={open}
      onCancel={onCancel}
      onOk={handleDelete}
      okText="Delete"
      cancelText="Cancel"
      okType="danger"
      confirmLoading={deleteClassMutation.isPending}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <Text>
          Are you sure you want to delete the class{" "}
          <Text strong>&quot;{className}&quot;</Text>?
        </Text>
      </div>
      <Text type="secondary">
        This action cannot be undone. All topics, knowledges, questions, and answers
        associated with this class will be permanently deleted.
      </Text>
    </Modal>
  );
} 