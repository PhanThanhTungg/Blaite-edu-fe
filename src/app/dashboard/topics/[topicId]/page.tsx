'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Card, Descriptions, Tag, Button, Spin, Alert, Typography, Row, Col, Skeleton, Tabs, Input, message } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, BookOutlined, FileTextOutlined, RobotOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { getTopic } from '@/services/topic.service';
import { getKnowledges, generateKnowledge, generateTheory, getKnowledgeDetail, deleteKnowledge } from '@/services/knowledge.service';
import { generateTheoryQuestion } from '@/services/question.service';
import { generatePracticeQuestion } from '@/services/question.service';
import { submitQuestionAnswer } from '@/services/question.service';
import { getClass } from '@/services/class.service';
import { setScheduleKnowledge } from '@/services/bot.service';
import EditTopicModal from '@/components/features/topic/EditTopicModal';
import KnowledgeCard from '@/components/features/knowledge/KnowledgeCard';
import DeleteTopicModal from '@/components/features/topic/DeleteTopicModal';
import CreateKnowledgeModal from '@/components/features/knowledge/CreateKnowledgeModal';
import EditKnowledgeModal from '@/components/features/knowledge/EditKnowledgeModal';
import DeleteKnowledgeModal from '@/components/features/knowledge/DeleteKnowledgeModal';
import KnowledgeTree from '@/components/features/knowledge/KnowledgeTree';

const { Title, Text, Paragraph } = Typography

interface TopicData {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  userId: string
  classId: string
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
  const [theoryQuestion, setTheoryQuestion] = useState<any>(null)
  const [practiceQuestion, setPracticeQuestion] = useState<any>(null)
  const [isGeneratingTheoryQuestion, setIsGeneratingTheoryQuestion] = useState(false)
  const [isGeneratingPracticeQuestion, setIsGeneratingPracticeQuestion] = useState(false)
  const [theoryAnswer, setTheoryAnswer] = useState('')
  const [isSubmittingTheoryAnswer, setIsSubmittingTheoryAnswer] = useState(false)
  const [practiceAnswer, setPracticeAnswer] = useState('')
  const [isSubmittingPracticeAnswer, setIsSubmittingPracticeAnswer] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [submittedTheoryResult, setSubmittedTheoryResult] = useState<any>(null)
  const [submittedPracticeResult, setSubmittedPracticeResult] = useState<any>(null)
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<React.Key[]>([])

  // State cho bot knowledge
  const [isSettingBotKnowledge, setIsSettingBotKnowledge] = useState(false)
  const [botKnowledgeId, setBotKnowledgeId] = useState<string | null>(null)

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

