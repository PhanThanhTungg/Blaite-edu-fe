'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Card, Descriptions, Tag, Button, Spin, Alert, Typography, Row, Col, Skeleton } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, BookOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { getTopic, getKnowledges, generateKnowledge } from '@/hooks/api';
import EditTopicModal from '@/components/EditTopicModal';
import KnowledgeCard from '@/components/KnowledgeCard';
import DeleteTopicModal from '@/components/DeleteTopicModal';
import CreateKnowledgeModal from '@/components/CreateKnowledgeModal';
import EditKnowledgeModal from '@/components/EditKnowledgeModal';
import DeleteKnowledgeModal from '@/components/DeleteKnowledgeModal';
import KnowledgeTree from '@/components/KnowledgeTree';

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
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedKnowledgeForTree, setSelectedKnowledgeForTree] = useState<any>(null)

  const { data: topic, isLoading, error } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: () => getTopic(topicId),
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const { data: knowledges = [] } = useQuery({
    queryKey: ['topic-knowledges', topicId],
    queryFn: () => getKnowledges(topicId),
    enabled: !!topicId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  // Generate knowledge mutation
  const generateKnowledgeMutation = useMutation({
    mutationFn: () => generateKnowledge(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-knowledges', topicId] });
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Error generating knowledge:', error);
      setIsGenerating(false);
    },
  });

  const handleGenerateKnowledge = () => {
    setIsGenerating(true);
    generateKnowledgeMutation.mutate();
  };

  const handleKnowledgeSelect = (knowledge: any) => {
    setSelectedKnowledgeForTree(knowledge);
  };

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

  const handleDeleteKnowledge = (knowledgeId: string | number) => {
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
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
          <Col xs={24}>
            <Card title="Knowledges">
              <Row gutter={[16, 16]}>
                {[1, 2, 3, 4].map((i) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={i}>
                    <Card>
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
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

                    {/* Knowledge Tree Section */}
          <Col xs={24} md={12}>
            <KnowledgeTree 
              knowledges={knowledges}
              onSelect={handleKnowledgeSelect}
            />
          </Col>

          {/* Selected Knowledge Details */}
          <Col xs={24} md={12}>
            {selectedKnowledgeForTree ? (
              <Card title="Selected Knowledge Details">
                <Descriptions column={1}>
                  <Descriptions.Item label="Name">
                    <Text strong>{selectedKnowledgeForTree.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Prompt">
                    <Text>{selectedKnowledgeForTree.prompt}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={selectedKnowledgeForTree.status === "active" ? "green" : "red"}>
                      {selectedKnowledgeForTree.status === "active" ? "Active" : "Inactive"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {new Date(selectedKnowledgeForTree.createdAt).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ) : (
              <Card title="Knowledge Details">
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                  <Text type="secondary">Select a knowledge from the tree to view details</Text>
                </div>
              </Card>
            )}
          </Col>

          {/* Knowledges Grid Section */}
          <Col xs={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text strong style={{ fontSize: 18 }}>All Knowledges</Text>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleGenerateKnowledge}
                loading={isGenerating}
              >
                Generate Knowledge
              </Button>
            </div>
            
            {knowledges.length > 0 ? (
              <Row gutter={[16, 16]}>
                {knowledges.map((knowledge: any) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={knowledge.id}>
                    <KnowledgeCard 
                      knowledge={{
                        id: knowledge.id,
                         name: knowledge.name,
                         prompt: knowledge.prompt,
                        content: knowledge.content,
                        createdAt: knowledge.createdAt,
                        updatedAt: knowledge.updatedAt,
                        topicId: knowledge.topicId,
                         status: knowledge.status,
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