'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Card, Descriptions, Tag, Button, Spin, Alert, Typography, Row, Col, Skeleton, Tabs, Input } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { getTopic, getKnowledges, generateKnowledge, generateTheory, getKnowledgeDetail, generateTheoryQuestion, generatePracticeQuestion, submitQuestionAnswer, getClass } from '@/hooks/api';
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
        console.log('🔍 Found leaf nodes for theory generation:', leafNodes.map(n => n.name));
        
        // Generate theory for all leaf nodes
        for (const leafNode of leafNodes) {
          try {
            console.log('🔍 Generating theory for:', leafNode.name);
            await generateTheory(leafNode.id);
            
            // Fetch updated knowledge with theory
            const updatedKnowledge = await getKnowledgeDetail(leafNode.id);
            
            // Update the specific knowledge in the cache
            queryClient.setQueryData(['topic-knowledges', topicId], (oldData: any) => {
              if (!oldData) return oldData;
              
              const updateKnowledgeInTree = (knowledges: any[]): any[] => {
                return knowledges.map(knowledge => {
                  if (knowledge.id === leafNode.id) {
                    console.log('🔍 Updated knowledge with theory:', knowledge.name);
                    return { ...knowledge, theory: updatedKnowledge.theory };
                  }
                  if (knowledge.children) {
                    return { ...knowledge, children: updateKnowledgeInTree(knowledge.children) };
                  }
                  return knowledge;
                });
              };
              
              return updateKnowledgeInTree(oldData);
            });
          } catch (error) {
            console.error('Error generating theory for:', leafNode.name, error);
          }
        }
      };
      
      // Generate theory for the newly created knowledges
      await generateTheoryForLeafNodes(newKnowledges);
      
      // Refresh the data
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
    console.log('🔍 Selected knowledge:', knowledge);
    
    setSelectedKnowledgeForTree(knowledge);
    setSelectedTreeKeys([knowledge.id]);
    
    // Reset tab to overview when selecting new knowledge
    setActiveTab('overview');
    
    // Reset questions and answers when selecting new knowledge
      setTheoryQuestion(null);
      setPracticeQuestion(null);
    setTheoryAnswer('');
    setPracticeAnswer('');
    setSubmittedTheoryResult(null);
    setSubmittedPracticeResult(null);
  };

  const handleGenerateTheoryQuestion = async () => {
    if (!selectedKnowledgeForTree) return;
    
    setIsGeneratingTheoryQuestion(true);
    try {
      const question = await generateTheoryQuestion(selectedKnowledgeForTree.id);
      setTheoryQuestion(question);
      
      // Switch to theory exercise tab after generating question
      setActiveTab('theory-exercise');
      
      console.log('🔍 Generated theory question:', question);
    } catch (error) {
      console.error('Error generating theory question:', error);
    } finally {
      setIsGeneratingTheoryQuestion(false);
    }
  };

  const handleGeneratePracticeQuestion = async () => {
    if (!selectedKnowledgeForTree) return;
    
    setIsGeneratingPracticeQuestion(true);
    try {
      const question = await generatePracticeQuestion(selectedKnowledgeForTree.id);
      setPracticeQuestion(question);
      
      // Switch to practice exercise tab after generating question
      setActiveTab('practice-exercise');
      
      console.log('🔍 Generated practice question:', question);
    } catch (error) {
      console.error('Error generating practice question:', error);
    } finally {
      setIsGeneratingPracticeQuestion(false);
    }
  };

  const handleSubmitTheoryAnswer = async () => {
    if (!theoryQuestion || !theoryAnswer.trim()) return;
    
    setIsSubmittingTheoryAnswer(true);
    try {
      const result = await submitQuestionAnswer(theoryQuestion.id, theoryAnswer);
      console.log('🔍 Submitted theory answer:', result);
      
      // Store the result to display score and explanation
      setSubmittedTheoryResult(result);
      
      // Keep the answer in the input so user can see what they submitted
    } catch (error) {
      console.error('Error submitting theory answer:', error);
    } finally {
      setIsSubmittingTheoryAnswer(false);
    }
  };

  const handleSubmitPracticeAnswer = async () => {
    if (!practiceQuestion || !practiceAnswer.trim()) return;
    
    setIsSubmittingPracticeAnswer(true);
    try {
      const result = await submitQuestionAnswer(practiceQuestion.id, practiceAnswer);
      console.log('🔍 Submitted practice answer:', result);
      
      // Store the result to display score and explanation
      setSubmittedPracticeResult(result);
      
      // Keep the answer in the input so user can see what they submitted
    } catch (error) {
      console.error('Error submitting practice answer:', error);
    } finally {
      setIsSubmittingPracticeAnswer(false);
    }
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
            { title: '🏠', href: '/dashboard' },
            { title: 'Classes', href: '/dashboard/classes' },
            ...(classData ? [{ title: classData.name, href: `/dashboard/classes/${classData.id}` }] : []),
            { title: topic.name },
          ],
        }}
        extra={[
          <Button 
            key="generate" 
            type="primary"
            icon={<PlusOutlined />} 
            onClick={handleGenerateKnowledge}
            loading={isGenerating}
            size="large"
          >
            {isGenerating ? 'Generating Knowledge & Theory...' : 'Generate Knowledge & Theory'}
          </Button>
        ]}
      >
                <Row gutter={[16, 16]}>
          {/* Knowledge Tree Section */}
          <Col xs={24} md={8} lg={6}>
            <Card>
            <KnowledgeTree 
              knowledges={knowledges}
              onSelect={handleKnowledgeSelect}
              selectedKeys={selectedTreeKeys}
            />
            </Card>
          </Col>

          {/* Selected Knowledge Details */}
          <Col xs={24} md={16} lg={18}>
            {selectedKnowledgeForTree ? (
              <Card>
                <Tabs
                  activeKey={activeTab}
                  onChange={(key) => setActiveTab(key)}
                  items={[
                    {
                      key: 'overview',
                      label: 'Overview',
                      children: (
                <div>
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
                                          📊 Your Score: {submittedTheoryResult.score}/10
                                        </Text>
                                      </div>
                                      
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
                                      
                                      <div>
                                        <Text strong style={{ display: 'block', marginBottom: '8px', color: '#52c41a' }}>
                                          🤖 AI Feedback:
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
                                      
                                      {/* New Question Button */}
                                      <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                        <Button
                                          type="dashed"
                                          size="large"
                                          icon={<FileTextOutlined />}
                                          onClick={() => {
                                            setTheoryQuestion(null);
                                            setSubmittedTheoryResult(null);
                                            setTheoryAnswer('');
                                            handleGenerateTheoryQuestion();
                                          }}
                                          style={{ 
                                            borderColor: '#1890ff',
                                            color: '#1890ff'
                                          }}
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
                                icon={<BookOutlined />}
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
                                      📊 Your Score: {submittedPracticeResult.score}/10
                                    </Text>
                                  </div>
                                  
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
                                      {submittedPracticeResult.explain}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Text strong style={{ display: 'block', marginBottom: '8px', color: '#52c41a' }}>
                                      🤖 AI Feedback:
                                    </Text>
                                    <div style={{ 
                                      padding: '12px', 
                                      backgroundColor: '#f6ffed', 
                                      border: '1px solid #b7eb8f',
                                      borderRadius: '6px',
                                      lineHeight: '1.6'
                                    }}>
                                      {submittedPracticeResult.aiFeedback}
                                    </div>
                          </div>
                                  
                                  {/* New Question Button */}
                                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                    <Button
                                      type="dashed"
                                      size="large"
                                      icon={<BookOutlined />}
                                      onClick={() => {
                                        setPracticeQuestion(null);
                                        setSubmittedPracticeResult(null);
                                        setPracticeAnswer('');
                                        handleGeneratePracticeQuestion();
                                      }}
                                      style={{ 
                                        borderColor: '#52c41a',
                                        color: '#52c41a'
                                      }}
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
                    }] : [])
                  ]}
                />
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                  <Text type="secondary">Select a knowledge from the tree to view details</Text>
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