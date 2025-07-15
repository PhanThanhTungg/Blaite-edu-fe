'use client';

import { Form, Input, Select, InputNumber, Radio, Checkbox, Switch, Divider, Alert, Avatar, Button } from 'antd';
import { UserOutlined, ApiOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';

interface SettingsFormProps {
  form: any;
  loading?: boolean;
}

export default function SettingsForm({ form, loading = false }: SettingsFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        notifications: true,
        emailNotifications: true,
        dailyReminder: true,
        weeklyReport: true,
        aiAssistance: true,
        autoGenerateQuestions: true,
        questionDifficulty: 'adaptive',
        questionsPerSession: 10,
        studyTimeGoal: 60,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        telegramIntegration: false,
        telegramBotToken: '',
        telegramChatId: '',
        openaiApiKey: '',
        openaiModel: 'gpt-3.5-turbo',
        maxTokens: 150,
        temperature: 0.7,
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Profile Settings */}
        <Col xs={24} lg={12}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <Button size="small">Change Avatar</Button>
                <div className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB.</div>
              </div>
            </div>
            
            <Form.Item label="Display Name" name="displayName">
              <Input placeholder="Enter your display name" />
            </Form.Item>
            
            <Form.Item label="Email" name="email">
              <Input placeholder="Enter your email address" />
            </Form.Item>
            
            <Form.Item label="Bio" name="bio">
              <Input.TextArea 
                rows={3} 
                placeholder="Tell us about yourself..."
              />
            </Form.Item>
          </div>
        </Col>

        {/* Notification Settings */}
        <Col xs={24} lg={12}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-gray-500">Receive notifications in your browser</div>
              </div>
              <Form.Item name="notifications" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            
            <Divider />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-gray-500">Receive updates via email</div>
              </div>
              <Form.Item name="emailNotifications" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            
            <Divider />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Daily Reminder</div>
                <div className="text-sm text-gray-500">Get reminded to study daily</div>
              </div>
              <Form.Item name="dailyReminder" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            
            <Divider />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly Progress Report</div>
                <div className="text-sm text-gray-500">Receive weekly learning summary</div>
              </div>
              <Form.Item name="weeklyReport" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
          </div>
        </Col>

        {/* Learning Preferences */}
        <Col xs={24} lg={12}>
          <div className="space-y-4">
            <Form.Item label="Questions per Session" name="questionsPerSession">
              <InputNumber 
                min={1} 
                max={50} 
                className="w-full"
                placeholder="Number of questions per study session"
              />
            </Form.Item>
            
            <Form.Item label="Daily Study Goal (minutes)" name="studyTimeGoal">
              <InputNumber 
                min={10} 
                max={300} 
                className="w-full"
                placeholder="Daily study time goal"
              />
            </Form.Item>
            
            <Form.Item label="Question Difficulty" name="questionDifficulty">
              <Radio.Group>
                <Radio value="adaptive">Adaptive (Recommended)</Radio>
                <Radio value="fixed">Fixed Level</Radio>
                <Radio value="mixed">Mixed Levels</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item label="Study Schedule" name="studySchedule">
              <Checkbox.Group>
                <div className="space-y-2">
                  <Checkbox value="monday">Monday</Checkbox>
                  <Checkbox value="tuesday">Tuesday</Checkbox>
                  <Checkbox value="wednesday">Wednesday</Checkbox>
                  <Checkbox value="thursday">Thursday</Checkbox>
                  <Checkbox value="friday">Friday</Checkbox>
                  <Checkbox value="saturday">Saturday</Checkbox>
                  <Checkbox value="sunday">Sunday</Checkbox>
                </div>
              </Checkbox.Group>
            </Form.Item>
          </div>
        </Col>

        {/* AI Configuration */}
        <Col xs={24} lg={12}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">AI Assistance</div>
                <div className="text-sm text-gray-500">Enable AI-powered learning features</div>
              </div>
              <Form.Item name="aiAssistance" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            
            <Divider />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-generate Questions</div>
                <div className="text-sm text-gray-500">Automatically create practice questions</div>
              </div>
              <Form.Item name="autoGenerateQuestions" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            
            <Divider />
            
            <Form.Item label="OpenAI API Key" name="openaiApiKey">
              <Input.Password 
                placeholder="Enter your OpenAI API key"
                prefix={<ApiOutlined />}
              />
            </Form.Item>
            
            <Form.Item label="AI Model" name="openaiModel">
              <Select>
                <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
                <Select.Option value="gpt-4">GPT-4</Select.Option>
                <Select.Option value="gpt-4-turbo">GPT-4 Turbo</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Max Tokens" name="maxTokens">
              <InputNumber 
                min={50} 
                max={500} 
                className="w-full"
                placeholder="Maximum tokens per response"
              />
            </Form.Item>
            
            <Form.Item label="Temperature" name="temperature">
              <InputNumber 
                min={0} 
                max={2} 
                step={0.1}
                className="w-full"
                placeholder="AI creativity level (0-2)"
              />
            </Form.Item>
          </div>
        </Col>

        {/* Telegram Integration */}
        <Col xs={24} lg={12}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Enable Telegram Bot</div>
                <div className="text-sm text-gray-500">Receive notifications on Telegram</div>
              </div>
              <Form.Item name="telegramIntegration" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            
            <Divider />
            
            <Form.Item label="Bot Token" name="telegramBotToken">
              <Input.Password 
                placeholder="Enter your Telegram bot token"
                prefix={<ApiOutlined />}
              />
            </Form.Item>
            
            <Form.Item label="Chat ID" name="telegramChatId">
              <Input 
                placeholder="Enter your Telegram chat ID"
                prefix={<UserOutlined />}
              />
            </Form.Item>
            
            <Alert
              message="Setup Instructions"
              description="1. Create a bot with @BotFather on Telegram. 2. Get your bot token. 3. Start a chat with your bot. 4. Get your chat ID from @userinfobot."
              type="info"
              showIcon
            />
          </div>
        </Col>

        {/* Appearance & Language */}
        <Col xs={24} lg={12}>
          <div className="space-y-4">
            <Form.Item label="Theme" name="theme">
              <Radio.Group>
                <Radio value="light">Light</Radio>
                <Radio value="dark">Dark</Radio>
                <Radio value="auto">Auto (System)</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item label="Language" name="language">
              <Select>
                <Select.Option value="en">English</Select.Option>
                <Select.Option value="es">Español</Select.Option>
                <Select.Option value="fr">Français</Select.Option>
                <Select.Option value="de">Deutsch</Select.Option>
                <Select.Option value="ja">日本語</Select.Option>
                <Select.Option value="ko">한국어</Select.Option>
                <Select.Option value="zh">中文</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Timezone" name="timezone">
              <Select>
                <Select.Option value="UTC">UTC</Select.Option>
                <Select.Option value="America/New_York">Eastern Time</Select.Option>
                <Select.Option value="America/Chicago">Central Time</Select.Option>
                <Select.Option value="America/Denver">Mountain Time</Select.Option>
                <Select.Option value="America/Los_Angeles">Pacific Time</Select.Option>
                <Select.Option value="Europe/London">London</Select.Option>
                <Select.Option value="Europe/Paris">Paris</Select.Option>
                <Select.Option value="Asia/Tokyo">Tokyo</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Col>
      </Row>
    </Form>
  );
} 