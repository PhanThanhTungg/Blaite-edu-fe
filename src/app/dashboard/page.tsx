'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { serverActions } from '@/hooks/useServerActions'
import ActivityGraph from '@/components/ActivityGraph'
import StatsCard from '@/components/StatsCard'
import CreateTopicModal from '@/components/CreateTopicModal'
import EditTopicModal from '@/components/EditTopicModal'
import DeleteTopicModal from '@/components/DeleteTopicModal'
import { PageContainer } from '@ant-design/pro-components'
import { Spin, Alert, Button, Card, Typography, Row, Col, Space, List, Tag } from 'antd'
import { PlusOutlined, BookOutlined, RightOutlined } from '@ant-design/icons'
import Link from 'next/link'
import TopicCard from '@/components/TopicCard'

const { Text, Title } = Typography

export default function DashboardPage() {
  const router = useRouter()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<any>(null)

  // Fetch user data
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: serverActions.getUser,
  })

  // Fetch topics data
  const { data: topics = [], isLoading: topicsLoading, error: topicsError } = useQuery({
    queryKey: ['topics'],
    queryFn: serverActions.getTopics,
  })

  // Fetch activities for current year
  const currentYear = new Date().getFullYear()
  const { data: activities = [], isLoading: activitiesLoading, error: activitiesError } = useQuery({
    queryKey: ['activities', currentYear],
    queryFn: () => serverActions.getActivitiesByYear(currentYear),
  })

  // Check for any errors
  const hasError = userError || topicsError || activitiesError
  const isLoading = userLoading || topicsLoading || activitiesLoading

  // Handle error state
  if (hasError) {
    return (
      <PageContainer title="Dashboard">
        <Alert
          message="Error"
          description="Failed to load dashboard data. Please try again."
          type="error"
          showIcon
        />
      </PageContainer>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <PageContainer title="Dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    )
  }

  // Calculate learning statistics
  const calculateStats = () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Convert activities to map for easier lookup
    const activityMap = new Map()
    activities.forEach((activity: any) => {
      const dateStr = activity.date.toISOString().split('T')[0]
      activityMap.set(dateStr, activity.count)
    })

    // Calculate current streak
    let currentStreak = 0
    let currentDate = new Date(today)
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const count = activityMap.get(dateStr) || 0
      
      if (count > 0) {
        currentStreak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    const sortedDates = Array.from(activityMap.keys()).sort()
    
    for (const dateStr of sortedDates) {
      const count = activityMap.get(dateStr) || 0
      if (count > 0) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    // Find best day (most answers in a single day)
    let bestDay = 0
    let bestDayDate = ''
    for (const [dateStr, count] of activityMap) {
      if (count > bestDay) {
        bestDay = count
        bestDayDate = dateStr
      }
    }

    // Calculate total active days
    const activeDays = activityMap.size

    // Calculate total answers
    const totalAnswers = activities.reduce((sum: number, activity: any) => sum + activity.count, 0)

    return {
      currentStreak,
      longestStreak,
      bestDay,
      bestDayDate,
      activeDays,
      totalAnswers
    }
  }

  const stats = calculateStats()

  // Prepare topics data for List component
  const topicsData = topics.map((topic) => {
    const knowledgeCount = topic._count?.knowledges || 0
    const questionCount = topic.knowledges?.reduce((sum, k) => sum + (k._count?.questions || 0), 0) || 0
    
    // Calculate average score
    let totalScore = 0
    let totalAnswers = 0
    
    topic.knowledges?.forEach(knowledge => {
      knowledge.questions?.forEach(question => {
        question.answers?.forEach(answer => {
          if (answer.score !== null) {
            totalScore += answer.score
            totalAnswers++
          }
        })
      })
    })
    
    const avgScore = totalAnswers > 0 ? Math.round(totalScore / totalAnswers) : 0
    
    return {
      id: topic.id,
      name: topic.name,
      knowledgeCount,
      questionCount,
      avgScore,
      totalAnswers
    }
  })

  return (
    <>
      <PageContainer title="Dashboard">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Stats Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Current Streak"
                value={stats.currentStreak}
                icon="🔥"
                iconColor="#ff4d4f"
                suffix=" days"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Longest Streak"
                value={stats.longestStreak}
                icon="🏆"
                iconColor="#faad14"
                suffix=" days"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Best Day"
                value={stats.bestDay}
                icon="⭐"
                iconColor="#722ed1"
                suffix=" answers"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Active Days"
                value={stats.activeDays}
                icon="📅"
                iconColor="#52c41a"
                suffix=" days"
              />
            </Col>
          </Row>

          {/* Best Day Info */}
          {stats.bestDay > 0 && (
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <Text>
                  🎉 Your best day was <Text strong>{new Date(stats.bestDayDate).toLocaleDateString()}</Text> with <Text strong>{stats.bestDay} answers</Text>!
                </Text>
              </div>
            </Card>
          )}

          {/* Activity Graph */}
          <Card>
            <ActivityGraph activities={activities} />
          </Card>

          {/* Topics Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={3} style={{ margin: 0 }}>Topics</Title>
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
                {topics.map((topic) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={topic.id}>
                    <TopicCard 
                      topic={{
                        id: topic.id,
                        title: topic.name,
                        description: '',
                        category: '',
                        difficulty: '',
                        status: '',
                        questionsGenerated: topic.knowledges?.reduce((sum, k) => sum + (k._count?.questions || 0), 0) || 0,
                        totalQuestions: topic.knowledges?.reduce((sum, k) => sum + (k.questions?.length || 0), 0) || 0,
                        avgScore: (() => {
                          let totalScore = 0, totalAnswers = 0;
                          topic.knowledges?.forEach(k => k.questions?.forEach(q => q.answers?.forEach(a => {
                            if (a.score !== null) { totalScore += a.score; totalAnswers++; }
                          })));
                          return totalAnswers > 0 ? Math.round(totalScore / totalAnswers) : 0;
                        })(),
                        studyTime: 0,
                        nextReview: '',
                      }}
                      onView={(topic) => router.push(`/dashboard/topics/${topic.id}`)}
                      onEdit={(topic) => {
                        // Convert dashboard topic format to EditTopicModal format
                        setSelectedTopic({
                          id: topic.id,
                          name: topic.title,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          userId: 0
                        })
                        setEditModalOpen(true)
                      }}
                      onDelete={(topicId) => {
                        setSelectedTopic({
                          id: topicId,
                          name: topic.name
                        })
                        setDeleteModalOpen(true)
                      }}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Card style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
                  No topics yet
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
          setEditModalOpen(false)
          setSelectedTopic(null)
        }}
        onSuccess={() => {
          setEditModalOpen(false)
          setSelectedTopic(null)
        }}
      />

      {/* Delete Topic Modal */}
      <DeleteTopicModal
        open={deleteModalOpen}
        topicId={selectedTopic?.id || null}
        topicName={selectedTopic?.name || ''}
        onCancel={() => {
          setDeleteModalOpen(false)
          setSelectedTopic(null)
        }}
        onSuccess={() => {
          setDeleteModalOpen(false)
          setSelectedTopic(null)
        }}
      />
    </>
  )
} 