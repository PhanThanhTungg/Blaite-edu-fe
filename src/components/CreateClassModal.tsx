'use client';

import { Modal, Form, Input } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClass } from '@/hooks/api';
import { App } from 'antd';

interface CreateClassModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CreateClassModal({ open, onCancel, onSuccess }: CreateClassModalProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const createClassMutation = useMutation({
    mutationFn: (values: { name: string; description?: string }) =>
      createClass(values.name, values.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      message.success('Class created successfully!');
      form.resetFields();
      onSuccess();
    },
    onError: () => {
      message.error('Failed to create class.');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createClassMutation.mutateAsync(values);
    } catch (error) {
      // Form validation error
    }
  };

  return (
    <Modal
      title="Create New Class"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Create"
      cancelText="Cancel"
      confirmLoading={createClassMutation.isPending}
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
            { max: 500, message: 'Description cannot exceed 500 characters' }
          ]}
        >
          <Input.TextArea
            placeholder="Enter class description (optional)"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
} 