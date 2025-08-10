'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTopics } from '@/services/topic.service';
import { PageContainer } from '@ant-design/pro-components'
import { Button, Table, Tag, Spin, Alert, Popconfirm, Typography, Dropdown } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons'
import Link from 'next/link'
import CreateTopicModal from '@/components/features/topic/CreateTopicModal'
import EditTopicModal from '@/components/features/topic/EditTopicModal'
import DeleteTopicModal from '@/components/features/topic/DeleteTopicModal'

const { Text } = Typography

interface TopicData {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

export default function TopicsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null)
  const queryClient = useQueryClient()

  const { data: topics = [], isLoading, error } = useQuery({
    queryKey: ['topics'],
    queryFn: () => getTopics('default'), // Using default classId for now
  })

  const handleDeleteTopic = (topic: TopicData) => {
    setSelectedTopic(topic)
    setDeleteModalOpen(true)
  }

  const handleEditTopic = (topic: TopicData) => {
    setSelectedTopic(topic)
    setEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    setEditModalOpen(false)
    setSelectedTopic(null)
  }

  const handleEditCancel = () => {
    setEditModalOpen(false)
    setSelectedTopic(null)
  }

  const handleDeleteSuccess = () => {
    setDeleteModalOpen(false)
    setSelectedTopic(null)
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setSelectedTopic(null)
  }

  // Table columns configuration
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TopicData) => (
        <div>
          <div className="font-medium text-gray-900">{name}</div>
        </div>
      ),
    },
    {
      title: 'Knowledges',
      dataIndex: 'knowledges',
      key: 'knowledges',
      render: () => (
        <Tag color="blue">0</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: TopicData) => {
        const items = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: <Link href={`/dashboard/topics/${record.id}`}>View Topic</Link>,
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: <span onClick={() => handleEditTopic(record)}>Edit Topic</span>,
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: <span onClick={() => handleDeleteTopic(record)}>Delete Topic</span>,
            danger: true,
          },
        ]

        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              size="small"
              className="flex items-center justify-center"
            />
          </Dropdown>
        )
      },
    },
  ]

  if (error) {
    return (
      <PageContainer title="Topics">
        <Alert
          message="Error"
          description="Failed to load topics. Please try again."
          type="error"
          showIcon
        />
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer title="Topics">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </PageContainer>
    )
  }

  return (
    <>
      <PageContainer
        title="Topics"
        breadcrumb={{
          items: [
            { path: '/', breadcrumbName: 'Home' },
            { path: '/dashboard/topics', breadcrumbName: 'Topics' },
          ],
        }}
        extra={[
          <Button 
            key="create" 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Topic
          </Button>
        ]}
      >
        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            dataSource={topics}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} topics`,
            }}
            loading={isLoading}
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <Text type="secondary">No topics found</Text>
                </div>
              ),
            }}
          />
        </div>
      </PageContainer>

      {/* Create Topic Modal */}
      <CreateTopicModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => setCreateModalOpen(false)}
      />

      {/* Edit Topic Modal */}
      <EditTopicModal
        open={editModalOpen}
        topic={selectedTopic}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Topic Modal */}
      <DeleteTopicModal
        open={deleteModalOpen}
        topicId={selectedTopic?.id || null}
        topicName={selectedTopic?.name || ''}
        onCancel={handleDeleteCancel}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
} 