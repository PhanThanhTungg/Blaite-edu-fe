'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import PageContainer from '@/components/layout/PageContainer'
import { Card, Descriptions, Tag, Button, Spin, Alert, Typography, Row, Col, Skeleton, Tabs, Input, theme, Pagination, Select, Space, App } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, BookOutlined, FileTextOutlined, RobotOutlined, CheckCircleOutlined, HomeOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { getTopic } from '@/services/topic.service';
import { getKnowledges, generateKnowledge, getKnowledgeDetail, deleteKnowledge, generateTheory } from '@/services/knowledge.service';
import { generateTheoryQuestion, generatePracticeQuestion, submitQuestionAnswer, getQuestionsOfKnowledge, getLatestUnansweredQuestion } from '@/services/question.service';
import { getClass } from '@/services/class.service';
import { setScheduleKnowledge } from '@/services/bot.service';
import EditTopicModal from '@/components/features/topic/EditTopicModal';
import KnowledgeCard from '@/components/features/knowledge/KnowledgeCard';
import DeleteTopicModal from '@/components/features/topic/DeleteTopicModal';
import CreateKnowledgeModal from '@/components/features/knowledge/CreateKnowledgeModal';
import EditKnowledgeModal from '@/components/features/knowledge/EditKnowledgeModal';
import DeleteKnowledgeModal from '@/components/features/knowledge/DeleteKnowledgeModal';
import KnowledgeTree from '@/components/features/knowledge/KnowledgeTree';
import ErrorModal from '@/components/ui/ErrorModal';

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
  const { token } = theme.useToken()
  const { message } = App.useApp()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [createKnowledgeModalOpen, setCreateKnowledgeModalOpen] = useState(false)
  const [editKnowledgeModalOpen, setEditKnowledgeModalOpen] = useState(false)
  const [deleteKnowledgeModalOpen, setDeleteKnowledgeModalOpen] = useState(false)
  const [selectedKnowledge, setSelectedKnowledge] = useState<any>(null)
  const [createChildParent, setCreateChildParent] = useState<any>(null)
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
  const [isCreatingKnowledge, setIsCreatingKnowledge] = useState(false)
  const [theoryQuestionsHistory, setTheoryQuestionsHistory] = useState<any[]>([])
  const [practiceQuestionsHistory, setPracticeQuestionsHistory] = useState<any[]>([])
  const [expandedTheoryQuestions, setExpandedTheoryQuestions] = useState<Set<string>>(new Set())
  const [expandedPracticeQuestions, setExpandedPracticeQuestions] = useState<Set<string>>(new Set())
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [theoryPageSize, setTheoryPageSize] = useState(4)
  const [theoryCurrentPage, setTheoryCurrentPage] = useState(1)
  const [practicePageSize, setPracticePageSize] = useState(4)
  const [practiceCurrentPage, setPracticeCurrentPage] = useState(1)
  const [theorySortBy, setTheorySortBy] = useState<'createdAt' | 'score'>('createdAt')
  const [theorySortOrder, setTheorySortOrder] = useState<'asc' | 'desc'>('desc')
  const [practiceSortBy, setPracticeSortBy] = useState<'createdAt' | 'score'>('createdAt')
  const [practiceSortOrder, setPracticeSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isTheoryQuestionUnanswered, setIsTheoryQuestionUnanswered] = useState(false)
  const [isPracticeQuestionUnanswered, setIsPracticeQuestionUnanswered] = useState(false)

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

  // Check bot knowledge from localStorage when component mounts
  useEffect(() => {
    const savedBotKnowledgeId = localStorage.getItem('botKnowledgeId');
    if (savedBotKnowledgeId) {
      setBotKnowledgeId(savedBotKnowledgeId);
    }
  }, []);

  // Check if knowledge is a leaf node (lowest level - no children)
  const isLeafNode = (knowledge: any) => {
    return knowledge && (!knowledge.children || knowledge.children.length === 0);
  };

  // Handler for setting knowledge for telegram bot
  const handleSetBotKnowledge = async (knowledge: any) => {
    if (!knowledge || !isLeafNode(knowledge)) {
      message.warning('Only leaf knowledge can be set for bot!');
      return;
    }

    setIsSettingBotKnowledge(true);
    try {
      await setScheduleKnowledge(knowledge.id);
      setBotKnowledgeId(knowledge.id);
      localStorage.setItem('botKnowledgeId', knowledge.id);
      message.success(`Successfully set knowledge "${knowledge.name}" for Telegram bot!`);
    } catch (error) {
      message.error('An error occurred while setting knowledge for bot!');
      console.error('Error setting bot knowledge:', error);
    }
    setIsSettingBotKnowledge(false);
  };

  // Generate knowledge mutation
  const generateKnowledgeMutation = useMutation({
    mutationFn: () => generateKnowledge(topicId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['topic-knowledges', topicId] });
      setIsGenerating(false);
      message.success('Knowledge generated successfully!');
    },
    onError: (error: any) => {
      message.error('Modal gemini is overloading');
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
    setCreateChildParent(null)
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
    console.log('🔍 Editing knowledge:', knowledge)
    setSelectedKnowledge(knowledge)
    setEditKnowledgeModalOpen(true)
  }
  // Generate theory for selected knowledge (on-demand)
  const generateTheoryMutation = useMutation({
    mutationFn: (knowledgeId: string) => generateTheory(knowledgeId),
    onSuccess: async (updated) => {
      // Refresh list/tree
      await queryClient.invalidateQueries({ queryKey: ['topic-knowledges', topicId] })
      // If API returns updated knowledge with theory, update local selected state
      if (updated && updated.theory && selectedKnowledgeForTree && updated.id === selectedKnowledgeForTree.id) {
        setSelectedKnowledgeForTree((prev: any) => ({ ...prev, theory: updated.theory }))
      }
      message.success('Theory generated successfully!');
    },
    onError: (error: any) => {
      message.error('Modal gemini is overloading');
      console.error('Error generating theory:', error);
    },
  })

  const handleGenerateTheoryForSelected = async () => {
    if (!selectedKnowledgeForTree) return
    generateTheoryMutation.mutate(selectedKnowledgeForTree.id)
  }

  // Load questions history
  const loadQuestionsHistory = async (knowledgeId: string, type: 'theory' | 'practice') => {
    setIsLoadingHistory(true)
    try {
      const questions = await getQuestionsOfKnowledge(knowledgeId, type)
      const answeredAndGraded = (questions || []).filter((q: any) => q && q.score !== undefined && q.score !== null)
      if (type === 'theory') {
        setTheoryQuestionsHistory(answeredAndGraded)
      } else {
        setPracticeQuestionsHistory(answeredAndGraded)
      }
    } catch (error) {
      console.error('Error loading questions history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Toggle expand/collapse for theory questions
  const toggleTheoryQuestionExpansion = (questionId: string) => {
    setExpandedTheoryQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  // Toggle expand/collapse for practice questions
  const togglePracticeQuestionExpansion = (questionId: string) => {
    setExpandedPracticeQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  // Helper function to show error modal
  const showErrorModal = (error: any, defaultMessage: string) => {
    setErrorMessage('Modal gemini is overloading')
    setErrorModalOpen(true)
  }

  // Sort and pagination logic for theory questions
  const getTheoryPaginatedQuestions = () => {
    // Sort questions first
    const sortedQuestions = [...theoryQuestionsHistory].sort((a, b) => {
      if (theorySortBy === 'createdAt') {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return theorySortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else if (theorySortBy === 'score') {
        const scoreA = a.score !== undefined ? a.score : -1
        const scoreB = b.score !== undefined ? b.score : -1
        return theorySortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA
      }
      return 0
    })
    
    // Then paginate
    const startIndex = (theoryCurrentPage - 1) * theoryPageSize
    const endIndex = startIndex + theoryPageSize
    return sortedQuestions.slice(startIndex, endIndex)
  }

  // Sort and pagination logic for practice questions
  const getPracticePaginatedQuestions = () => {
    // Sort questions first
    const sortedQuestions = [...practiceQuestionsHistory].sort((a, b) => {
      if (practiceSortBy === 'createdAt') {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return practiceSortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else if (practiceSortBy === 'score') {
        const scoreA = a.score !== undefined ? a.score : -1
        const scoreB = b.score !== undefined ? b.score : -1
        return practiceSortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA
      }
      return 0
    })
    
    // Then paginate
    const startIndex = (practiceCurrentPage - 1) * practicePageSize
    const endIndex = startIndex + practicePageSize
    return sortedQuestions.slice(startIndex, endIndex)
  }

  // Reset pagination when questions history changes
  const resetTheoryPagination = () => {
    setTheoryCurrentPage(1)
  }

  const resetPracticePagination = () => {
    setPracticeCurrentPage(1)
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
    setTheoryQuestionsHistory([]);
    setPracticeQuestionsHistory([]);
    setIsTheoryQuestionUnanswered(false);
    setIsPracticeQuestionUnanswered(false);

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
      setIsTheoryQuestionUnanswered(false); // Reset unanswered flag for new question
      message.success('Theory exercise generated successfully!');
    } catch (error: any) {
      showErrorModal(error, 'Failed to generate theory exercise');
      console.error('Error generating theory question:', error);
    }
    setIsGeneratingTheoryQuestion(false);
  };

  // Load unanswered question for theory tab
  const loadUnansweredTheoryQuestion = async () => {
    if (!topicId) return;
    
    try {
      const question = await getLatestUnansweredQuestion(topicId);
      if (question && question.id) {
        setTheoryQuestion(question);
        setIsTheoryQuestionUnanswered(true);
        console.log('🔍 Loaded unanswered question for theory tab:', question);
      }
    } catch (error: any) {
      // If no unanswered question found, don't show error
      if (error.response?.status !== 404) {
        console.error('Error loading unanswered question for theory tab:', error);
      }
    }
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
      
      // Automatically add answered question to history
      const answeredQuestion = {
        ...theoryQuestion,
        answer: theoryAnswer,
        score: result.score,
        explain: result.explain,
        aiFeedback: result.aiFeedback
      };
      setTheoryQuestionsHistory(prev => [answeredQuestion, ...prev]);
      resetTheoryPagination(); // Reset to page 1 when there are new questions
      
      message.success('Answer submitted successfully!');
    } catch (error: any) {
      showErrorModal(error, 'Failed to submit answer');
      console.error('Error submitting answer:', error);
    }
    setIsSubmittingTheoryAnswer(false);
  };

  const handleGeneratePracticeQuestion = async () => {
    setIsGeneratingPracticeQuestion(true);
    try {
      const question = await generatePracticeQuestion(selectedKnowledgeForTree.id);
      setPracticeQuestion(question);
      setIsPracticeQuestionUnanswered(false); // Reset unanswered flag for new question
      message.success('Practice exercise generated successfully!');
    } catch (error: any) {
      showErrorModal(error, 'Failed to generate practice exercise');
      console.error('Error generating practice question:', error);
    }
    setIsGeneratingPracticeQuestion(false);
  };

  // Load unanswered question for practice tab
  const loadUnansweredPracticeQuestion = async () => {
    if (!topicId) return;
    
    try {
      const question = await getLatestUnansweredQuestion(topicId);
      if (question && question.id) {
        setPracticeQuestion(question);
        setIsPracticeQuestionUnanswered(true);
        console.log('🔍 Loaded unanswered question for practice tab:', question);
      }
    } catch (error: any) {
      // If no unanswered question found, don't show error
      if (error.response?.status !== 404) {
        console.error('Error loading unanswered question for practice tab:', error);
      }
    }
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
      
      // Automatically add answered question to history
      const answeredQuestion = {
        ...practiceQuestion,
        answer: practiceAnswer,
        score: result.score,
        explain: result.explain,
        aiFeedback: result.aiFeedback
      };
      setPracticeQuestionsHistory(prev => [answeredQuestion, ...prev]);
      resetPracticePagination(); // Reset to page 1 when there are new questions
      
      message.success('Answer submitted successfully!');
    } catch (error: any) {
      showErrorModal(error, 'Failed to submit answer');
      console.error('Error submitting answer:', error);
    }
    setIsSubmittingPracticeAnswer(false);
  };

  // Reset functions to generate new questions
  const handleResetTheoryQuestion = () => {
    setTheoryQuestion(null);
    setTheoryAnswer('');
    setSubmittedTheoryResult(null);
    setIsTheoryQuestionUnanswered(false);
  };

  const handleResetPracticeQuestion = () => {
    setPracticeQuestion(null);
    setPracticeAnswer('');
    setSubmittedPracticeResult(null);
    setIsPracticeQuestionUnanswered(false);
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
            { title: <HomeOutlined />, href: '/' },
            { title: classData?.name || 'Class', href: `/dashboard/classes/${topic.classId}` },
            { title: topic.name },
          ],
        }}
        header={{
          extra: [
            <Button key="create" icon={<PlusOutlined />} onClick={handleCreateKnowledge} loading={isCreatingKnowledge} disabled={isCreatingKnowledge}>
              {isCreatingKnowledge ? 'Creating...' : 'Create Knowledge'}
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
          ],
        }}
      >
        <Row gutter={[24, 24]} className="mt-3">
          {/* Left Column - Knowledge Tree */}
          <Col xs={24} md={8}>
            <Card title="📚 Knowledge Structure" size="small">
              {knowledges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
                  <Text type="secondary">No knowledge items yet</Text>
                  <div style={{ marginTop: '16px' }}>
                    <Button type="primary" onClick={handleCreateKnowledge} loading={isCreatingKnowledge} disabled={isCreatingKnowledge}>
                      {isCreatingKnowledge ? 'Creating...' : 'Create First Knowledge'}
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
                  onChange={(key) => {
                    setActiveTab(key)
                    // Auto load questions history when switching to exercise tabs
                    if (selectedKnowledgeForTree && (key === 'theory-exercise' || key === 'practice-exercise')) {
                      const type = key === 'theory-exercise' ? 'theory' : 'practice'
                      loadQuestionsHistory(selectedKnowledgeForTree.id, type)
                    }
                    
                    // Auto load unanswered question from topic if no current question
                    if (key === 'theory-exercise' && !theoryQuestion) {
                      loadUnansweredTheoryQuestion()
                    } else if (key === 'practice-exercise' && !practiceQuestion) {
                      loadUnansweredPracticeQuestion()
                    }
                  }}
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
                                    Currently in use
                                  </Tag>
                                ) : (
                                  <Tag color="default">Not set</Tag>
                                )
                              ) : (
                                <Tag color="orange">Only leaf knowledge can be set</Tag>
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
                            borderTop: `1px solid ${token.colorBorder}`,
                            display: 'flex',
                            gap: '8px'
                          }}>
                            <Button
                              type="default"
                              icon={<PlusOutlined />}
                              onClick={() => {
                                setCreateChildParent(selectedKnowledgeForTree)
                                setCreateKnowledgeModalOpen(true)
                              }}
                              loading={isCreatingKnowledge}
                              disabled={isCreatingKnowledge}
                            >
                              Create Child
                            </Button>
                            <Button
                              type="default"
                              icon={<EditOutlined />}
                              onClick={() => handleEditKnowledge(selectedKnowledgeForTree)}
                            >
                              Edit Knowledge
                            </Button>
                            {/* Set Bot Knowledge Button - only show for leaf nodes */}
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
                                {botKnowledgeId === selectedKnowledgeForTree.id ? 'Bot Set' : 'Set Bot'}
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
                        <div>
                          <div style={{ marginBottom: '12px', textAlign: 'right' }}>
                            <Button
                              type="default"
                              size="small"
                              icon={<FileTextOutlined />}
                              loading={generateTheoryMutation.isPending}
                              onClick={handleGenerateTheoryForSelected}
                            >
                              {generateTheoryMutation.isPending ? 'Regenerating...' : 'Regenerate Theory'}
                            </Button>
                          </div>
                          <div
                            style={{
                              padding: '16px',
                              border: `1px solid ${token.colorBorder}`,
                              borderRadius: '6px',
                              lineHeight: '1.6',
                              fontSize: '14px'
                            }}
                            className="theory-content"
                            dangerouslySetInnerHTML={{ __html: selectedKnowledgeForTree.theory }}
                          />
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📖</div>
                          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>No theory content yet</Text>
                          <Button type="primary" loading={generateTheoryMutation.isPending} onClick={handleGenerateTheoryForSelected} icon={<FileTextOutlined />}>
                            {generateTheoryMutation.isPending ? 'Generating...' : 'Generate Theory'}
                          </Button>
                        </div>
                      ),
                      disabled: false,
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
                            {/* Questions History Section */}
                            <div style={{ marginBottom: '24px' }}>
                              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong>📚 Questions History</Text>
                                <Space>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>Sort by:</Text>
                                  <Select
                                    value={theorySortBy}
                                    onChange={(value) => setTheorySortBy(value)}
                                    style={{ width: 120 }}
                                    size="small"
                                    options={[
                                      { label: 'Time', value: 'createdAt' },
                                      { label: 'Score', value: 'score' }
                                    ]}
                                  />
                                  <Select
                                    value={theorySortOrder}
                                    onChange={(value) => setTheorySortOrder(value)}
                                    style={{ width: 80 }}
                                    size="small"
                                    options={[
                                      { label: '↑', value: 'asc' },
                                      { label: '↓', value: 'desc' }
                                    ]}
                                  />
                                </Space>
                              </div>
                              {theoryQuestionsHistory.length > 0 ? (
                                <>
                                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: `1px solid ${token.colorBorder}`, borderRadius: '6px', padding: '12px' }}>
                                    {getTheoryPaginatedQuestions().map((q, index) => {
                                      const globalIndex = (theoryCurrentPage - 1) * theoryPageSize + index
                                      const isExpanded = expandedTheoryQuestions.has(q.id || globalIndex.toString())
                                      return (
                                        <div key={q.id || globalIndex} style={{ marginBottom: '8px', padding: '8px', backgroundColor: token.colorFillAlter, borderRadius: '4px' }}>
                                          {/* Compact view */}
                                          <div 
                                            style={{ 
                                              display: 'flex', 
                                              justifyContent: 'space-between', 
                                              alignItems: 'center',
                                              cursor: 'pointer',
                                              padding: '4px 0'
                                            }}
                                            onDoubleClick={() => toggleTheoryQuestionExpansion(q.id || globalIndex.toString())}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                              <Text strong style={{ fontSize: '12px', minWidth: '60px' }}>
                                                Question {globalIndex + 1}
                                              </Text>
                                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                                {q.createdAt ? new Date(q.createdAt).toLocaleString() : 'N/A'}
                                              </Text>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              {q.score !== undefined && (
                                                <Text style={{ 
                                                  fontSize: '12px', 
                                                  fontWeight: 'bold',
                                                  color: q.score >= 80 ? '#52c41a' : q.score >= 60 ? '#faad14' : '#ff4d4f' 
                                                }}>
                                                  {q.score}/100
                                                </Text>
                                              )}
                                              <Text type="secondary" style={{ fontSize: '10px' }}>
                                                {isExpanded ? '▼' : '▶'} Double-click to {isExpanded ? 'hide' : 'show'} details
                                              </Text>
                                            </div>
                                          </div>
                                          
                                          {/* Expanded view */}
                                          {isExpanded && (
                                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${token.colorBorder}` }}>
                                              <div style={{ fontSize: '12px', marginBottom: '8px' }} dangerouslySetInnerHTML={{ __html: q.content }} />
                                              {q.answer && (
                                                <div style={{ marginBottom: '4px' }}>
                                                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>Your Answer:</Text>
                                                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#666' }}>{q.answer}</div>
                                                </div>
                                              )}
                                              {q.explain && (
                                                <div style={{ marginBottom: '4px' }}>
                                                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>Explanation:</Text>
                                                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#666' }}>{q.explain}</div>
                                                </div>
                                              )}
                                              {q.aiFeedback && (
                                                <div>
                                                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>AI Feedback:</Text>
                                                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#666' }}>{q.aiFeedback}</div>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                  
                                  {/* Pagination */}
                                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                                    <Pagination
                                      current={theoryCurrentPage}
                                      total={theoryQuestionsHistory.length}
                                      pageSize={theoryPageSize}
                                      showSizeChanger
                                      showQuickJumper
                                      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} questions`}
                                      pageSizeOptions={['2', '4', '6', '8', '10']}
                                      onChange={(page, size) => {
                                        setTheoryCurrentPage(page)
                                        if (size !== theoryPageSize) {
                                          setTheoryPageSize(size)
                                        }
                                      }}
                                      onShowSizeChange={(current, size) => {
                                        setTheoryPageSize(size)
                                        setTheoryCurrentPage(1)
                                      }}
                                      locale={{
                                        items_per_page: 'items/page',
                                        jump_to: 'Go to',
                                        jump_to_confirm: 'Go to page',
                                        page: 'Page',
                                        prev_page: 'Previous Page',
                                        next_page: 'Next Page',
                                        prev_5: 'Previous 5 Pages',
                                        next_5: 'Next 5 Pages',
                                        prev_3: 'Previous 3 Pages',
                                        next_3: 'Next 3 Pages',
                                      }}
                                    />
                                  </div>
                                </>
                              ) : (
                                <Text type="secondary" style={{ fontSize: '12px' }}>No questions history yet</Text>
                              )}
                            </div>

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
                                {/* Unanswered Question Indicator */}
                                {isTheoryQuestionUnanswered && (
                                  <div style={{ 
                                    marginBottom: '12px', 
                                    padding: '8px 12px', 
                                    backgroundColor: token.colorWarningBg, 
                                    border: `1px solid ${token.colorWarningBorder}`, 
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}>
                                    <span style={{ fontSize: '16px' }}>⏳</span>
                                    <Text style={{ color: token.colorWarning, fontWeight: 'bold', fontSize: '12px' }}>
                                      This is an unanswered question, please answer it to continue  
                                    </Text>
                                  </div>
                                )}
                                
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
                                <div style={{ marginTop: '16px', borderTop: `1px solid ${token.colorBorder}`, paddingTop: '16px' }}>
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
                                  <div style={{ marginTop: '16px', borderTop: `1px solid ${token.colorBorder}`, paddingTop: '16px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                      <Text strong style={{ fontSize: '16px', color: token.colorPrimary }}>
                                        📊 Your Score: {submittedTheoryResult.score}/100
                                      </Text>
                                    </div>

                                    {submittedTheoryResult.explain && (
                                      <div style={{ marginBottom: '12px' }}>
                                        <Text strong style={{ display: 'block', marginBottom: '8px', color: token.colorWarning }}>
                                          📝 Explanation:
                                        </Text>
                                        <div style={{
                                          padding: '12px',
                                          backgroundColor: token.colorWarningBg,
                                          border: `1px solid ${token.colorWarningBorder}`,
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
                                          backgroundColor: token.colorSuccessBg,
                                          border: `1px solid ${token.colorSuccessBorder}`,
                                          borderRadius: '6px',
                                          lineHeight: '1.6'
                                        }}>
                                          {submittedTheoryResult.aiFeedback}
                                        </div>
                                      </div>
                                    )}

                                    {/* Generate New Question Button */}
                                    <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: `1px solid ${token.colorBorder}` }}>
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
                            {/* Questions History Section */}
                            <div style={{ marginBottom: '24px' }}>
                              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong>📚 Questions History</Text>
                                <Space>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>Sort by:</Text>
                                  <Select
                                    value={practiceSortBy}
                                    onChange={(value) => setPracticeSortBy(value)}
                                    style={{ width: 120 }}
                                    size="small"
                                    options={[
                                      { label: 'Time', value: 'createdAt' },
                                      { label: 'Score', value: 'score' }
                                    ]}
                                  />
                                  <Select
                                    value={practiceSortOrder}
                                    onChange={(value) => setPracticeSortOrder(value)}
                                    style={{ width: 80 }}
                                    size="small"
                                    options={[
                                      { label: '↑', value: 'asc' },
                                      { label: '↓', value: 'desc' }
                                    ]}
                                  />
                                </Space>
                              </div>
                              {practiceQuestionsHistory.length > 0 ? (
                                <>
                                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: `1px solid ${token.colorBorder}`, borderRadius: '6px', padding: '12px' }}>
                                    {getPracticePaginatedQuestions().map((q, index) => {
                                      const globalIndex = (practiceCurrentPage - 1) * practicePageSize + index
                                      const isExpanded = expandedPracticeQuestions.has(q.id || globalIndex.toString())
                                      return (
                                        <div key={q.id || globalIndex} style={{ marginBottom: '8px', padding: '8px', backgroundColor: token.colorFillAlter, borderRadius: '4px' }}>
                                          {/* Compact view */}
                                          <div 
                                            style={{ 
                                              display: 'flex', 
                                              justifyContent: 'space-between', 
                                              alignItems: 'center',
                                              cursor: 'pointer',
                                              padding: '4px 0'
                                            }}
                                            onDoubleClick={() => togglePracticeQuestionExpansion(q.id || globalIndex.toString())}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                              <Text strong style={{ fontSize: '12px', minWidth: '60px' }}>
                                                Question {globalIndex + 1}
                                              </Text>
                                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                                {q.createdAt ? new Date(q.createdAt).toLocaleString() : 'N/A'}
                                              </Text>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              {q.score !== undefined && (
                                                <Text style={{ 
                                                  fontSize: '12px', 
                                                  fontWeight: 'bold',
                                                  color: q.score >= 80 ? '#52c41a' : q.score >= 60 ? '#faad14' : '#ff4d4f' 
                                                }}>
                                                  {q.score}/100
                                                </Text>
                                              )}
                                              <Text type="secondary" style={{ fontSize: '10px' }}>
                                                {isExpanded ? '▼' : '▶'} Double-click to {isExpanded ? 'hide' : 'show'} details
                                              </Text>
                                            </div>
                                          </div>
                                          
                                          {/* Expanded view */}
                                          {isExpanded && (
                                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${token.colorBorder}` }}>
                                              <div style={{ fontSize: '12px', marginBottom: '8px' }} dangerouslySetInnerHTML={{ __html: q.content }} />
                                              {q.answer && (
                                                <div style={{ marginBottom: '4px' }}>
                                                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>Your Answer:</Text>
                                                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#666' }}>{q.answer}</div>
                                                </div>
                                              )}
                                              {q.explain && (
                                                <div style={{ marginBottom: '4px' }}>
                                                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>Explanation:</Text>
                                                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#666' }}>{q.explain}</div>
                                                </div>
                                              )}
                                              {q.aiFeedback && (
                                                <div>
                                                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>AI Feedback:</Text>
                                                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#666' }}>{q.aiFeedback}</div>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                  
                                  {/* Pagination */}
                                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                                    <Pagination
                                      current={practiceCurrentPage}
                                      total={practiceQuestionsHistory.length}
                                      pageSize={practicePageSize}
                                      showSizeChanger
                                      showQuickJumper
                                      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} questions`}
                                      pageSizeOptions={['2', '4', '6', '8', '10']}
                                      onChange={(page, size) => {
                                        setPracticeCurrentPage(page)
                                        if (size !== practicePageSize) {
                                          setPracticePageSize(size)
                                        }
                                      }}
                                      onShowSizeChange={(current, size) => {
                                        setPracticePageSize(size)
                                        setPracticeCurrentPage(1)
                                      }}
                                      locale={{
                                        items_per_page: 'items/page',
                                        jump_to: 'Go to',
                                        jump_to_confirm: 'Go to page',
                                        page: 'Page',
                                        prev_page: 'Previous Page',
                                        next_page: 'Next Page',
                                        prev_5: 'Previous 5 Pages',
                                        next_5: 'Next 5 Pages',
                                        prev_3: 'Previous 3 Pages',
                                        next_3: 'Next 3 Pages',
                                      }}
                                    />
                                  </div>
                                </>
                              ) : (
                                <Text type="secondary" style={{ fontSize: '12px' }}>No questions history yet</Text>
                              )}
                            </div>

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
                                {/* Unanswered Question Indicator */}
                                {isPracticeQuestionUnanswered && (
                                  <div style={{ 
                                    marginBottom: '12px', 
                                    padding: '8px 12px', 
                                    backgroundColor: token.colorWarningBg, 
                                    border: `1px solid ${token.colorWarningBorder}`, 
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}>
                                    <span style={{ fontSize: '16px' }}>⏳</span>
                                    <Text style={{ color: token.colorWarning, fontWeight: 'bold', fontSize: '12px' }}>
                                      This is an unanswered question, please answer it to continue
                                    </Text>
                                  </div>
                                )}
                                
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
                                <div style={{ marginTop: '16px', borderTop: `1px solid ${token.colorBorder}`, paddingTop: '16px' }}>
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
                                  <div style={{ marginTop: '16px', borderTop: `1px solid ${token.colorBorder}`, paddingTop: '16px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                      <Text strong style={{ fontSize: '16px', color: token.colorPrimary }}>
                                        📊 Your Score: {submittedPracticeResult.score}/100
                                      </Text>
                                    </div>

                                    {submittedPracticeResult.explain && (
                                      <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ display: 'block', marginBottom: '8px', color: token.colorWarning }}>
                                          📝 Explanation:
                                        </Text>
                                        <div style={{
                                          padding: '12px',
                                          backgroundColor: token.colorWarningBg,
                                          border: `1px solid ${token.colorWarningBorder}`,
                                          borderRadius: '6px',
                                          lineHeight: '1.6'
                                        }}>
                                          {submittedPracticeResult.explain}
                                        </div>
                                      </div>
                                    )}

                                    {/* Generate New Question Button */}
                                    <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: `1px solid ${token.colorBorder}` }}>
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
                        disabled: !selectedKnowledgeForTree.theory,
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
        parentId={createChildParent?.id}
        onCancel={() => setCreateKnowledgeModalOpen(false)}
        onSuccess={() => {
          setCreateChildParent(null)
          setCreateKnowledgeModalOpen(false)
        }}
        onPendingChange={(p) => setIsCreatingKnowledge(p)}
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

          // Refetch queries to ensure data consistency
          await queryClient.refetchQueries({ queryKey: ['topic-knowledges', topicId] })
        }}
        // Pass callback to update selectedKnowledgeForTree immediately
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
         knowledgeContent={selectedKnowledge?.name || ''}
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
         }        }
      />

      {/* Error Modal */}
      <ErrorModal
        open={errorModalOpen}
        message={errorMessage}
        onClose={() => setErrorModalOpen(false)}
      />
    </>
  )
}