  // Get class data for breadcrumb
  const { data: classData } = useQuery({
    queryKey: ['class', topic?.classId],
    queryFn: () => getClass(topic!.classId),
    enabled: !!topic?.classId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Check bot knowledge từ localStorage khi component mount
  useEffect(() => {
    const savedBotKnowledgeId = localStorage.getItem('botKnowledgeId');
    if (savedBotKnowledgeId) {
      setBotKnowledgeId(savedBotKnowledgeId);
    }
  }, []);

  // Check if knowledge is a leaf node (cấp con nhất - không có children)
  const isLeafNode = (knowledge: any) => {
    return knowledge && (!knowledge.children || knowledge.children.length === 0);
  };

  // Handler cho việc set knowledge cho bot telegram
  const handleSetBotKnowledge = async (knowledge: any) => {
    if (!knowledge || !isLeafNode(knowledge)) {
      message.warning('Chỉ có thể set knowledge cấp con nhất cho bot!');
      return;
    }

    setIsSettingBotKnowledge(true);
    try {
      await setScheduleKnowledge(knowledge.id);
      setBotKnowledgeId(knowledge.id);
      localStorage.setItem('botKnowledgeId', knowledge.id);
      message.success(`Đã set kiến thức "${knowledge.name}" cho bot Telegram thành công!`);
    } catch (error) {
      message.error('Có lỗi xảy ra khi set kiến thức cho bot!');
      console.error('Error setting bot knowledge:', error);
    }
    setIsSettingBotKnowledge(false);
  };

  // Generate knowledge mutation
  const generateKnowledgeMutation = useMutation({
    mutationFn: () => generateKnowledge(topicId),
    onSuccess: async (newKnowledges) => {
      console.log('🔍 Knowledge generated, now generating theory for all leaf nodes...');

      // Find all leaf nodes (knowledges without children) and generate theory for them
      const generateTheoryForLeafNodes = async (knowledgeList: any[]) => {
        const leafNodes: any[] = [];

        const findLeafNodes = (knowledges: any[]) => {
          knowledges.forEach(knowledge => {
            if (!knowledge.children || knowledge.children.length === 0) {
              leafNodes.push(knowledge);
            } else {
              findLeafNodes(knowledge.children);
            }
          });
        };

        findLeafNodes(knowledgeList);
        console.log(`🔍 Found ${leafNodes.length} leaf nodes:`, leafNodes.map(k => k.name));

        // Generate theory for each leaf node
        for (const leafKnowledge of leafNodes) {
          try {
            console.log(`🔍 Generating theory for: ${leafKnowledge.name}`);
            await generateTheory(leafKnowledge.id);
            console.log(`✅ Theory generated for: ${leafKnowledge.name}`);
          } catch (error) {
            console.error(`❌ Failed to generate theory for ${leafKnowledge.name}:`, error);
          }
        }

        console.log('🔍 All theory generation completed');
      };

      await generateTheoryForLeafNodes(newKnowledges);

      await queryClient.invalidateQueries({ queryKey: ['topic-knowledges', topicId] });
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Error generating knowledge:', error);
      setIsGenerating(false);
    },
  });

  const handleGenerateKnowledge = () => {
    setIsGenerating(true)
    generateKnowledgeMutation.mutate()
  }

  const handleEditTopic = () => {
    setEditModalOpen(true)
  }

  const handleDeleteTopic = () => {
    setDeleteModalOpen(true)
  }

  const handleCreateKnowledge = () => {
    setCreateKnowledgeModalOpen(true)
  }

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
    // Recursive function to find knowledge in the tree (including children)
    const findKnowledgeInTree = (knowledgeList: any[], targetId: string): any => {
      for (const knowledge of knowledgeList) {
        if (knowledge.id === targetId) {
          return knowledge;
        }
        if (knowledge.children) {
          const found = findKnowledgeInTree(knowledge.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const knowledge = findKnowledgeInTree(knowledges, knowledgeId);
    setSelectedKnowledge(knowledge)
    setDeleteKnowledgeModalOpen(true)
  }

  const handleKnowledgeSelect = (knowledge: any) => {
    console.log('🔍 Knowledge selected:', knowledge);

    // Reset states when switching knowledge
    setTheoryQuestion(null);
    setPracticeQuestion(null);
    setTheoryAnswer('');
    setPracticeAnswer('');
    setSubmittedTheoryResult(null);
    setSubmittedPracticeResult(null);
    setActiveTab('overview');

    setSelectedKnowledgeForTree(knowledge);
    setSelectedTreeKeys([knowledge.id]);
  };

  const handleGenerateTheoryQuestion = async () => {
    if (!selectedKnowledgeForTree?.theory) {
      message.error('No theory content available for this knowledge');
      return;
    }

    setIsGeneratingTheoryQuestion(true);
    try {
      const question = await generateTheoryQuestion(selectedKnowledgeForTree.id);
      setTheoryQuestion(question);
      message.success('Theory exercise generated successfully!');
    } catch (error) {
      message.error('Failed to generate theory exercise');
      console.error('Error generating theory question:', error);
    }
    setIsGeneratingTheoryQuestion(false);
  };

  const handleSubmitTheoryAnswer = async () => {
    if (!theoryAnswer.trim()) {
      message.warning('Please enter your answer');
      return;
    }

    setIsSubmittingTheoryAnswer(true);
    try {
      const result = await submitQuestionAnswer(theoryQuestion.id, theoryAnswer);
      console.log('🔍 Theory API Response:', result); // Debug log
      setSubmittedTheoryResult(result);
      message.success('Answer submitted successfully!');
    } catch (error) {
      message.error('Failed to submit answer');
      console.error('Error submitting answer:', error);
    }
    setIsSubmittingTheoryAnswer(false);
  };

  const handleGeneratePracticeQuestion = async () => {
    setIsGeneratingPracticeQuestion(true);
    try {
      const question = await generatePracticeQuestion(selectedKnowledgeForTree.id);
      setPracticeQuestion(question);
      message.success('Practice exercise generated successfully!');
    } catch (error) {
      message.error('Failed to generate practice exercise');
      console.error('Error generating practice question:', error);
    }
    setIsGeneratingPracticeQuestion(false);
  };

  const handleSubmitPracticeAnswer = async () => {
    if (!practiceAnswer.trim()) {
      message.warning('Please enter your answer');
      return;
    }

    setIsSubmittingPracticeAnswer(true);
    try {
      const result = await submitQuestionAnswer(practiceQuestion.id, practiceAnswer);
      console.log('🔍 Practice API Response:', result); // Debug log
      setSubmittedPracticeResult(result);
      message.success('Answer submitted successfully!');
    } catch (error) {
      message.error('Failed to submit answer');
      console.error('Error submitting answer:', error);
    }
    setIsSubmittingPracticeAnswer(false);
  };

  // Reset functions để gen câu hỏi mới
  const handleResetTheoryQuestion = () => {
    setTheoryQuestion(null);
    setTheoryAnswer('');
    setSubmittedTheoryResult(null);
  };

  const handleResetPracticeQuestion = () => {
    setPracticeQuestion(null);
    setPracticeAnswer('');
    setSubmittedPracticeResult(null);
  };

  if (error) {
    return (
      <Alert
        message="Error"
        description="Failed to load topic data."
        type="error"
      />
    )
  }

  if (isLoading) {
    return <Spin size="large" />
  }

  if (!topic) {
    return (
      <Alert
        message="Not Found"
        description="Topic not found."
        type="warning"
      />
    )
  }

  return (
    <>
      <PageContainer
        title={topic.name}
        breadcrumb={{
          items: [
            { path: '/', breadcrumbName: 'Trang chủ' },
            { path: '/dashboard', breadcrumbName: 'Dashboard' },
            { path: `/dashboard/classes/${topic.classId}`, breadcrumbName: classData?.name || 'Class' },
            { path: `/dashboard/topics`, breadcrumbName: 'Topics' },
            { path: `/dashboard/topics/${topicId}`, breadcrumbName: topic.name },
          ],
        }}
        extra={[
          <Button key="create" icon={<PlusOutlined />} onClick={handleCreateKnowledge}>
            Create Knowledge
          </Button>,
          <Button key="generate" type="primary" loading={isGenerating} onClick={handleGenerateKnowledge}>
            Generate Knowledge
          </Button>,
          <Button key="edit" icon={<EditOutlined />} onClick={handleEditTopic}>
            Edit Topic
          </Button>,
          <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDeleteTopic}>
            Delete Topic
          </Button>,
        ]}
      >
        <Row gutter={[24, 24]}>
          {/* Left Column - Knowledge Tree */}
          <Col xs={24} md={8}>
            <Card title="📚 Knowledge Structure" size="small">
              {knowledges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
                  <Text type="secondary">No knowledge items yet</Text>
                  <div style={{ marginTop: '16px' }}>
                    <Button type="primary" onClick={handleCreateKnowledge}>
                      Create First Knowledge
                    </Button>
                  </div>
                </div>
              ) : (
                <KnowledgeTree
                  knowledges={knowledges}
                  onSelect={handleKnowledgeSelect}
                  selectedKeys={selectedTreeKeys}
                  botKnowledgeId={botKnowledgeId}
                />
              )}
            </Card>
          </Col>

          {/* Right Column - Knowledge Details */}
          <Col xs={24} md={16}>
            {selectedKnowledgeForTree ? (
              <Card size="small">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: 'overview',
                      label: (
                        <span>
                          📋 Overview
                        </span>
                      ),
                      children: (
                        <div>
                          <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Name">
                              <Text strong style={{ fontSize: '16px' }}>
                                {selectedKnowledgeForTree.name}
                              </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Prompt">
                              <Paragraph
                                style={{
                                  marginBottom: 0,
                                  fontSize: '14px',
                                  lineHeight: '1.6',
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                {selectedKnowledgeForTree.prompt}
                              </Paragraph>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                              <Tag color={selectedKnowledgeForTree.status === "active" ? "green" : "red"}>
                                {selectedKnowledgeForTree.status === "active" ? "Active" : "Inactive"}
                              </Tag>
                            </Descriptions.Item>
                            {/* Bot Telegram Status */}
                            <Descriptions.Item label="Bot Telegram">
                              {isLeafNode(selectedKnowledgeForTree) ? (
                                botKnowledgeId === selectedKnowledgeForTree.id ? (
                                  <Tag icon={<CheckCircleOutlined />} color="success">
                                    Đang được sử dụng
                                  </Tag>
                                ) : (
                                  <Tag color="default">Chưa được set</Tag>
                                )
                              ) : (
                                <Tag color="orange">Chỉ knowledge cấp con nhất mới có thể set</Tag>
                              )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Created">
                              {new Date(selectedKnowledgeForTree.createdAt).toLocaleDateString()}
                            </Descriptions.Item>
                          </Descriptions>

                          {/* Actions Section */}
                          <div style={{
                            marginTop: '24px',
                            paddingTop: '16px',
                            borderTop: '1px solid #f0f0f0',
                            display: 'flex',
                            gap: '8px'
                          }}>
                            <Button
                              type="default"
                              icon={<EditOutlined />}
                              onClick={() => handleEditKnowledge(selectedKnowledgeForTree)}
                            >
                              Edit Knowledge
                            </Button>
                            {/* Set Bot Knowledge Button - chỉ hiển thị cho leaf nodes */}
                            {isLeafNode(selectedKnowledgeForTree) && (
                              <Button
                                type={botKnowledgeId === selectedKnowledgeForTree.id ? "default" : "primary"}
                                icon={<RobotOutlined />}
                                loading={isSettingBotKnowledge}
                                onClick={() => handleSetBotKnowledge(selectedKnowledgeForTree)}
                                disabled={botKnowledgeId === selectedKnowledgeForTree.id}
                                style={{
                                  backgroundColor: botKnowledgeId === selectedKnowledgeForTree.id ? '#52c41a' : undefined,
                                  borderColor: botKnowledgeId === selectedKnowledgeForTree.id ? '#52c41a' : undefined,
                                  color: botKnowledgeId === selectedKnowledgeForTree.id ? 'white' : undefined,
                                }}
                              >
                                {botKnowledgeId === selectedKnowledgeForTree.id ? 'Đã set Bot' : 'Set Bot'}
                              </Button>
                            )}
                            <Button
                              type="primary"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteKnowledge(selectedKnowledgeForTree.id)}
                            >
                              Delete Knowledge
                            </Button>
                          </div>

                          {/* Children Knowledge List for Parent Nodes */}
                          {selectedKnowledgeForTree.children && selectedKnowledgeForTree.children.length > 0 && (
                            <div style={{ marginTop: '24px' }}>
                              <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '16px' }}>
                                📚 Sub-Knowledge Items:
                              </Text>
                              {(() => {
                                // Recursive function to get all leaf nodes (children without children)
                                const getAllLeafNodes = (nodes: any[]): any[] => {
                                  let leafNodes: any[] = [];
                                  nodes.forEach(node => {
                                    if (!node.children || node.children.length === 0) {
                                      leafNodes.push(node);
                                    } else {
                                      leafNodes = [...leafNodes, ...getAllLeafNodes(node.children)];
                                    }
                                  });
                                  return leafNodes;
                                };

                                const leafNodes = getAllLeafNodes(selectedKnowledgeForTree.children);

                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {leafNodes.map((child: any, index: number) => (
                                      <div
                                        key={child.id}
                                        onClick={() => handleKnowledgeSelect(child)}
                                        style={{
                                          cursor: 'pointer',
                                          padding: '4px 0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          fontSize: '14px',
                                          transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = '#1890ff';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = 'inherit';
                                        }}
                                      >
                                        <span style={{ fontWeight: 'bold', minWidth: '20px' }}>
                                          {index + 1}.
                                        </span>
                                        <span style={{ marginLeft: '8px' }}>{child.name}</span>
                                        {/* Visual indicator cho bot knowledge */}
                                        {botKnowledgeId === child.id && (
                                          <Tag
                                            icon={<RobotOutlined />}
                                            color="success"
                                            style={{ marginLeft: 'auto', fontSize: '10px' }}
                                          >
                                            Bot
                                          </Tag>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ),
                    },
                    // Only show theory/practice tabs for leaf nodes (no children)
                    ...((!selectedKnowledgeForTree.children || selectedKnowledgeForTree.children.length === 0) ? [
                      {
                        key: 'theory',
                        label: (
                          <span>
                            📖 Theory Content
                          </span>
                        ),
                        children: selectedKnowledgeForTree.theory ? (
                          <div
                            style={{
                              padding: '16px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #e1e4e8',
                              borderRadius: '6px',
                              lineHeight: '1.6',
                              fontSize: '14px'
                            }}
                            dangerouslySetInnerHTML={{ __html: selectedKnowledgeForTree.theory }}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
                            <Text type="secondary">No theory content available for this knowledge</Text>
                          </div>
                        ),
                        disabled: !selectedKnowledgeForTree.theory,
                      },
                      {
                        key: 'theory-exercise',
                        label: (
                          <span>
                            📝 Theory Exercise
                          </span>
                        ),
                        children: (
                          <div>
                            {!theoryQuestion && (
                              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <Button
                                  type="primary"
                                  size="large"
                                  icon={<FileTextOutlined />}
                                  onClick={handleGenerateTheoryQuestion}
                                  loading={isGeneratingTheoryQuestion}
                                >
                                  Generate Theory Exercise
                                </Button>
                              </div>
                            )}

                            {theoryQuestion && (
                              <Card
                                size="small"
                              >
                                <div
                                  style={{
                                    lineHeight: '1.6',
                                    fontSize: '13px',
                                    whiteSpace: 'pre-wrap',
                                    marginBottom: '16px'
                                  }}
                                  dangerouslySetInnerHTML={{ __html: theoryQuestion.content }}
                                />

                                {/* Answer Input Section */}
                                <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                                    Your Answer:
                                  </Text>
                                  <Input.TextArea
                                    value={theoryAnswer}
                                    onChange={(e) => setTheoryAnswer(e.target.value)}
                                    placeholder="Enter your answer here..."
                                    rows={4}
                                    style={{ marginBottom: '12px' }}
                                    disabled={submittedTheoryResult !== null}
                                  />
                                  <Button
                                    type="primary"
                                    onClick={handleSubmitTheoryAnswer}
                                    loading={isSubmittingTheoryAnswer}
                                    disabled={!theoryAnswer.trim() || submittedTheoryResult !== null}
                                  >
                                    {submittedTheoryResult ? 'Answer Submitted' : 'Submit Answer'}
                                  </Button>
                                </div>

                                {/* Results Section */}
                                {submittedTheoryResult && (
                                  <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                      <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                        📊 Your Score: {submittedTheoryResult.score}/100
                                      </Text>
                                    </div>

                                    {submittedTheoryResult.explain && (
                                      <div style={{ marginBottom: '12px' }}>
                                        <Text strong style={{ display: 'block', marginBottom: '8px', color: '#fa8c16' }}>
                                          📝 Explanation:
                                        </Text>
                                        <div style={{
                                          padding: '12px',
                                          backgroundColor: '#fff7e6',
                                          border: '1px solid #ffd591',
                                          borderRadius: '6px',
                                          lineHeight: '1.6'
                                        }}>
                                          {submittedTheoryResult.explain}
                                        </div>
                                      </div>
                                    )}

                                    {submittedTheoryResult.aiFeedback && (
                                      <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ display: 'block', marginBottom: '8px', color: '#52c41a' }}>
                                          💡 AI Feedback:
                                        </Text>
                                        <div style={{
                                          padding: '12px',
                                          backgroundColor: '#f6ffed',
                                          border: '1px solid #b7eb8f',
                                          borderRadius: '6px',
                                          lineHeight: '1.6'
                                        }}>
                                          {submittedTheoryResult.aiFeedback}
                                        </div>
                                      </div>
                                    )}

                                    {/* Generate New Question Button */}
                                    <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                                      <Button
                                        type="primary"
                                        icon={<FileTextOutlined />}
                                        onClick={handleResetTheoryQuestion}
                                        size="large"
                                      >
                                        Generate New Theory Question
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Card>
                            )}
                          </div>
                        ),
                        disabled: !selectedKnowledgeForTree.theory,
                      },
                      {
                        key: 'practice-exercise',
                        label: (
                          <span>
                            🎯 Practice Exercise
                          </span>
                        ),
                        children: (
                          <div>
                            {!practiceQuestion && (
                              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <Button
                                  type="primary"
                                  size="large"
                                  icon={<FileTextOutlined />}
                                  onClick={handleGeneratePracticeQuestion}
                                  loading={isGeneratingPracticeQuestion}
                                >
                                  Generate Practice Exercise
                                </Button>
                              </div>
                            )}

                            {practiceQuestion && (
                              <Card
                                size="small"
                              >
                                <div
                                  style={{
                                    lineHeight: '1.6',
                                    fontSize: '13px',
                                    whiteSpace: 'pre-wrap',
                                    marginBottom: '16px'
                                  }}
                                  dangerouslySetInnerHTML={{ __html: practiceQuestion.content }}
                                />

                                {/* Answer Input Section */}
                                <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                                    Your Answer:
                                  </Text>
                                  <Input.TextArea
                                    value={practiceAnswer}
                                    onChange={(e) => setPracticeAnswer(e.target.value)}
                                    placeholder="Enter your answer here..."
                                    rows={4}
                                    style={{ marginBottom: '12px' }}
                                    disabled={submittedPracticeResult !== null}
                                  />
                                  <Button
                                    type="primary"
                                    onClick={handleSubmitPracticeAnswer}
                                    loading={isSubmittingPracticeAnswer}
                                    disabled={!practiceAnswer.trim() || submittedPracticeResult !== null}
                                  >
                                    {submittedPracticeResult ? 'Answer Submitted' : 'Submit Answer'}
                                  </Button>
                                </div>

                                {/* Results Section */}
                                {submittedPracticeResult && (
                                  <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                      <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                        📊 Your Score: {submittedPracticeResult.score}/100
                                      </Text>
                                    </div>

                                    {submittedPracticeResult.explain && (
                                      <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ display: 'block', marginBottom: '8px', color: '#fa8c16' }}>
                                          📝 Explanation:
                                        </Text>
                                        <div style={{
                                          padding: '12px',
                                          backgroundColor: '#fff7e6',
                                          border: '1px solid #ffd591',
                                          borderRadius: '6px',
                                          lineHeight: '1.6'
                                        }}>
                                          {submittedPracticeResult.explain}
                                        </div>
                                      </div>
                                    )}

                                    {/* Generate New Question Button */}
                                    <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                                      <Button
                                        type="primary"
                                        icon={<FileTextOutlined />}
                                        onClick={handleResetPracticeQuestion}
                                        size="large"
                                      >
                                        Generate New Practice Question
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Card>
                            )}
                          </div>
                        ),
                      }
                    ] : [])
                  ]}
                />
              </Card>
            ) : (
              <Card size="small">
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
                  <Text type="secondary">Select a knowledge item from the tree to view details</Text>
                </div>
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
        onSuccess={async () => {
          setEditKnowledgeModalOpen(false)
          setSelectedKnowledge(null)

          // Refetch queries để đảm bảo data consistency
          await queryClient.refetchQueries({ queryKey: ['topic-knowledges', topicId] })
        }}
        // Truyền callback để update selectedKnowledgeForTree ngay lập tức
        onKnowledgeUpdate={(updatedKnowledge) => {
          if (selectedKnowledgeForTree && selectedKnowledgeForTree.id === updatedKnowledge.id) {
            setSelectedKnowledgeForTree((prev: any) => ({ ...prev, prompt: updatedKnowledge.prompt }))
          }
        }}
      />

             {/* Delete Knowledge Modal */}
       <DeleteKnowledgeModal
         open={deleteKnowledgeModalOpen}
         knowledgeId={selectedKnowledge?.id || null}
         knowledgeContent={selectedKnowledge?.prompt || selectedKnowledge?.name || ''}
         topicId={topicId}
         onCancel={() => {
           setDeleteKnowledgeModalOpen(false)
           setSelectedKnowledge(null)
         }}
         onSuccess={() => {
           setDeleteKnowledgeModalOpen(false)
           setSelectedKnowledge(null)
           // Reset selected knowledge if it was the one being deleted
           if (selectedKnowledgeForTree && selectedKnowledgeForTree.id === selectedKnowledge?.id) {
             setSelectedKnowledgeForTree(null)
             setSelectedTreeKeys([])
           }
           // Refetch knowledges data
           queryClient.refetchQueries({ queryKey: ['topic-knowledges', topicId] })
         }}
       />
    </>
  )
} 