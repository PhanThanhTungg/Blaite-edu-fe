'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Card, Descriptions, Tag, Button, Spin, Alert, Typography, Row, Col } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, BookOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { getTopic, getKnowledges } from '@/hooks/api';
import EditTopicModal from '@/components/EditTopicModal';
import KnowledgeCard from '@/components/KnowledgeCard';
import DeleteTopicModal from '@/components/DeleteTopicModal';
import CreateKnowledgeModal from '@/components/CreateKnowledgeModal';
import EditKnowledgeModal from '@/components/EditKnowledgeModal';
import DeleteKnowledgeModal from '@/components/DeleteKnowledgeModal';

const { Title, Text, Paragraph } = Typography

interface TopicData {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

export default function TopicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.topicId as string
  const queryClient = useQueryClient()
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [createKnowledgeModalOpen, setCreateKnowledgeModalOpen] = useState(false)
  const [editKnowledgeModalOpen, setEditKnowledgeModalOpen] = useState(false)
  const [deleteKnowledgeModalOpen, setDeleteKnowledgeModalOpen] = useState(false)
  const [selectedKnowledge, setSelectedKnowledge] = useState<any>(null)

  const { data: topic, isLoading, error } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: () => getTopic(topicId),
    enabled: !!topicId,
  })

  const { data: knowledges = [] } = useQuery({
    queryKey: ['topic-knowledges', topicId],
    queryFn: () => getKnowledges(topicId),
    enabled: !!topicId,
  })

  const handleEditSuccess = () => {
    setEditModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ['topic', topicId] })
  }

  const handleEditCancel = () => {
    setEditModalOpen(false)
  }

  const handleDeleteSuccess = () => {
    setDeleteModalOpen(false)
    router.push('/dashboard/topics')
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
  }

  const handleEditKnowledge = (knowledge: any) => {
    setSelectedKnowledge(knowledge)
    setEditKnowledgeModalOpen(true)
  }

  const handleDeleteKnowledge = (knowledgeId: string) => {
    const knowledge = knowledges.find((k: any) => k.id === knowledgeId)
    setSelectedKnowledge({
      id: knowledgeId,
      content: knowledge?.content || ''
    })
    setDeleteKnowledgeModalOpen(true)
  }

  if (error) {
    return (
      <PageContainer title="Topic Detail">
        <Alert
          message="Error"
          description="Failed to load topic. Please try again."
          type="error"
          showIcon
        />
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer title="Topic Detail">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </PageContainer>
    )
  }

  if (!topic) {
    return (
      <PageContainer title="Topic Detail">
        <Alert
          message="Not Found"
          description="Topic not found."
          type="warning"
          showIcon
        />
      </PageContainer>
    )
  }

  return (
    <>
      <PageContainer
        title={topic.name}
        breadcrumb={{
          items: [
            { path: '/', breadcrumbName: 'Home' },
            { path: '/dashboard/topics', breadcrumbName: 'Topics' },
            { path: `/dashboard/topics/${topic.id}`, breadcrumbName: topic.name },
          ],
        }}
        extra={[
          <Button 
            key="edit" 
            icon={<EditOutlined />}
            onClick={() => setEditModalOpen(true)}
          >
            Edit
          </Button>
        ]}
      >
        <Row gutter={[16, 16]}>
          {/* Topic Information */}
          <Col xs={24}>
            <Card title="Topic Information">
              <Descriptions column={1}>
                <Descriptions.Item label="Name">
                  <Text strong>{topic.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="green">Active</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(topic.createdAt).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {new Date(topic.updatedAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Knowledges Section */}
          <Col xs={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text strong style={{ fontSize: 18 }}>Knowledges</Text>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setCreateKnowledgeModalOpen(true)}
              >
                Add Knowledge
              </Button>
            </div>
            
            {knowledges.length > 0 ? (
              <Row gutter={[16, 16]}>
                {knowledges.map((knowledge: any) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={knowledge.id}>
                    <KnowledgeCard 
                      knowledge={{
                        id: knowledge.id,
                        content: knowledge.content,
                        createdAt: knowledge.createdAt,
                        updatedAt: knowledge.updatedAt,
                        topicId: knowledge.topicId,
                        questionsCount: 0,
                        answersCount: 0,
                        avgScore: 0,
                      }}
                      onView={(knowledge) => router.push(`/dashboard/topics/${topicId}/knowledges/${knowledge.id}`)}
                      onEdit={handleEditKnowledge}
                      onDelete={handleDeleteKnowledge}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Card style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
                  No knowledges yet
                </Text>
              </Card>
            )}
          </Col>
        </Row>
      </PageContainer>

      {/* Edit Topic Modal */}
      <EditTopicModal
        open={editModalOpen}
        topic={topic}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Topic Modal */}
      <DeleteTopicModal
        open={deleteModalOpen}
        topicId={topic?.id || null}
        topicName={topic?.name || ''}
        onCancel={handleDeleteCancel}
        onSuccess={handleDeleteSuccess}
      />

      {/* Create Knowledge Modal */}
      <CreateKnowledgeModal
        open={createKnowledgeModalOpen}
        topicId={topicId}
        onCancel={() => setCreateKnowledgeModalOpen(false)}
        onSuccess={() => setCreateKnowledgeModalOpen(false)}
      />

      {/* Edit Knowledge Modal */}
      <EditKnowledgeModal
        open={editKnowledgeModalOpen}
        knowledge={selectedKnowledge}
        onCancel={() => {
          setEditKnowledgeModalOpen(false)
          setSelectedKnowledge(null)
        }}
        onSuccess={() => {
          setEditKnowledgeModalOpen(false)
          setSelectedKnowledge(null)
        }}
      />

      {/* Delete Knowledge Modal */}
      <DeleteKnowledgeModal
        open={deleteKnowledgeModalOpen}
        knowledgeId={selectedKnowledge?.id || null}
        knowledgeContent={selectedKnowledge?.content || ''}
        topicId={topicId}
        onCancel={() => {
          setDeleteKnowledgeModalOpen(false)
          setSelectedKnowledge(null)
        }}
        onSuccess={() => {
          setDeleteKnowledgeModalOpen(false)
          setSelectedKnowledge(null)
        }}
      />
    </>
  )
} 