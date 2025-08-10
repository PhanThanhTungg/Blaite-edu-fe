"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@ant-design/pro-components";
import {
  Card,
  Typography,
  Button,
  Spin,
  Alert,
  Input,
  Avatar,
  Space,
  Descriptions,
  Tag,
} from "antd";
import {
  SendOutlined,
  MessageOutlined,
  StarOutlined,
  RobotOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { getKnowledgeDetail } from '@/services/knowledge.service';
import { getQuestions } from '@/services/question.service';
import { createQuestion } from '@/services/question.service';
import { submitAnswer } from '@/services/question.service';
import { generateQuestionWithGemini } from '@/services/question.service';
import { useEffect, useState, useRef } from "react";
import SafeXmlRender from "@/components/SafeXmlRender";

const { Title, Text, Paragraph } = Typography;

export default function KnowledgeDetailAndPracticePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const knowledgeId = params.knowledgeId as string;

  // Practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [aiComment, setAiComment] = useState("");
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  // State tổng cho các block hỏi đáp
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const {
    data: knowledge,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["knowledge", knowledgeId],
    queryFn: () => getKnowledgeDetail(knowledgeId),
    enabled: !!knowledgeId,
  });

  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["questions", knowledgeId],
    queryFn: () => getQuestions(knowledgeId),
    enabled: !!knowledgeId,
    initialData: [],
  });

  // Sort: chưa trả lời lên đầu, trong mỗi nhóm sort theo thời gian giảm dần
  const sortedQuestions = [...questions].sort((a, b) => {
    if (!a.answer && b.answer) return -1;
    if (a.answer && !b.answer) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Handler tạo câu hỏi luyện tập
  const handleGenerateQuestion = async () => {
    if (!knowledge) return;
    setIsGeneratingQuestion(true);
    try {
      // Gọi AI sinh câu hỏi
      const result = await generateQuestionWithGemini(knowledge.content as string);
      const questionContent = result.question || knowledge.content;
      await createQuestion(knowledgeId, 'practice');
    } catch (e) {
      // fallback nếu lỗi
      await createQuestion(knowledgeId, 'practice');
    }
    await queryClient.invalidateQueries({
      queryKey: ["questions", knowledgeId],
    });
    setIsGeneratingQuestion(false);
  };

  // Handler gửi answer step-by-step
  const handleStepSubmit = async () => {
    if (!userAnswer.trim() || !questions[currentIndex]) return;
    setIsSubmittingStep(true);
    // Gửi answer lên server
    // Random score và nhận xét demo
    const randomScore = Math.floor(Math.random() * 41) + 60; // 60-100
    setScore(randomScore);
    setAiComment(
      randomScore > 90
        ? "Rất ấn tượng! Bạn trả lời xuất sắc và trình bày logic, mạch lạc."
        : "Bạn trả lời đúng ý, hãy trình bày chi tiết hơn để đạt điểm tối đa!"
    );
    setShowEvaluation(true);
    setIsSubmittingStep(false);
  };

  if (error) {
    return (
      <Alert
        message="Error"
        description="Failed to load knowledge."
        type="error"
      />
    );
  }
  if (isLoading || isQuestionsLoading) {
    return <Spin size="large" />;
  }
  if (!knowledge) {
    return (
      <Alert
        message="Not Found"
        description="Knowledge not found."
        type="warning"
      />
    );
  }

  // Nếu chưa có câu hỏi
  if (questions.length === 0) {
    return (
      <PageContainer title="Knowledge Detail & Practice">
        <Card
          type="inner"
          title="Nội dung Knowledge"
          style={{ marginBottom: 24 }}
        >
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Nội dung">
              <Typography.Paragraph style={{ fontSize: 16, marginBottom: 0 }}>
                {knowledge.content}
              </Typography.Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="ID">{knowledge.id}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(knowledge.createdAt).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Alert
          type="info"
          message="Chưa có câu hỏi nào cho knowledge này."
          style={{ marginBottom: 16 }}
        />
        <Button
          type="primary"
          block
          loading={isGeneratingQuestion}
          onClick={handleGenerateQuestion}
          disabled={questions.some((q: any) => !q.answer || q.answer.trim() === "")}
        >
          Tạo câu hỏi luyện tập
        </Button>
      </PageContainer>
    );
  }

  // --- UI danh sách hỏi đáp ---
  return (
    <PageContainer
      title={
        <div>
          Luyện tập kiến thức
          {typeof knowledge.avgScore === 'number' && (
            <span style={{ fontWeight: 400, fontSize: 14, marginLeft: 12, color: '#888' }}>
              (Điểm trung bình: {knowledge.avgScore}%)
            </span>
          )}
        </div>
      }
      breadcrumb={{
        items: [
          { path: "/", breadcrumbName: "Trang chủ" },
          { path: "/dashboard/topics", breadcrumbName: "Chủ đề" },
          {
            path: `/dashboard/topics/${topicId}`,
            breadcrumbName: knowledge?.topic?.name || `Chủ đề #${topicId}`,
          },
          {
            path: `/dashboard/topics/${topicId}/knowledges/${knowledgeId}`,
            breadcrumbName:
              knowledge?.content?.slice(0, 30) || `Kiến thức #${knowledgeId}`,
          },
        ],
      }}
      extra={[
        <Button
          key="generate"
          type="primary"
          loading={isGeneratingQuestion}
          onClick={handleGenerateQuestion}
          disabled={questions.some((q: any) => !q.answer || q.answer.trim() === "")}
        >
          Tạo câu hỏi
        </Button>,
      ]}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Block 1: Thông tin Knowledge (Descriptions, no Card) */}
        <Descriptions column={1} size="small" bordered style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Nội dung">
            <Typography.Paragraph style={{ fontSize: 16, marginBottom: 0 }}>
              {knowledge.content}
            </Typography.Paragraph>
          </Descriptions.Item>
          {typeof knowledge.avgScore === 'number' && (
            <Descriptions.Item label="Điểm trung bình">
              <span style={{ fontWeight: 400, fontSize: 14, color: '#888' }}>{knowledge.avgScore}%</span>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="ID">{knowledge.id}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{new Date(knowledge.createdAt).toLocaleDateString()}</Descriptions.Item>
        </Descriptions>
        {/* Danh sách hỏi đáp */}
        {sortedQuestions.length === 0 ? (
          <Alert
            type="info"
            message="Chưa có câu hỏi nào cho knowledge này."
            style={{ marginBottom: 16 }}
          />
        ) : (
          <>
            {sortedQuestions.map((q: any) => {
              const inputValue = inputValues[q.id] || "";
              const loading = loadingIds.includes(q.id);
              const handleSubmit = async () => {
                if (!inputValue.trim()) return;
                setLoadingIds((ids) => [...ids, q.id]);
                try {
                  const res = await submitAnswer(q.id, inputValue);
                  setScore(res.score);
                  setAiComment(res.aiFeedback);
                  setShowEvaluation(true);
                } catch (e) {
                  // Có thể hiển thị message lỗi nếu muốn
                }
                setInputValues((vals) => ({ ...vals, [q.id]: "" }));
                setLoadingIds((ids) => ids.filter((id) => id !== q.id));
                queryClient.invalidateQueries({
                  queryKey: ["questions", knowledgeId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["knowledge", knowledgeId],
                });
              };
              return (
                <Card
                  key={q.id}
                  style={{ marginBottom: 32 }}
                  styles={{ body: { fontSize: 16 } }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <SafeXmlRender xmlString={q.content} />
                  </div>
                  {q.answer ? (
                    <>
                      <Alert
                        type="success"
                        message={
                          <span>
                            <b>Câu trả lời của bạn:</b>{" "}
                            {q.score !== undefined && q.score !== null && (
                              <Tag
                                color={
                                  q.score >= 90
                                    ? "green"
                                    : q.score >= 75
                                    ? "blue"
                                    : "orange"
                                }
                                style={{ marginLeft: 8 }}
                              >
                                {q.score}/100
                              </Tag>
                            )}
                          </span>
                        }
                        description={
                          <div style={{ marginTop: 4 }}>{q.answer}</div>
                        }
                        style={{ marginBottom: 12 }}
                      />
                      {q.aiFeedback && (
                        <Alert
                          type="info"
                          message={
                            <span>
                              <RobotOutlined /> <b>Nhận xét:</b>
                            </span>
                          }
                          description={
                            <div style={{ marginTop: 4 }}>
                              <SafeXmlRender xmlString={q.aiFeedback} />
                            </div>
                          }
                          style={{ marginBottom: 12 }}
                        />
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Input.TextArea
                        value={inputValue}
                        onChange={(e) =>
                          setInputValues((vals) => ({
                            ...vals,
                            [q.id]: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Nhập câu trả lời của bạn..."
                        disabled={loading}
                        autoSize={{ minRows: 4, maxRows: 6 }}
                      />
                      <Button
                        type="primary"
                        size="middle"
                        block
                        icon={
                          <SendOutlined
                            style={{ fontSize: 20, marginRight: 6 }}
                          />
                        }

                        loading={loading}
                        onClick={handleSubmit}
                        disabled={loading || !inputValue.trim()}
                      >
                        Gửi
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </div>
    </PageContainer>
  );
} 