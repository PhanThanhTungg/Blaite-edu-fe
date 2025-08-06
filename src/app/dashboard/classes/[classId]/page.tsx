"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { getClass, getTopics, getUser } from "@/hooks/api";
import { PageContainer } from "@ant-design/pro-components";
import { Spin, Alert, Button, Card, Typography, Row, Col, Space, Breadcrumb } from "antd";
import { PlusOutlined, HomeOutlined } from "@ant-design/icons";
import TopicCard from "@/components/TopicCard";
import CreateTopicModal from "@/components/CreateTopicModal";
import EditTopicModal from "@/components/EditTopicModal";
import DeleteTopicModal from "@/components/DeleteTopicModal";
import ClientOnly from '@/components/ClientOnly';

const { Text, Title } = Typography;

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  // Fetch class data
  const {
    data: classData,
    isLoading: classLoading,
    error: classError,
  } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => getClass(classId),
    enabled: !!classId,
  });

  // Fetch topics for this class
  const {
    data: topics = [],
    isLoading: topicsLoading,
    error: topicsError,
  } = useQuery({
    queryKey: ["topics", classId],
    queryFn: () => getTopics(classId),
    enabled: !!classId,
  });

  // Fetch user data
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });

  // Check for any errors
  const hasError = classError || topicsError || userError;
  const isLoading = classLoading || topicsLoading || userLoading;

  // Handle error state
  if (hasError) {
    return (
      <ClientOnly>
        <PageContainer title="Class Details">
          <Alert
            message="Error"
            description="Failed to load class data. Please try again."
            type="error"
            showIcon
          />
        </PageContainer>
      </ClientOnly>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <ClientOnly>
        <PageContainer title="Class Details">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <Spin size="large" />
          </div>
        </PageContainer>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <PageContainer 
        title={classData?.name || "Class Details"}
        breadcrumb={{
          items: [
            {
              title: <HomeOutlined />,
              href: '/dashboard',
            },
            {
              title: 'Classes',
              href: '/dashboard',
            },
            {
              title: classData?.name || 'Class',
            },
          ],
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Class Info */}
          {classData && (
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                  {classData.name}
                </Title>
                {classData.description && (
                  <Text type="secondary">{classData.description}</Text>
                )}
              </div>
              
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1677ff' }}>
                      {topics.length}
                    </div>
                    <Text type="secondary">Topics</Text>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {topics.reduce((sum: number, topic: any) => sum + (topic.knowledges?.length || 0), 0)}
                    </div>
                    <Text type="secondary">Knowledges</Text>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                      {topics.reduce((sum: number, topic: any) => 
                        sum + topic.knowledges?.reduce((kSum: number, k: any) => kSum + (k.questions?.length || 0), 0) || 0, 0
                      )}
                    </div>
                    <Text type="secondary">Questions</Text>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                      {(() => {
                        const allQuestions = topics.flatMap((topic: any) => 
                          topic.knowledges?.flatMap((k: any) => k.questions || []) || []
                        );
                        const scoredQuestions = allQuestions.filter((q: any) => q.score !== null && q.score !== undefined);
                        return scoredQuestions.length > 0 
                          ? Math.round(scoredQuestions.reduce((sum: number, q: any) => sum + q.score, 0) / scoredQuestions.length)
                          : 0;
                      })()}%
                    </div>
                    <Text type="secondary">Avg Score</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          {/* Topics Section */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                Topics
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
              >
                Create Topic
              </Button>
            </div>

            {topics.length > 0 ? (
              <Row gutter={[16, 16]}>
                {topics.map((topic: any) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={topic.id}>
                    <TopicCard
                      topic={{
                        id: topic.id,
                        title: topic.name,
                        description: topic.description || "",
                        category: "",
                        difficulty: "",
                        status: "",
                        questionsGenerated: topic.knowledges?.reduce(
                          (sum: number, k: any) => sum + (k._count?.questions || 0),
                          0
                        ) || 0,
                        totalQuestions: topic.knowledges?.reduce(
                          (sum: number, k: any) => sum + (k.questions?.length || 0),
                          0
                        ) || 0,
                        avgScore: (() => {
                          let totalScore = 0,
                            totalAnswers = 0;
                          topic.knowledges?.forEach((k: any) =>
                            k.questions?.forEach((q: any) => {
                              if (q.score !== null && q.score !== undefined) {
                                totalScore += q.score;
                                totalAnswers++;
                              }
                            })
                          );
                          return totalAnswers > 0
                            ? Math.round(totalScore / totalAnswers)
                            : 0;
                        })(),
                        studyTime: 0,
                        nextReview: "",
                      }}
                      onView={(topic) =>
                        router.push(`/dashboard/classes/${classId}/topics/${topic.id}`)
                      }
                      onEdit={(topic) => {
                        setSelectedTopic({
                          id: topic.id,
                          name: topic.title,
                          description: topic.description,
                        });
                        setEditModalOpen(true);
                      }}
                      onDelete={(topicId) => {
                        setSelectedTopic({
                          id: topicId,
                          name: topic.name,
                        });
                        setDeleteModalOpen(true);
                      }}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Card style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "16px",
                    display: "block",
                    marginBottom: "16px",
                  }}
                >
                  No topics yet
                </Text>
                <Text type="secondary">
                  Create your first topic to start adding knowledges and questions
                </Text>
              </Card>
            )}
          </div>
        </Space>
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
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedTopic(null);
        }}
        onSuccess={() => {
          setEditModalOpen(false);
          setSelectedTopic(null);
        }}
      />

      {/* Delete Topic Modal */}
      <DeleteTopicModal
        open={deleteModalOpen}
        topicId={selectedTopic?.id || null}
        topicName={selectedTopic?.name || ""}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedTopic(null);
        }}
        onSuccess={() => {
          setDeleteModalOpen(false);
          setSelectedTopic(null);
        }}
      />
    </ClientOnly>
  );
} 