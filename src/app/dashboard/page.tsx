"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getUser, getClasses, getActivities } from "@/hooks/api";
import ActivityGraph from "@/components/ActivityGraph";
import StatsCard from "@/components/StatsCard";
import CreateClassModal from "@/components/CreateClassModal";
import EditClassModal from "@/components/EditClassModal";
import DeleteClassModal from "@/components/DeleteClassModal";
import { PageContainer } from "@ant-design/pro-components";
import { Spin, Alert, Button, Card, Typography, Row, Col, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ClassCard from "@/components/ClassCard";
import ClientOnly from '@/components/ClientOnly';

const { Text, Title } = Typography;

export default function DashboardPage() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  // Fetch user data
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });

  // Fetch classes data
  const {
    data: classes = [],
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  // Fetch activities for current year
  const currentYear = new Date().getFullYear();
  const {
    data: activities = [],
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useQuery({
    queryKey: ["activities", currentYear],
    queryFn: () => getActivities(),
  });

  // Check for any errors
  const hasError = userError || classesError || activitiesError;
  const isLoading = userLoading || classesLoading || activitiesLoading;

  // Handle error state
  if (hasError) {
    return (
      <ClientOnly>
        <PageContainer title="Dashboard">
          <Alert
            message="Error"
            description="Failed to load dashboard data. Please try again."
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
        <PageContainer title="Dashboard">
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

  // Calculate learning statistics
  const calculateStats = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Convert activities to map for easier lookup
    const activityMap = new Map();
    activities.forEach((activity: any) => {
      const dateStr = activity.date.toISOString().split("T")[0];
      activityMap.set(dateStr, activity.count);
    });

    // Calculate current streak
    let currentStreak = 0;
    const currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = activityMap.get(dateStr) || 0;

      if (count > 0) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = Array.from(activityMap.keys()).sort();

    for (const dateStr of sortedDates) {
      const count = activityMap.get(dateStr) || 0;
      if (count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Find best day (most answers in a single day)
    let bestDay = 0;
    let bestDayDate = "";
    for (const [dateStr, count] of activityMap) {
      if (count > bestDay) {
        bestDay = count;
        bestDayDate = dateStr;
      }
    }

    // Calculate total active days
    const activeDays = activityMap.size;

    // Calculate total answers
    const totalAnswers = activities.reduce(
      (sum: number, activity: any) => sum + activity.count,
      0
    );

    return {
      currentStreak,
      longestStreak,
      bestDay,
      bestDayDate,
      activeDays,
      totalAnswers,
    };
  };

  const stats = calculateStats();

  return (
    <ClientOnly>
      <PageContainer title="Dashboard" style={{ marginBottom: '48px' }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
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
              <div style={{ textAlign: "center" }}>
                <Text>
                  🎉 Your best day was{" "}
                  <Text strong>
                    {new Date(stats.bestDayDate).toLocaleDateString()}
                  </Text>{" "}
                  with <Text strong>{stats.bestDay} answers</Text>!
                </Text>
              </div>
            </Card>
          )}

          {/* Activity Graph */}
          <Card>
            <ActivityGraph activities={activities} />
          </Card>

          {/* Classes Section */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                Classes
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
              >
                Create Class
              </Button>
            </div>

            {classes.length > 0 ? (
              <Row gutter={[16, 16]}>
                {classes.map((classItem: any) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={classItem.id}>
                    <ClassCard
                      class={classItem}
                      onView={(classItem) =>
                        router.push(`/dashboard/classes/${classItem.id}`)
                      }
                      onEdit={(classItem) => {
                        setSelectedClass(classItem);
                        setEditModalOpen(true);
                      }}
                      onDelete={(classId) => {
                        setSelectedClass({
                          id: classId,
                          name: classItem.name,
                          prompt: classItem.prompt,
                        });
                        setDeleteModalOpen(true);
                      }}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Card style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎓</div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "16px",
                    display: "block",
                    marginBottom: "16px",
                  }}
                >
                  No classes yet
                </Text>
                <Text type="secondary">
                  Create your first class to start organizing your learning topics
                </Text>
              </Card>
            )}
          </div>
        </Space>
      </PageContainer>

      {/* Create Class Modal */}
      <CreateClassModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => setCreateModalOpen(false)}
      />

      {/* Edit Class Modal */}
      <EditClassModal
        open={editModalOpen}
        class={selectedClass}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedClass(null);
        }}
        onSuccess={() => {
          setEditModalOpen(false);
          setSelectedClass(null);
        }}
      />

      {/* Delete Class Modal */}
      <DeleteClassModal
        open={deleteModalOpen}
        classId={selectedClass?.id || null}
        className={selectedClass?.name || ""}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedClass(null);
        }}
        onSuccess={() => {
          setDeleteModalOpen(false);
          setSelectedClass(null);
        }}
      />
    </ClientOnly>
  );
} 