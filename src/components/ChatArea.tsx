import { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Spin, Grid } from 'antd';
import {
  SendOutlined,
  LoadingOutlined,
  PaperClipOutlined,
  FileTextOutlined,
  FileImageOutlined,
  CloseOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { type Message, type FileAttachment } from '../hooks/useChat';

const { Text } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

interface Theme {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string, file?: File) => void;
  isNewChat: boolean;
  isLoading?: boolean;
  isParsingFile?: boolean;
  isExtracting?: boolean;
  isMobile?: boolean;
  onMenuClick?: () => void;
  isDarkMode?: boolean;
  theme?: Theme;
}

const defaultTheme: Theme = {
  bg: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  bgTertiary: '#F5F5F5',
  textPrimary: '#262626',
  textSecondary: '#595959',
  border: '#E8E8E8',
  accent: '#8C8C8C',
};

export default function ChatArea({
  messages,
  onSendMessage,
  isNewChat,
  isLoading = false,
  isParsingFile = false,
  isExtracting = false,
  isMobile = false,
  onMenuClick,
  isDarkMode = false,
  theme = defaultTheme,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screens = useBreakpoint();

  // 반응형 maxWidth
  const getMaxWidth = () => {
    if (screens.xxl) return 900;
    if (screens.xl) return 820;
    if (screens.lg) return 720;
    if (screens.md) return 640;
    return '100%';
  };

  // 반응형 padding
  const getPadding = () => {
    if (screens.lg) return '20px 24px';
    if (screens.md) return '16px 20px';
    return '12px 16px';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if ((inputValue.trim() || attachedFile) && !isLoading && !isParsingFile) {
      onSendMessage(inputValue.trim(), attachedFile || undefined);
      setInputValue('');
      setAttachedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImageOutlined />;
    }
    return <FileTextOutlined />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderFileAttachment = (attachment: FileAttachment) => (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          backgroundColor: theme.bgTertiary,
          borderRadius: 8,
        }}
      >
        {attachment.type.startsWith('image/') ? (
          <FileImageOutlined style={{ color: theme.accent }} />
        ) : (
          <FileTextOutlined style={{ color: theme.accent }} />
        )}
        <Text style={{ fontSize: 12, color: theme.textSecondary }}>{attachment.name}</Text>
      </div>
      {attachment.extractedData && (
        <div
          style={{
            marginTop: 8,
            padding: '10px 12px',
            backgroundColor: isDarkMode ? '#1a2744' : '#F0F7FF',
            borderRadius: 8,
            border: `1px solid ${isDarkMode ? '#2d4a7c' : '#BAE0FF'}`,
          }}
        >
          <Text style={{ fontSize: 11, color: isDarkMode ? '#69b1ff' : '#1677FF', fontWeight: 500 }}>
            📋 추출된 정보
          </Text>
          <div style={{ marginTop: 6 }}>
            {Object.entries(attachment.extractedData).map(([key, value]) => (
              <div key={key} style={{ fontSize: 12, color: theme.textPrimary, marginTop: 4 }}>
                <Text style={{ color: theme.accent }}>{key}:</Text>{' '}
                <Text style={{ color: theme.textPrimary }}>{String(value)}</Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const isDisabled = isLoading || isParsingFile || isExtracting;
  const canSend = (inputValue.trim() || attachedFile) && !isDisabled;
  const maxWidth = getMaxWidth();

  return (
    <main
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.bg,
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: theme.bg,
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 18 }} />}
            onClick={onMenuClick}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.textSecondary,
            }}
          />
          <img
            src="/font_logo.png"
            alt="Logo"
            style={{ height: 22, objectFit: 'contain', filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
          />
        </div>
      )}

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: getPadding(),
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isNewChat && messages.length === 0 ? (
          /* Landing View */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            <img
              src="/logo.svg"
              alt="Solar Logo"
              style={{
                width: isMobile ? 60 : 72,
                height: isMobile ? 60 : 72,
                opacity: 0.9,
              }}
            />
            <Text
              style={{
                fontSize: isMobile ? 20 : 22,
                fontWeight: 500,
                color: theme.textPrimary,
              }}
            >
              무엇을 도와드릴까요?
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.accent,
                textAlign: 'center',
                maxWidth: 360,
                padding: '0 16px',
              }}
            >
              질문을 입력하거나 문서를 업로드하시면 AI가 분석해 드립니다
            </Text>
          </div>
        ) : (
          /* Messages View */
          <div
            style={{
              maxWidth: maxWidth,
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems:
                    message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: isMobile ? '90%' : '80%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    backgroundColor:
                      message.role === 'user'
                        ? (isDarkMode ? '#2A2A2A' : '#F0F0F0')
                        : theme.bgSecondary,
                    border:
                      message.role === 'assistant'
                        ? `1px solid ${theme.border}`
                        : 'none',
                  }}
                >
                  {message.attachment && renderFileAttachment(message.attachment)}
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: theme.textPrimary,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {message.content}
                    {message.role === 'assistant' &&
                      isLoading &&
                      message.id === messages[messages.length - 1]?.id && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 6,
                            height: 16,
                            backgroundColor: theme.textPrimary,
                            marginLeft: 2,
                            animation: 'blink 1s infinite',
                          }}
                        />
                      )}
                  </Text>
                </div>
              </div>
            ))}
            {(isLoading || isParsingFile || isExtracting) && messages[messages.length - 1]?.role === 'user' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    backgroundColor: theme.bgSecondary,
                    border: `1px solid ${theme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 14, color: theme.accent }} spin />
                    }
                  />
                  <Text style={{ fontSize: 13, color: theme.accent }}>
                    {isParsingFile && '문서 분석 중...'}
                    {isExtracting && '정보 추출 중...'}
                  </Text>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: isMobile ? '16px' : '20px 24px 24px',
          backgroundColor: 'transparent',
        }}
      >
        <div
          style={{
            maxWidth: maxWidth,
            margin: '0 auto',
            backgroundColor: theme.bgSecondary,
            borderRadius: 24,
            padding: '12px 16px',
            boxShadow: isDarkMode
              ? '0 2px 12px rgba(0, 0, 0, 0.3)'
              : '0 2px 12px rgba(0, 0, 0, 0.08)',
            border: `1px solid ${theme.border}`,
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          {/* Attached File Preview */}
          {attachedFile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                backgroundColor: theme.bgTertiary,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              {getFileIcon(attachedFile)}
              <Text style={{ fontSize: 13, color: theme.textPrimary, flex: 1 }} ellipsis>
                {attachedFile.name}
              </Text>
              <Text style={{ fontSize: 12, color: theme.accent }}>
                {formatFileSize(attachedFile.size)}
              </Text>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleRemoveFile}
                style={{ color: theme.accent }}
              />
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-end',
            }}
          >
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              style={{ display: 'none' }}
            />
            <Button
              type="text"
              icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              style={{
                height: 36,
                width: 36,
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDisabled ? theme.border : theme.textSecondary,
              }}
            />

            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachedFile ? "파일에 대해 질문하세요..." : "메시지를 입력하세요..."}
              autoSize={{ minRows: 1, maxRows: 5 }}
              disabled={isDisabled}
              style={{
                flex: 1,
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                resize: 'none',
                border: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!canSend}
              style={{
                height: 36,
                width: 36,
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: canSend
                  ? (isDarkMode ? '#888888' : '#262626')
                  : theme.border,
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}
