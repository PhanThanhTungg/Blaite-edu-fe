'use client';

import { ProForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Modal, Button, message } from 'antd';

interface AddTopicModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

export default function AddTopicModal({ 
  visible, 
  onCancel, 
  onSubmit, 
  loading = false 
}: AddTopicModalProps) {
  return (
    <Modal
      title="Add New Learning Topic"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <ProForm
        onFinish={onSubmit}
        layout="vertical"
        submitter={{
          render: (props, doms) => {
            return (
              <div className="flex justify-end space-x-2">
                <Button onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => props.submit()} 
                  loading={loading}
                >
                  Add Topic
                </Button>
              </div>
            );
          },
        }}
      >
        <ProFormText
          name="title"
          label="Topic Title"
          placeholder="e.g., JavaScript Fundamentals"
          rules={[{ required: true, message: 'Please enter topic title' }]}
        />
        <ProFormTextArea
          name="description"
          label="Description"
          placeholder="Describe what you want to learn about this topic (optional)"
          fieldProps={{
            rows: 3,
          }}
        />
        <ProFormSelect
          name="category"
          label="Category"
          options={[
            { label: 'Programming', value: 'Programming' },
            { label: 'Frontend', value: 'Frontend' },
            { label: 'Backend', value: 'Backend' },
            { label: 'Computer Science', value: 'Computer Science' },
            { label: 'Mathematics', value: 'Mathematics' },
            { label: 'Language', value: 'Language' },
            { label: 'Other', value: 'Other' },
          ]}
          rules={[{ required: true, message: 'Please select category' }]}
        />
        <ProFormSelect
          name="difficulty"
          label="Difficulty Level"
          options={[
            { label: 'Beginner', value: 'Beginner' },
            { label: 'Intermediate', value: 'Intermediate' },
            { label: 'Advanced', value: 'Advanced' },
          ]}
          rules={[{ required: true, message: 'Please select difficulty' }]}
        />
      </ProForm>
    </Modal>
  );
} 