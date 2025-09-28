'use client';

import { Modal, Form, Input } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editClass } from '@/services/class.service';
import { useEffect } from 'react';
import { App } from 'antd';
import { getContextualErrorMessage } from '@/lib/utils/error.utils';

interface EditClassModalProps {
  open: boolean;
  class: {
    id: string;
    name: string;
    prompt?: string; // Changed from description to prompt
  } | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditClassModal({ open, class: classItem, onCancel, onSuccess }: EditClassModalProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const editClassMutation = useMutation({
    mutationFn: (values: { name: string; description?: string }) =>
      editClass(classItem!.id, values.name, values.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      message.success('Class updated successfully!');
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = getContextualErrorMessage(error, 'updating class');
      message.error(errorMessage);
      console.error('Error updating class:', error);
    },
  });

  useEffect(() => {
    if (open && classItem) {
      console.log('🔍 Debug - Setting form values:', {
        name: classItem.name,
        description: classItem.prompt || '', // Use prompt as description
      });
      form.setFieldsValue({
        name: classItem.name,
        description: classItem.prompt || '', // Use prompt as description
      });
    }
  }, [open, classItem, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await editClassMutation.mutateAsync(values);
    } catch (error) {
      // Form validation error
    }
  };

  return (
    <Modal
      title="Edit Class"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Update"
      cancelText="Cancel"
      confirmLoading={editClassMutation.isPending}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Class Name"
          rules={[
            { required: true, message: 'Please enter class name' },
            { max: 100, message: 'Class name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter class name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { max: 1000, message: 'Description cannot exceed 1000 characters' }
          ]}
        >
          <Input.TextArea
            placeholder="Enter class description (optional)"
            rows={3}
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
} 