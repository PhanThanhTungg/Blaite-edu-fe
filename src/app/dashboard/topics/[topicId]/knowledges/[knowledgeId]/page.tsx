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
import { serverActions } from "@/hooks/useServerActions";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

const { Title, Text, Paragraph } = Typography;

export default function KnowledgeDetailAndPracticePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.topicId as string);
  const knowledgeId = parseInt(params.knowledgeId as string);

  // Practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [aiComment, setAiComment] = useState("");
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  // State tổng cho các block hỏi đáp
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const queryClient = useQueryClient();

  const {
    data: knowledge,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["knowledge", knowledgeId],
    queryFn: () => serverActions.getKnowledge(knowledgeId),
    enabled: !!knowledgeId,
  });

  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["questions", knowledgeId],
    queryFn: () => serverActions.getQuestions(knowledgeId),
    enabled: !!knowledgeId,
    initialData: [],
  });

  // Handler tạo câu hỏi luyện tập
  const handleGenerateQuestion = async () => {
    if (!knowledge) return;
    setIsGeneratingQuestion(true);
    // Tổng hợp các câu hỏi và câu trả lời trước đó
    const previousQuestions = questions.map((q) => `- ${q.content}`).join("\n");
    const prompt = `Dựa trên nội dung sau và các câu hỏi đã hỏi trước đó, hãy tạo ra một câu hỏi luyện tập NGẮN GỌN, ưu tiên dạng trắc nghiệm hoặc tự luận thật ngắn, để người học có thể trả lời nhanh. Tránh lặp lại các câu hỏi đã hỏi. Nếu là trắc nghiệm, hãy kèm theo 4 đáp án (A, B, C, D) và chỉ định đáp án đúng.\n\nNội dung: ${knowledge.content}\nCác câu hỏi đã hỏi trước:\n${previousQuestions}`;
    let questionContent = knowledge.content;
    try {
      const geminiRes = await serverActions.generateQuestionWithGemini({
        content: prompt,
      });
      if (geminiRes.question) questionContent = geminiRes.question;
    } catch (e) {
      // fallback nếu lỗi
      questionContent = knowledge.content;
    }
    await serverActions.createQuestion({
      topicId: topicId,
      knowledgeId: knowledgeId,
      content: questionContent,
    });
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
          disabled={questions.some(q => !q.answer || q.answer.trim() === "")}
        >
          Tạo câu hỏi luyện tập
        </Button>
      </PageContainer>
    );
  }

  // --- UI danh sách hỏi đáp ---
  return (
    <PageContainer
      title="Luyện tập kiến thức"
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
          disabled={questions.some(q => !q.answer || q.answer.trim() === "")}
        >
          Tạo câu hỏi
        </Button>,
      ]}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Block 1: Thông tin Knowledge */}
        <Card
          type="inner"
          title="Nội dung Knowledge"
          style={{ marginBottom: 24 }}
          bodyStyle={{ fontSize: 16 }}
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
        {/* Danh sách hỏi đáp */}
        {questions.length === 0 ? (
          <Alert
            type="info"
            message="Chưa có câu hỏi nào cho knowledge này."
            style={{ marginBottom: 16 }}
          />
        ) : (
          <>
            {questions.map((q: any) => {
              const inputValue = inputValues[q.id] || "";
              const loading = loadingIds.includes(q.id);
              const handleSubmit = async () => {
                if (!inputValue.trim()) return;
                setLoadingIds((ids) => [...ids, q.id]);
                // Gọi Gemini để chấm điểm và nhận xét
                const { score, aiFeedback } =
                  await serverActions.evaluateAnswerWithGemini({
                    question: q.content,
                    answer: inputValue,
                  });
                await serverActions.updateQuestion({
                  questionId: q.id,
                  content: q.content,
                  answer: inputValue,
                  score,
                  aiFeedback,
                });
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
                  title={
                    <span>
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {q.content}
                      </ReactMarkdown>
                    </span>
                  }
                >
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
                              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                {q.aiFeedback}
                              </ReactMarkdown>
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
