'use client';

import { Modal, Form, Input, Select, Space, Typography, Tooltip, Button, Radio, theme } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import { App } from 'antd';
import { createClass } from '@/services/class.service';
import { getContextualErrorMessage } from '@/lib/utils/error.utils';

const { Text } = Typography;

interface CreateClassModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// Component to render template with colored placeholders
const TemplatePreview = ({ template }: { template: string }) => {
  const parts = template.split(/(\[[^\]]+\])/g);
  const { token } = theme.useToken();
  
  return (
    <div style={{ fontSize: '12px', lineHeight: '1.4', fontStyle: 'italic' }}>
      {parts.map((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return (
            <Tooltip key={index} title="Replace this with your specific information">
              <span 
                key={index}
                style={{ 
                  backgroundColor: token.colorPrimaryBg, 
                  color: token.colorPrimary, 
                  padding: '1px 4px', 
                  borderRadius: '3px',
                  border: `1px solid ${token.colorPrimaryBorder}`,
                  fontWeight: '500',
                  cursor: 'help'
                }}
              >
                {part}
              </span>
            </Tooltip>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

// Inline editable placeholder component
const EditablePlaceholder = ({ 
  placeholder, 
  onEdit, 
  onSave, 
  onCancel 
}: { 
  placeholder: string; 
  onEdit: () => void; 
  onSave: (value: string) => void; 
  onCancel: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(placeholder);
  const { token } = theme.useToken();

  // Update editValue when placeholder prop changes
  useEffect(() => {
    setEditValue(placeholder);
  }, [placeholder]);

  const handleEdit = () => {
    setEditValue(placeholder);
    setIsEditing(true);
    onEdit();
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(placeholder);
    setIsEditing(false);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        autoFocus
        size="small"
        style={{ 
          minWidth: '120px',
          backgroundColor: token.colorBgContainer,
          border: `2px solid ${token.colorPrimary}`
        }}
      />
    );
  }

  return (
    <Tooltip title="Click to edit this placeholder">
      <span 
        style={{ 
          backgroundColor: token.colorPrimaryBg, 
          color: token.colorPrimary, 
          padding: '2px 6px', 
          borderRadius: '3px',
          border: `1px solid ${token.colorPrimaryBorder}`,
          fontWeight: '500',
          cursor: 'pointer',
          display: 'inline-block',
          margin: '1px',
          minWidth: '60px',
          textAlign: 'center'
        }}
        onClick={handleEdit}
      >
        {placeholder}
      </span>
    </Tooltip>
  );
};

// Interactive template editor component
const TemplateEditor = ({ 
  value, 
  onChange, 
  placeholder,
  onTemplateModified
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
  onTemplateModified?: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [editingPlaceholder, setEditingPlaceholder] = useState<string | null>(null);
  const { token } = theme.useToken();

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange(editValue);
    // Mark template as modified when user saves changes
    if (onTemplateModified) {
      onTemplateModified();
    }
    // Use setTimeout to ensure onChange is processed before setting isEditing to false
    setTimeout(() => {
      setIsEditing(false);
    }, 0);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 's' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handlePlaceholderEdit = (originalPlaceholder: string) => {
    setEditingPlaceholder(originalPlaceholder);
  };

  const handlePlaceholderSave = (newValue: string) => {
    if (!editingPlaceholder) return;
    
    const newEditValue = editValue.replace(editingPlaceholder, newValue);
    setEditValue(newEditValue);
    onChange(newEditValue); // Update form value immediately
    setEditingPlaceholder(null);
    // Mark template as modified when user edits placeholders
    if (onTemplateModified) {
      onTemplateModified();
    }
  };

  const handlePlaceholderCancel = () => {
    setEditingPlaceholder(null);
  };

  // Global keyboard shortcut for Ctrl+S
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' && e.ctrlKey && !isEditing) {
        e.preventDefault();
        handleEdit();
      }
    };

    if (value) {
      document.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [value, isEditing]);

  if (isEditing) {
    return (
      <div>
        <Input.TextArea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={6}
          maxLength={1000}
          showCount
          autoFocus
          style={{ marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#999' }}>
            Ctrl+S to save and return to template view • Esc to cancel
          </span>
        </div>
      </div>
    );
  }

  if (!value) {
    return (
      <div 
        style={{ 
          padding: '12px', 
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: '4px',
          textAlign: 'center',
          color: token.colorTextPlaceholder,
          cursor: 'pointer'
        }}
        onClick={handleEdit}
      >
        {placeholder}
      </div>
    );
  }

  const parts = value.split(/(\[[^\]]+\])/g);
  
  return (
    <div 
      style={{ 
        padding: '12px', 
        border: `1px solid ${token.colorBorder}`,
        borderRadius: '4px',
        minHeight: '120px',
        backgroundColor: token.colorFillAlter
      }}
    >
      <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
        {parts.map((part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            return (
              <EditablePlaceholder
                key={index}
                placeholder={part}
                onEdit={() => handlePlaceholderEdit(part)}
                onSave={(newValue) => handlePlaceholderSave(newValue)}
                onCancel={handlePlaceholderCancel}
              />
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
      <div style={{ 
        marginTop: '8px', 
        fontSize: '12px', 
        color: token.colorTextSecondary,
        textAlign: 'right',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>• Ctrl+S for full text editor • Click placeholders to edit inline</span>
        
      </div>
    </div>
  );
};

export default function CreateClassModal({ open, onCancel, onSuccess }: CreateClassModalProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateLanguage, setTemplateLanguage] = useState<'en' | 'vi'>('en');
  const [isTemplateModified, setIsTemplateModified] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState<string>('');

  // Stable callback for template changes
  const handleTemplateChange = useCallback((value: string) => {
    form.setFieldsValue({ description: value });
    setDescriptionValue(value);
  }, [form]);

  // Reset form and state when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedTemplate(null);
      setIsTemplateModified(false);
      setTemplateLanguage('en');
      setDescriptionValue('');
    }
  }, [open, form]);

  // Template options for description
  const descriptionTemplates = [
    {
      label: 'General Learning',
      value: 'general',
      templates: {
        en: 'I want to learn [subject] because [purpose/reason]. My current level is [beginner/intermediate/advanced]. I have been interested in this field for [time period] and have some basic knowledge in [related areas]. I hope to achieve [specific goals] and improve my [specific skills]. My learning style is [learning preference] and I prefer to study [study method]. I am particularly interested in [specific topics] and would like to focus on [focus areas]. My ultimate goal is to [long-term objective] and I believe this learning journey will help me [expected benefits].',
        vi: 'Tôi muốn học [môn học] vì [lý do/mục đích]. Trình độ hiện tại của tôi là [mới bắt đầu/trung cấp/nâng cao]. Tôi đã quan tâm đến lĩnh vực này trong [thời gian] và có một số kiến thức cơ bản về [lĩnh vực liên quan]. Tôi hy vọng đạt được [mục tiêu cụ thể] và cải thiện [kỹ năng cụ thể]. Phong cách học của tôi là [sở thích học tập] và tôi thích học [phương pháp học]. Tôi đặc biệt quan tâm đến [chủ đề cụ thể] và muốn tập trung vào [lĩnh vực tập trung]. Mục tiêu cuối cùng của tôi là [mục tiêu dài hạn] và tôi tin rằng hành trình học tập này sẽ giúp tôi [lợi ích mong đợi].'
      }
    },
    {
      label: 'Professional Development',
      value: 'professional',
      templates: {
        en: 'I want to learn [subject] for my career advancement in [industry/field]. My current level is [beginner/intermediate/advanced] and I have [years of experience] years of experience in [related field]. I need to improve my [specific skills] to [career goal] and enhance my professional capabilities. This skill is essential for my current role as [job title] and will help me [specific career benefits]. I am planning to [career timeline] and need to develop expertise in [key areas]. My company values [company values] and this learning aligns with our [business objectives]. I hope to apply these skills in [specific projects] and contribute to [team/department goals].',
        vi: 'Tôi muốn học [môn học] để phát triển sự nghiệp trong [ngành/lĩnh vực]. Trình độ hiện tại của tôi là [mới bắt đầu/trung cấp/nâng cao] và tôi có [số năm kinh nghiệm] năm kinh nghiệm trong [lĩnh vực liên quan]. Tôi cần cải thiện [kỹ năng cụ thể] để [mục tiêu nghề nghiệp] và nâng cao khả năng chuyên môn. Kỹ năng này rất cần thiết cho vai trò hiện tại của tôi là [chức vụ] và sẽ giúp tôi [lợi ích nghề nghiệp cụ thể]. Tôi đang lên kế hoạch [timeline nghề nghiệp] và cần phát triển chuyên môn trong [lĩnh vực chính]. Công ty tôi coi trọng [giá trị công ty] và việc học này phù hợp với [mục tiêu kinh doanh] của chúng tôi. Tôi hy vọng áp dụng những kỹ năng này trong [dự án cụ thể] và đóng góp vào [mục tiêu nhóm/phòng ban].'
      }
    },
    {
      label: 'Academic Study',
      value: 'academic',
      templates: {
        en: 'I want to learn [subject] for academic purposes as part of my [degree program/course]. My current level is [beginner/intermediate/advanced] and I have completed [previous coursework]. I aim to [academic goal] and develop a strong foundation in [specific areas] to support my studies. This subject is crucial for my [research focus/thesis topic] and will help me understand [academic concepts]. I need to master [key topics] for my upcoming [exams/assignments] and improve my [academic skills]. My learning approach includes [study methods] and I prefer [learning resources]. I am particularly interested in [research areas] and plan to [future academic plans]. This knowledge will support my goal of [academic career objective].',
        vi: 'Tôi muốn học [môn học] cho mục đích học thuật như một phần của [chương trình học/khóa học]. Trình độ hiện tại của tôi là [mới bắt đầu/trung cấp/nâng cao] và tôi đã hoàn thành [khóa học trước đó]. Tôi nhằm mục tiêu [mục tiêu học thuật] và phát triển nền tảng vững chắc trong [lĩnh vực cụ thể] để hỗ trợ việc học. Môn học này rất quan trọng cho [trọng tâm nghiên cứu/đề tài luận văn] của tôi và sẽ giúp tôi hiểu [khái niệm học thuật]. Tôi cần nắm vững [chủ đề chính] cho [kỳ thi/bài tập] sắp tới và cải thiện [kỹ năng học thuật]. Phương pháp học của tôi bao gồm [phương pháp học] và tôi thích [tài nguyên học tập]. Tôi đặc biệt quan tâm đến [lĩnh vực nghiên cứu] và dự định [kế hoạch học thuật tương lai]. Kiến thức này sẽ hỗ trợ mục tiêu [mục tiêu nghề nghiệp học thuật] của tôi.'
      }
    },
    {
      label: 'Travel & Communication',
      value: 'travel',
      templates: {
        en: 'I want to learn [subject] for travel and communication purposes. My current level is [beginner/intermediate/advanced] and I have [travel experience]. I need to be able to [travel scenarios] and communicate effectively in [situations] during my travels. I am planning to visit [destinations] and want to [travel goals]. This language/skill will help me [specific travel benefits] and allow me to [cultural interactions]. I am particularly interested in [cultural aspects] and want to [travel experiences]. My travel style is [travel preference] and I enjoy [travel activities]. I hope to [travel timeline] and this learning will enhance my [travel experiences]. I want to be able to [communication goals] and feel confident when [travel situations].',
        vi: 'Tôi muốn học [môn học] cho mục đích du lịch và giao tiếp. Trình độ hiện tại của tôi là [mới bắt đầu/trung cấp/nâng cao] và tôi có [kinh nghiệm du lịch]. Tôi cần có thể [tình huống du lịch] và giao tiếp hiệu quả trong [tình huống] khi đi du lịch. Tôi đang lên kế hoạch thăm [điểm đến] và muốn [mục tiêu du lịch]. Ngôn ngữ/kỹ năng này sẽ giúp tôi [lợi ích du lịch cụ thể] và cho phép tôi [tương tác văn hóa]. Tôi đặc biệt quan tâm đến [khía cạnh văn hóa] và muốn [trải nghiệm du lịch]. Phong cách du lịch của tôi là [sở thích du lịch] và tôi thích [hoạt động du lịch]. Tôi hy vọng [timeline du lịch] và việc học này sẽ nâng cao [trải nghiệm du lịch] của tôi. Tôi muốn có thể [mục tiêu giao tiếp] và cảm thấy tự tin khi [tình huống du lịch].'
      }
    },
    {
      label: 'Exam Preparation',
      value: 'exam',
      templates: {
        en: 'I want to learn [subject] to prepare for [exam/certification name]. My current level is [beginner/intermediate/advanced] and I have [previous exam experience]. I need to focus on [exam areas] and achieve a score of [target score] to [exam purpose]. The exam is scheduled for [exam date] and I have [preparation time] to study. I need to improve my [weak areas] and strengthen my [strong areas]. My study plan includes [study schedule] and I will use [study materials]. I am particularly concerned about [challenging topics] and need extra practice in [difficult areas]. My goal is to [exam outcome] and this certification will help me [career/academic benefits]. I have taken [practice tests] and scored [practice scores]. I need to focus on [improvement areas] to reach my target score.',
        vi: 'Tôi muốn học [môn học] để chuẩn bị cho [tên kỳ thi/chứng chỉ]. Trình độ hiện tại của tôi là [mới bắt đầu/trung cấp/nâng cao] và tôi có [kinh nghiệm thi trước đó]. Tôi cần tập trung vào [lĩnh vực thi] và đạt điểm [điểm mục tiêu] để [mục đích thi]. Kỳ thi được lên lịch vào [ngày thi] và tôi có [thời gian chuẩn bị] để học. Tôi cần cải thiện [lĩnh vực yếu] và củng cố [lĩnh vực mạnh]. Kế hoạch học của tôi bao gồm [lịch học] và tôi sẽ sử dụng [tài liệu học]. Tôi đặc biệt lo lắng về [chủ đề khó] và cần luyện tập thêm trong [lĩnh vực khó]. Mục tiêu của tôi là [kết quả thi] và chứng chỉ này sẽ giúp tôi [lợi ích nghề nghiệp/học thuật]. Tôi đã làm [bài thi thử] và đạt [điểm thi thử]. Tôi cần tập trung vào [lĩnh vực cần cải thiện] để đạt điểm mục tiêu.'
      }
    },
    {
      label: 'Hobby & Interest',
      value: 'hobby',
      templates: {
        en: 'I want to learn [subject] as a hobby and personal interest. My current level is [beginner/intermediate/advanced] and I have been interested in this for [time period]. I enjoy [related activities] and want to deepen my understanding of [specific aspects] for personal enrichment. This hobby started when [origin story] and has become an important part of my [lifestyle/personality]. I am particularly fascinated by [specific topics] and want to explore [areas of interest]. My learning approach is [learning style] and I prefer [learning methods]. I have already [previous experience] and want to [next steps]. This hobby helps me [personal benefits] and I find it [emotional connection]. I hope to [hobby goals] and eventually [long-term hobby objectives]. I enjoy [hobby activities] and want to [hobby development].',
        vi: 'Tôi muốn học [môn học] như một sở thích và quan tâm cá nhân. Trình độ hiện tại của tôi là [mới bắt đầu/trung cấp/nâng cao] và tôi đã quan tâm đến điều này trong [thời gian]. Tôi thích [hoạt động liên quan] và muốn hiểu sâu hơn về [khía cạnh cụ thể] để làm phong phú bản thân. Sở thích này bắt đầu khi [câu chuyện nguồn gốc] và đã trở thành một phần quan trọng trong [lối sống/tính cách] của tôi. Tôi đặc biệt bị cuốn hút bởi [chủ đề cụ thể] và muốn khám phá [lĩnh vực quan tâm]. Phương pháp học của tôi là [phong cách học] và tôi thích [phương pháp học]. Tôi đã [kinh nghiệm trước đó] và muốn [bước tiếp theo]. Sở thích này giúp tôi [lợi ích cá nhân] và tôi thấy nó [kết nối cảm xúc]. Tôi hy vọng [mục tiêu sở thích] và cuối cùng [mục tiêu sở thích dài hạn]. Tôi thích [hoạt động sở thích] và muốn [phát triển sở thích].'
      }
    },
    {
      label: 'Business & Entrepreneurship',
      value: 'business',
      templates: {
        en: 'I want to learn [subject] for business and entrepreneurship purposes. My current level is [beginner/intermediate/advanced] and I have [business experience]. I need to develop [business skills] to [business goals] and improve my ability to [business activities]. I am currently [business situation] and planning to [business timeline]. This skill is essential for [business needs] and will help me [business benefits]. I am working on [business projects] and need expertise in [key areas]. My business model focuses on [business focus] and this learning aligns with [business strategy]. I need to [business objectives] and improve my [business capabilities]. I am particularly interested in [business topics] and want to [business development]. This knowledge will help me [business outcomes] and contribute to [business success]. I plan to apply these skills in [business applications] and [business goals].',
        vi: 'Tôi muốn học [môn học] cho mục đích kinh doanh và khởi nghiệp. Trình độ hiện tại của tôi là [mới bắt đầu/trung cấp/nâng cao] và tôi có [kinh nghiệm kinh doanh]. Tôi cần phát triển [kỹ năng kinh doanh] để [mục tiêu kinh doanh] và cải thiện khả năng [hoạt động kinh doanh]. Tôi hiện đang [tình hình kinh doanh] và lên kế hoạch [timeline kinh doanh]. Kỹ năng này rất cần thiết cho [nhu cầu kinh doanh] và sẽ giúp tôi [lợi ích kinh doanh]. Tôi đang làm việc trên [dự án kinh doanh] và cần chuyên môn trong [lĩnh vực chính]. Mô hình kinh doanh của tôi tập trung vào [trọng tâm kinh doanh] và việc học này phù hợp với [chiến lược kinh doanh]. Tôi cần [mục tiêu kinh doanh] và cải thiện [khả năng kinh doanh]. Tôi đặc biệt quan tâm đến [chủ đề kinh doanh] và muốn [phát triển kinh doanh]. Kiến thức này sẽ giúp tôi [kết quả kinh doanh] và đóng góp vào [thành công kinh doanh]. Tôi dự định áp dụng những kỹ năng này trong [ứng dụng kinh doanh] và [mục tiêu kinh doanh].'
      }
    }
  ];

  const createClassMutation = useMutation({
    mutationFn: (values: { name: string; description?: string }) =>
      createClass(values.name, values.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      message.success('Class created successfully!');
      form.resetFields();
      setSelectedTemplate(null);
      setIsTemplateModified(false);
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = getContextualErrorMessage(error, 'creating class');
      message.error(errorMessage);
      console.error('Error creating class:', error);
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createClassMutation.mutateAsync(values);
    } catch (error) {
      // Form validation error
    }
  };

  const handleTemplateSelect = (templateValue: string) => {
    const selectedTemplateObj = descriptionTemplates.find(t => t.value === templateValue);
    if (selectedTemplateObj) {
      const template = selectedTemplateObj.templates[templateLanguage];
      form.setFieldsValue({ description: template });
      setDescriptionValue(template);
      setSelectedTemplate(template);
      setIsTemplateModified(false); // Reset modification flag when selecting new template
    } else {
      setSelectedTemplate(null);
      setIsTemplateModified(false);
      setDescriptionValue('');
    }
  };

  const handleLanguageChange = (language: 'en' | 'vi') => {
    setTemplateLanguage(language);
    // Only update template language if template hasn't been modified by user
    if (!isTemplateModified && selectedTemplate) {
      // Find the template object by comparing with the current selected template
      const templateObj = descriptionTemplates.find(t => 
        t.templates.en === selectedTemplate || t.templates.vi === selectedTemplate
      );
      if (templateObj) {
        const newTemplate = templateObj.templates[language];
        form.setFieldsValue({ description: newTemplate });
        setDescriptionValue(newTemplate);
        setSelectedTemplate(newTemplate);
      }
    }
  };

  return (
    <Modal
      title="Create New Class"
      open={open}
      onCancel={() => {
        setSelectedTemplate(null);
        setIsTemplateModified(false);
        onCancel();
      }}
      onOk={handleSubmit}
      okText="Create"
      cancelText="Cancel"
      confirmLoading={createClassMutation.isPending}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Class Name"
          rules={[
            { required: true, message: 'Please enter the field you want to learn about' },
            { max: 100, message: 'Class name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter the language you want to learn about. Ex: English, French, Spanish, etc." />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ marginRight: '10px' }}>Description</Text>
                <Radio.Group 
                  value={templateLanguage} 
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  size="small"
                >
                  <Radio.Button value="en">English</Radio.Button>
                  <Radio.Button value="vi">Tiếng Việt</Radio.Button>
                </Radio.Group>
              </div>
              <Select
                placeholder="Choose a template to get started"
                style={{ width: '100%' }}
                options={descriptionTemplates.map(template => ({
                  label: template.label,
                  value: template.value
                }))}
                onChange={handleTemplateSelect}
                allowClear
              />
            </Space>
          }
          rules={[
            { max: 1000, message: 'Description cannot exceed 1000 characters' }
          ]}
          extra={
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Available Templates ({templateLanguage === 'en' ? 'English' : 'Tiếng Việt'}):</strong>
              </div>
              <div style={{ lineHeight: '1.4' }}>
                <div style={{ marginBottom: '2px' }}>• <strong>General Learning:</strong> {templateLanguage === 'en' ? 'For personal interest and general skill development' : 'Cho sở thích cá nhân và phát triển kỹ năng chung'}</div>
                <div style={{ marginBottom: '2px' }}>• <strong>Professional Development:</strong> {templateLanguage === 'en' ? 'For career advancement and workplace skills' : 'Cho phát triển nghề nghiệp và kỹ năng công việc'}</div>
                <div style={{ marginBottom: '2px' }}>• <strong>Academic Study:</strong> {templateLanguage === 'en' ? 'For educational purposes and academic goals' : 'Cho mục đích giáo dục và mục tiêu học thuật'}</div>
                <div style={{ marginBottom: '2px' }}>• <strong>Travel & Communication:</strong> {templateLanguage === 'en' ? 'For travel and international communication' : 'Cho du lịch và giao tiếp quốc tế'}</div>
                <div style={{ marginBottom: '2px' }}>• <strong>Exam Preparation:</strong> {templateLanguage === 'en' ? 'For test preparation and certification' : 'Cho chuẩn bị thi và chứng chỉ'}</div>
                <div style={{ marginBottom: '2px' }}>• <strong>Hobby & Interest:</strong> {templateLanguage === 'en' ? 'For personal hobbies and interests' : 'Cho sở thích và quan tâm cá nhân'}</div>
                <div style={{ marginBottom: '8px' }}>• <strong>Business & Entrepreneurship:</strong> {templateLanguage === 'en' ? 'For business skills and entrepreneurship' : 'Cho kỹ năng kinh doanh và khởi nghiệp'}</div>
              </div>
            </div>
          }
        >
          <TemplateEditor
            value={descriptionValue}
            onChange={handleTemplateChange}
            placeholder={templateLanguage === 'en' 
              ? "Select a template above or click here to start writing your description"
              : "Chọn template ở trên hoặc click vào đây để bắt đầu viết mô tả"
            }
            onTemplateModified={() => setIsTemplateModified(true)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
} 